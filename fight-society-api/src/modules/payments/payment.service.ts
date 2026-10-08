import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import {
  PaymentStatus,
  EnrollmentStatus,
  PaymentMethod,
  Prisma,
} from '@prisma/client';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from './interfaces/payment-repository.interface';
import {
  AsaasApiError,
  AsaasService,
  type AsaasPayment,
  type AsaasWebhookEvent,
} from './asaas.service';
import { PrismaService } from '../../prisma/prisma.service';

/** Days the student has to pay the generated charge. */
const DUE_IN_DAYS = 3;

const PAID_EVENTS = new Set(['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED']);
const FAILED_EVENTS = new Set([
  'PAYMENT_OVERDUE',
  'PAYMENT_DELETED',
  'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED',
]);
const REFUNDED_EVENTS = new Set(['PAYMENT_REFUNDED']);

const METHOD_BY_BILLING_TYPE: Record<string, PaymentMethod> = {
  PIX: PaymentMethod.PIX,
  BOLETO: PaymentMethod.BOLETO,
  CREDIT_CARD: PaymentMethod.CREDIT_CARD,
  DEBIT_CARD: PaymentMethod.DEBIT_CARD,
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly asaasService: AsaasService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.paymentRepository.findAll();
  }

  async findByUserId(userId: string) {
    return this.paymentRepository.findByUserId(userId);
  }

  async findById(id: string) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async createCheckout(userId: string, enrollmentId: string, cpf?: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        plan: true,
        user: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('This enrollment does not belong to you');
    }

    // Reuse an open charge instead of creating duplicates on every click
    const pending = await this.paymentRepository.findPendingByEnrollmentId(enrollmentId);
    if (
      pending?.asaasPaymentId &&
      pending.invoiceUrl &&
      pending.amount.equals(enrollment.plan.price)
    ) {
      return { invoiceUrl: pending.invoiceUrl, paymentId: pending.id };
    }

    const customerId = await this.ensureAsaasCustomer(enrollment.user, cpf);

    const payment = await this.paymentRepository.create({
      userId,
      enrollmentId,
      amount: enrollment.plan.price,
      status: PaymentStatus.PENDING,
    });

    try {
      const charge = await this.createAsaasCharge({
        customer: customerId,
        value: Number(enrollment.plan.price),
        description: `Fight Society - ${enrollment.plan.name}`,
        externalReference: payment.id,
      });

      await this.paymentRepository.update(payment.id, {
        asaasPaymentId: charge.id,
        invoiceUrl: charge.invoiceUrl,
      });

      // Supersede the previous open charge so only one stays pending
      if (pending) {
        await this.paymentRepository.update(pending.id, {
          status: PaymentStatus.FAILED,
        });
      }

      return { invoiceUrl: charge.invoiceUrl, paymentId: payment.id };
    } catch (error) {
      await this.paymentRepository.delete(payment.id);
      throw error;
    }
  }

  async handleAsaasEvent(event: AsaasWebhookEvent) {
    this.logger.log(`Processing Asaas event: ${event.event} (${event.id})`);

    const charge = event.payment;
    if (!charge) return;

    const payment =
      (await this.paymentRepository.findByAsaasPaymentId(charge.id)) ??
      (charge.externalReference
        ? await this.paymentRepository.findById(charge.externalReference)
        : null);

    if (!payment) {
      this.logger.warn(`No local payment for Asaas charge ${charge.id}`);
      return;
    }

    if (PAID_EVENTS.has(event.event)) {
      // Card charges send CONFIRMED and later RECEIVED; only the first one counts
      if (payment.status === PaymentStatus.PAID) return;

      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        asaasPaymentId: charge.id,
        method: METHOD_BY_BILLING_TYPE[charge.billingType] ?? null,
      });
      await this.activateEnrollment(payment.enrollmentId);
      this.logger.log(`Payment ${payment.id} paid, enrollment activated`);
    } else if (FAILED_EVENTS.has(event.event)) {
      if (payment.status === PaymentStatus.PENDING) {
        await this.paymentRepository.update(payment.id, {
          status: PaymentStatus.FAILED,
        });
      }
    } else if (REFUNDED_EVENTS.has(event.event)) {
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.REFUNDED,
      });
    }
  }

  private async ensureAsaasCustomer(
    user: { id: string; name: string; email: string; phone: string | null; cpf: string | null; asaasCustomerId: string | null },
    cpf?: string,
  ): Promise<string> {
    if (user.asaasCustomerId) return user.asaasCustomerId;

    const cpfToUse = user.cpf ?? cpf;
    if (!cpfToUse) {
      throw new BadRequestException(
        'CPF_REQUIRED: Informe seu CPF para gerar a cobrança.',
      );
    }

    if (!user.cpf) {
      try {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { cpf: cpfToUse },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('Este CPF já está cadastrado em outra conta.');
        }
        throw error;
      }
    }

    const customer = await this.asaasService.createCustomer({
      name: user.name,
      email: user.email,
      cpfCnpj: cpfToUse.replace(/\D/g, ''),
      mobilePhone: user.phone?.replace(/\D/g, '') || undefined,
      externalReference: user.id,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { asaasCustomerId: customer.id },
    });

    return customer.id;
  }

  private async createAsaasCharge(params: {
    customer: string;
    value: number;
    description: string;
    externalReference: string;
  }): Promise<AsaasPayment> {
    const dueDate = new Date(Date.now() + DUE_IN_DAYS * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const base = {
      ...params,
      billingType: 'UNDEFINED' as const, // student picks PIX, boleto or card on the invoice
      dueDate,
    };

    const successUrl = this.getSuccessUrl();
    if (!successUrl) {
      return this.asaasService.createPayment(base);
    }

    try {
      return await this.asaasService.createPayment({
        ...base,
        callback: { successUrl, autoRedirect: true },
      });
    } catch (error) {
      // Asaas rejects callbacks whose domain isn't registered on the account
      if (error instanceof AsaasApiError && error.httpStatus === 400) {
        this.logger.warn(`Retrying Asaas charge without callback: ${error.message}`);
        return this.asaasService.createPayment(base);
      }
      throw error;
    }
  }

  /** Asaas only accepts public https callback URLs. */
  private getSuccessUrl(): string | null {
    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl?.startsWith('https://')) return null;
    return `${frontendUrl.replace(/\/$/, '')}/?payment=success`;
  }

  private async activateEnrollment(enrollmentId: string) {
    try {
      await this.prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: EnrollmentStatus.ACTIVE,
          startDate: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Error activating enrollment ${enrollmentId}:`, error);
    }
  }
}
