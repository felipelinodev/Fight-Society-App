-- Store the Checkout Session ID because payment_intent can be null when the checkout is created.
ALTER TABLE "payments" ADD COLUMN "stripe_checkout_session_id" TEXT;

CREATE UNIQUE INDEX "payments_stripe_checkout_session_id_key"
ON "payments"("stripe_checkout_session_id");
