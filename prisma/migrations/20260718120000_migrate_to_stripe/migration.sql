-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "mercadoPagoCustomerId";

-- AlterTable
ALTER TABLE "Subscription"
  DROP COLUMN "paymentProvider",
  DROP COLUMN "paymentCustomerId",
  DROP COLUMN "paymentSubscriptionId",
  ADD COLUMN "stripeCustomerId" TEXT,
  ADD COLUMN "stripeSubscriptionId" TEXT,
  ADD COLUMN "stripePriceId" TEXT;
