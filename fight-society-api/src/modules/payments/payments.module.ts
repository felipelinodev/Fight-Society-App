import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { AsaasWebhookController } from './asaas-webhook.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { AsaasService } from './asaas.service';
import { PAYMENT_REPOSITORY } from './interfaces/payment-repository.interface';

@Module({
  controllers: [PaymentController, AsaasWebhookController],
  providers: [
    PaymentService,
    AsaasService,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
  ],
  exports: [PaymentService, AsaasService],
})
export class PaymentsModule {}
