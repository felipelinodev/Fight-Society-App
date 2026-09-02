import { Payment } from '@prisma/client';

export interface IPaymentRepository {
  findAll(): Promise<Payment[]>;
  findByUserId(userId: string): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  findByStripePaymentIntentId(paymentIntentId: string): Promise<Payment | null>;
  findByStripeCheckoutSessionId(sessionId: string): Promise<Payment | null>;
  findPendingByEnrollmentId(enrollmentId: string): Promise<Payment | null>;
  findByStripeInvoiceId(invoiceId: string): Promise<Payment | null>;
  create(data: Partial<Payment>): Promise<Payment>;
  update(id: string, data: Partial<Payment>): Promise<Payment>;
  updateByStripePaymentIntentId(
    paymentIntentId: string,
    data: Partial<Payment>,
  ): Promise<Payment>;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
