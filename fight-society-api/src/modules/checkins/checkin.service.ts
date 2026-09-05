import { Injectable, BadRequestException } from '@nestjs/common';
import { CheckInRepository } from './checkin.repository';

@Injectable()
export class CheckInService {
  constructor(private readonly checkInRepository: CheckInRepository) {}

  async create(data: {
    userId: string;
    enrollmentId: string;
    note?: string;
  }) {
    return this.checkInRepository.create(data);
  }

  async findByUserId(userId: string) {
    return this.checkInRepository.findByUserId(userId);
  }

  async findAll(filters?: { userId?: string; date?: string }) {
    return this.checkInRepository.findAll(filters);
  }

  async countByUserId(userId: string) {
    return this.checkInRepository.countByUserId(userId);
  }
}
