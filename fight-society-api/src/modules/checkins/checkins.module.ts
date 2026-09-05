import { Module } from '@nestjs/common';
import { CheckInController } from './checkin.controller';
import { CheckInService } from './checkin.service';
import { CheckInRepository } from './checkin.repository';

@Module({
  controllers: [CheckInController],
  providers: [CheckInService, CheckInRepository],
  exports: [CheckInService],
})
export class CheckInsModule {}
