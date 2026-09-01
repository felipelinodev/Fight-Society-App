import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import {
  IEnrollmentRepository,
  ENROLLMENT_REPOSITORY,
} from './interfaces/enrollment-repository.interface';
import { PlanService } from '../plans/plan.service';
import { UserService } from '../users/user.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @Inject(ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly planService: PlanService,
    private readonly userService: UserService,
  ) {}

  async findAll() {
    return this.enrollmentRepository.findAll();
  }

  async findActive() {
    return this.enrollmentRepository.findByStatus(EnrollmentStatus.ACTIVE);
  }

  async findByUserId(userId: string) {
    return this.enrollmentRepository.findByUserId(userId);
  }

  async findById(id: string) {
    const enrollment =
      await this.enrollmentRepository.findByIdWithRelations(id);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    return enrollment;
  }

  async create(userId: string, planId: string, status: EnrollmentStatus = EnrollmentStatus.INACTIVE) {
    // Validate user exists
    await this.userService.findById(userId);

    // Validate plan exists and is active
    const plan = await this.planService.findById(planId);
    if (!plan.active) {
      throw new BadRequestException('This plan is no longer available');
    }

    // Check for existing active enrollment in the same plan
    const userEnrollments =
      await this.enrollmentRepository.findByUserId(userId);
    const existingActive = userEnrollments.find(
      (e) => e.planId === planId && e.status === EnrollmentStatus.ACTIVE,
    );

    if (existingActive) {
      throw new ConflictException(
        'User already has an active enrollment in this plan',
      );
    }

    // Check for existing pending enrollment to reuse
    const existingPending = userEnrollments.find(
      (e) => e.planId === planId && e.status === EnrollmentStatus.INACTIVE,
    );

    if (existingPending) {
      return existingPending;
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    return this.enrollmentRepository.create({
      userId,
      planId,
      status,
      startDate,
      endDate,
    });
  }

  async deactivate(id: string) {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.INACTIVE) {
      throw new BadRequestException('Enrollment is already inactive');
    }

    return this.enrollmentRepository.update(id, {
      status: EnrollmentStatus.INACTIVE,
      endDate: new Date(),
    });
  }

  async reactivate(id: string) {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('Enrollment is already active');
    }

    // Recalculate end date based on plan duration
    const plan = await this.planService.findById(enrollment.planId);
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    return this.enrollmentRepository.update(id, {
      status: EnrollmentStatus.ACTIVE,
      startDate,
      endDate,
    });
  }
}
