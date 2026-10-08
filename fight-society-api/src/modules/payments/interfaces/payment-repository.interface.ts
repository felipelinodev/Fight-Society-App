import { Payment } from '@prisma/client';

export interface IPaymentRepository {
  findAll(): Promise<Payment[]>;
  findByUserId(userId: string): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;
  findByAsaasPaymentId(asaasPaymentId: string): Promise<Payment | null>;
  findPendingByEnrollmentId(enrollmentId: string): Promise<Payment | null>;
  create(data: Partial<Payment>): Promise<Payment>;
  update(id: string, data: Partial<Payment>): Promise<Payment>;
  delete(id: string): Promise<Payment>;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');
