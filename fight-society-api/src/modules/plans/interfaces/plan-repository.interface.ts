import { Plan } from '@prisma/client';

export interface IPlanRepository {
  findAll(activeOnly?: boolean): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  create(data: Partial<Plan>): Promise<Plan>;
  update(id: string, data: Partial<Plan>): Promise<Plan>;
}

export const PLAN_REPOSITORY = Symbol('PLAN_REPOSITORY');
