import { Enrollment, EnrollmentStatus } from '@prisma/client';

export interface IEnrollmentRepository {
  findAll(): Promise<Enrollment[]>;
  findByStatus(status: EnrollmentStatus): Promise<Enrollment[]>;
  findByUserId(userId: string): Promise<Enrollment[]>;
  findById(id: string): Promise<Enrollment | null>;
  findByIdWithRelations(id: string): Promise<any>;
  create(data: Partial<Enrollment>): Promise<Enrollment>;
  update(id: string, data: Partial<Enrollment>): Promise<Enrollment>;
}

export const ENROLLMENT_REPOSITORY = Symbol('ENROLLMENT_REPOSITORY');
