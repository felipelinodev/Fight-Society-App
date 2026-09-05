import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPlanId(planId: string) {
    return this.prisma.planSchedule.findMany({
      where: { planId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findAll() {
    return this.prisma.planSchedule.findMany({
      include: { plan: { select: { id: true, name: true, martialArt: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(data: {
    planId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    instructor?: string;
  }) {
    return this.prisma.planSchedule.create({
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.planSchedule.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return this.prisma.planSchedule.findUnique({
      where: { id },
    });
  }
}
