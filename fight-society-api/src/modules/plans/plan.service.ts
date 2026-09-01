import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IPlanRepository,
  PLAN_REPOSITORY,
} from './interfaces/plan-repository.interface';

@Injectable()
export class PlanService {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: IPlanRepository,
  ) {}

  async findAll(activeOnly = true) {
    return this.planRepository.findAll(activeOnly);
  }

  async findById(id: string) {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async create(data: {
    name: string;
    description?: string;
    martialArt: string;
    price: number;
    durationDays: number;
    stripePriceId?: string;
  }) {
    return this.planRepository.create({
      ...data,
      price: data.price as any,
      martialArt: data.martialArt as any,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      durationDays?: number;
      stripePriceId?: string;
      active?: boolean;
    },
  ) {
    await this.findById(id);
    return this.planRepository.update(id, {
      ...data,
      price: data.price !== undefined ? (data.price as any) : undefined,
    });
  }

  async deactivate(id: string) {
    await this.findById(id);
    return this.planRepository.update(id, { active: false });
  }
}
