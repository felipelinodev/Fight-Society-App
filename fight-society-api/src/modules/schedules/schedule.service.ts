import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';
import { UpdateScheduleDto } from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  async findByPlanId(planId: string) {
    return this.scheduleRepository.findByPlanId(planId);
  }

  async findAll() {
    return this.scheduleRepository.findAll();
  }

  async create(
    planId: string,
    data: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      instructor?: string;
      note?: string;
    },
  ) {
    return this.scheduleRepository.create({ planId, ...data });
  }

  async update(id: string, data: UpdateScheduleDto) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return this.scheduleRepository.update(id, data);
  }

  async delete(id: string) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return this.scheduleRepository.delete(id);
  }
}
