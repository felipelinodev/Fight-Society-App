import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { AsaasService, type AsaasWebhookEvent } from './asaas.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller('payments')
export class AsaasWebhookController {
  private readonly logger = new Logger(AsaasWebhookController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly asaasService: AsaasService,
  ) {}

  @Public()
  @Post('webhook/asaas')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Headers('asaas-access-token') token: string | undefined,
    @Body() event: AsaasWebhookEvent,
  ) {
    if (!this.asaasService.isValidWebhookToken(token)) {
      this.logger.warn('Rejected Asaas webhook with invalid access token');
      throw new UnauthorizedException('Invalid webhook token');
    }

    await this.paymentService.handleAsaasEvent(event);
    return { received: true };
  }
}
