import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { PlanRepository } from './plan.repository';
import { PLAN_REPOSITORY } from './interfaces/plan-repository.interface';

@Module({
  controllers: [PlanController],
  providers: [
    PlanService,
    {
      provide: PLAN_REPOSITORY,
      useClass: PlanRepository,
    },
  ],
  exports: [PlanService],
})
export class PlansModule {}
