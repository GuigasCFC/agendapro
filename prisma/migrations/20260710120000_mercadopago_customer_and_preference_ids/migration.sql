-- RenameColumn
ALTER TABLE "Organization" RENAME COLUMN "asaasCustomerId" TO "mercadoPagoCustomerId";
ALTER INDEX "Organization_asaasCustomerId_key" RENAME TO "Organization_mercadoPagoCustomerId_key";

-- RenameColumn
ALTER TABLE "Subscription" RENAME COLUMN "asaasSubscriptionId" TO "mercadoPagoPreferenceId";
