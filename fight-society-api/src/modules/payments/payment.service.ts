import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PaymentStatus, EnrollmentStatus } from '@prisma/client';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from './interfaces/payment-repository.interface';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly stripeService: StripeService,
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

  async createCheckoutSession(userId: string, enrollmentId: string) {
    // Get enrollment with plan and user data
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
      throw new BadRequestException(
        'This enrollment does not belong to you',
      );
    }

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('Enrollment is not active');
    }

    // Ensure user has a Stripe customer ID
    let stripeCustomerId = enrollment.user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripeService.createCustomer(
        enrollment.user.email,
        enrollment.user.name,
      );
      stripeCustomerId = customer.id;

      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession({
      customerId: stripeCustomerId,
      priceAmount: Number(enrollment.plan.price),
      productName: enrollment.plan.name,
      enrollmentId,
      successUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
    });

    // Create pending payment record
    await this.paymentRepository.create({
      userId,
      enrollmentId,
      amount: enrollment.plan.price,
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: session.payment_intent as string,
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async handleWebhookEvent(event: Stripe.Event) {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const enrollmentId = session.metadata?.enrollmentId;

    if (!enrollmentId) {
      this.logger.warn('No enrollmentId in checkout session metadata');
      return;
    }

    if (session.payment_intent) {
      const paymentIntentId = session.payment_intent as string;
      const existingPayment =
        await this.paymentRepository.findByStripePaymentIntentId(
          paymentIntentId,
        );

      if (existingPayment) {
        await this.paymentRepository.update(existingPayment.id, {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        });
      }
    }

    this.logger.log(
      `Checkout completed for enrollment: ${enrollmentId}`,
    );
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (payment) {
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      });

      this.logger.log(`Payment succeeded: ${payment.id}`);
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this.paymentRepository.findByStripePaymentIntentId(
      paymentIntent.id,
    );

    if (payment) {
      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.FAILED,
      });

      this.logger.log(`Payment failed: ${payment.id}`);
    }
  }
}
