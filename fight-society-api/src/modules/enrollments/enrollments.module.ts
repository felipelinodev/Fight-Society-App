import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentRepository } from './enrollment.repository';
import { ENROLLMENT_REPOSITORY } from './interfaces/enrollment-repository.interface';
import { PlansModule } from '../plans/plans.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PlansModule, UsersModule],
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    {
      provide: ENROLLMENT_REPOSITORY,
      useClass: EnrollmentRepository,
    },
  ],
  exports: [EnrollmentService],
})
export class EnrollmentsModule {}
