import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CheckInService } from './checkin.service';
import { CreateCheckInDto } from './dto/checkin.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('CheckIns')
@ApiBearerAuth()
@Controller('checkins')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Register a check-in for a student (Admin only)' })
  @ApiResponse({ status: 201, description: 'Check-in registered' })
  async create(@Body() dto: CreateCheckInDto) {
    return this.checkInService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List check-ins with optional filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Check-ins list retrieved' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('date') date?: string,
  ) {
    return this.checkInService.findAll({ userId, date });
  }

  @Get('my')
  @ApiOperation({ summary: 'List current user check-ins' })
  @ApiResponse({ status: 200, description: 'User check-ins retrieved' })
  async findMy(@CurrentUser('id') userId: string) {
    return this.checkInService.findByUserId(userId);
  }
}
