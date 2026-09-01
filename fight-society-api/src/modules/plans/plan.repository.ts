import { Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IPlanRepository } from './interfaces/plan-repository.interface';

@Injectable()
export class PlanRepository implements IPlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = false): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Plan | null> {
    return this.prisma.plan.findUnique({
      where: { id },
    });
  }

  async create(data: Partial<Plan>): Promise<Plan> {
    return this.prisma.plan.create({
      data: data as any,
    });
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan> {
    return this.prisma.plan.update({
      where: { id },
      data,
    });
  }
}
