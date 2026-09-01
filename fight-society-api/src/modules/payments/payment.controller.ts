import {
  Controller,
  Get,
  Post,
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
import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/payment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all payments (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payments list retrieved' })
  async findAll() {
    return this.paymentService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'List current user payments' })
  @ApiResponse({ status: 200, description: 'User payments retrieved' })
  async findMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.findById(id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session for enrollment payment' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created — returns URL',
  })
  async createCheckout(
    @CurrentUser('id') userId: string,
    @Body() createCheckoutDto: CreateCheckoutDto,
  ) {
    return this.paymentService.createCheckoutSession(
      userId,
      createCheckoutDto.enrollmentId,
    );
  }
}
