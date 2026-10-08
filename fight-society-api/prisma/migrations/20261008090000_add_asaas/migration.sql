-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'BOLETO';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "asaas_customer_id" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN "asaas_payment_id" TEXT,
ADD COLUMN "invoice_url" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_asaas_customer_id_key" ON "users"("asaas_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_asaas_payment_id_key" ON "payments"("asaas_payment_id");
