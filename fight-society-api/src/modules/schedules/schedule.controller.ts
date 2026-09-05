import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/schedule.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller()
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Public()
  @Get('schedules')
  @ApiOperation({ summary: 'List all schedules' })
  @ApiResponse({ status: 200, description: 'All schedules retrieved' })
  async findAll() {
    return this.scheduleService.findAll();
  }

  @Public()
  @Get('plans/:planId/schedules')
  @ApiOperation({ summary: 'List schedules for a plan' })
  @ApiResponse({ status: 200, description: 'Plan schedules retrieved' })
  async findByPlan(@Param('planId', ParseUUIDPipe) planId: string) {
    return this.scheduleService.findByPlanId(planId);
  }

  @Post('plans/:planId/schedules')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add schedule to a plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Schedule created' })
  async create(
    @Param('planId', ParseUUIDPipe) planId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.create(planId, dto);
  }

  @Delete('schedules/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a schedule (Admin only)' })
  @ApiResponse({ status: 200, description: 'Schedule deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.scheduleService.delete(id);
  }
}
