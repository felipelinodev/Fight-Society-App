import {
  Controller,
  Get,
  Post,
  Patch,
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
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all enrollments (Admin only)' })
  @ApiResponse({ status: 200, description: 'Enrollments list retrieved' })
  async findAll() {
    return this.enrollmentService.findAll();
  }

  @Get('active')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List active enrollments (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Active enrollments list retrieved',
  })
  async findActive() {
    return this.enrollmentService.findActive();
  }

  @Get('my')
  @ApiOperation({ summary: 'List current user enrollments' })
  @ApiResponse({
    status: 200,
    description: 'User enrollments list retrieved',
  })
  async findMyEnrollments(@CurrentUser('id') userId: string) {
    return this.enrollmentService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create enrollment - enroll student in plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Enrollment created' })
  @ApiResponse({ status: 409, description: 'Student already enrolled in this plan' })
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(
      createEnrollmentDto.userId,
      createEnrollmentDto.planId,
    );
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate enrollment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Enrollment deactivated' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.deactivate(id);
  }

  @Patch(':id/reactivate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reactivate enrollment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Enrollment reactivated' })
  async reactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentService.reactivate(id);
  }
}
