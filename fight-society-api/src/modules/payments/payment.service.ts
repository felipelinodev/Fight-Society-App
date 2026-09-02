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

    // Determine safe base URL for Stripe redirect
    const corsOrigin = process.env.CORS_ORIGIN;
    let baseUrl = 'http://localhost:3001';

    if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.startsWith('http')) {
      baseUrl = process.env.FRONTEND_URL;
    } else if (corsOrigin && corsOrigin !== '*' && corsOrigin.startsWith('http')) {
      baseUrl = corsOrigin;
    } else if (corsOrigin && corsOrigin !== '*' && !corsOrigin.startsWith('http')) {
      baseUrl = `https://${corsOrigin}`;
    }

    // Create checkout session
    const session = await this.stripeService.createCheckoutSession({
      customerId: stripeCustomerId,
      priceAmount: Number(enrollment.plan.price),
      productName: enrollment.plan.name,
      enrollmentId,
      successUrl: `${baseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/?payment=cancel`,
    });

    // Create pending payment record
    await this.paymentRepository.create({
      userId,
      enrollmentId,
      amount: enrollment.plan.price,
      status: PaymentStatus.PENDING,
      stripeCheckoutSessionId: session.id,
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

      case 'checkout.session.async_payment_succeeded': {
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

    let existingPayment = await this.paymentRepository.findByStripeCheckoutSessionId(session.id);

    if (!existingPayment && session.payment_intent) {
      existingPayment = await this.paymentRepository.findByStripePaymentIntentId(
        session.payment_intent as string,
      );
    }

    // Fallback also repairs payments created before the checkout session ID was stored.
    if (!existingPayment) {
      existingPayment = await this.paymentRepository.findPendingByEnrollmentId(enrollmentId);
    }

    if (existingPayment) {
      await this.paymentRepository.update(existingPayment.id, {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        ...(session.payment_intent
          ? { stripePaymentIntentId: session.payment_intent as string }
          : {}),
      });
    }

    // Activate enrollment upon confirmed payment
    await this.activateEnrollment(enrollmentId);

    this.logger.log(
      `Checkout completed & enrollment activated: ${enrollmentId}`,
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

      await this.activateEnrollment(payment.enrollmentId);

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
