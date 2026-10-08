import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IPaymentRepository } from './interfaces/payment-repository.interface';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        enrollment: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        enrollment: {
          include: { plan: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        enrollment: {
          include: { plan: true },
        },
      },
    });
  }

  async findByAsaasPaymentId(asaasPaymentId: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { asaasPaymentId },
    });
  }

  async findPendingByEnrollmentId(enrollmentId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { enrollmentId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    return this.prisma.payment.create({
      data: data as any,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        enrollment: {
          include: { plan: true },
        },
      },
    });
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Payment> {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
