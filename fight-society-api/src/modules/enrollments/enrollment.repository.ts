import { Injectable } from '@nestjs/common';
import { Enrollment, EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IEnrollmentRepository } from './interfaces/enrollment-repository.interface';

@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: EnrollmentStatus): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      where: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: string): Promise<Enrollment[]> {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Enrollment | null> {
    return this.prisma.enrollment.findUnique({
      where: { id },
    });
  }

  async findByIdWithRelations(id: string): Promise<any> {
    return this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: Partial<Enrollment>): Promise<Enrollment> {
    return this.prisma.enrollment.create({
      data: data as any,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: true,
      },
    });
  }

  async update(id: string, data: Partial<Enrollment>): Promise<Enrollment> {
    return this.prisma.enrollment.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: true,
      },
    });
  }
}
