import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { StripeService } from './stripe.service';
import { PAYMENT_REPOSITORY } from './interfaces/payment-repository.interface';

@Module({
  controllers: [PaymentController, StripeWebhookController],
  providers: [
    PaymentService,
    StripeService,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
  ],
  exports: [PaymentService, StripeService],
})
export class PaymentsModule {}
