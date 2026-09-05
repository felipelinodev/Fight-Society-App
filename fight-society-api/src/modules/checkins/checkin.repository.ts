import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CheckInRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    enrollmentId: string;
    note?: string;
  }) {
    return this.prisma.checkIn.create({
      data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        enrollment: { include: { plan: true } },
      },
    });
  }

  async findByUserId(userId: string, limit = 50) {
    return this.prisma.checkIn.findMany({
      where: { userId },
      include: {
        enrollment: { include: { plan: { select: { id: true, name: true, martialArt: true } } } },
      },
      orderBy: { checkedInAt: 'desc' },
      take: limit,
    });
  }

  async findAll(filters?: { userId?: string; date?: string }, limit = 100) {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.checkedInAt = { gte: start, lte: end };
    }

    return this.prisma.checkIn.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        enrollment: { include: { plan: { select: { id: true, name: true, martialArt: true } } } },
      },
      orderBy: { checkedInAt: 'desc' },
      take: limit,
    });
  }

  async countByUserId(userId: string) {
    return this.prisma.checkIn.count({ where: { userId } });
  }
}
