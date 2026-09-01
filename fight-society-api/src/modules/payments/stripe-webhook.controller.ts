import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { StripeService } from './stripe.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller('payments')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
  ) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      this.logger.error('No raw body found in request');
      return res.status(400).json({ error: 'No raw body' });
    }

    try {
      const event = this.stripeService.constructWebhookEvent(
        req.rawBody,
        signature,
      );

      await this.paymentService.handleWebhookEvent(event);

      return res.json({ received: true });
    } catch (err) {
      this.logger.error(
        `Webhook error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      return res
        .status(400)
        .json({
          error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}`,
        });
    }
  }
}
