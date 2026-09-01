import {
  Controller,
  Get,
  Post,
  Put,
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
import { PlanService } from './plan.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Plans')
@ApiBearerAuth()
@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @ApiOperation({ summary: 'List all active plans' })
  @ApiResponse({ status: 200, description: 'Plans list retrieved' })
  async findAll() {
    return this.planService.findAll(true);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all plans including inactive (Admin only)' })
  @ApiResponse({ status: 200, description: 'All plans retrieved' })
  async findAllIncludingInactive() {
    return this.planService.findAll(false);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan retrieved' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.planService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new plan (Admin only)' })
  @ApiResponse({ status: 201, description: 'Plan created' })
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate a plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan deactivated' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.planService.deactivate(id);
  }
}
