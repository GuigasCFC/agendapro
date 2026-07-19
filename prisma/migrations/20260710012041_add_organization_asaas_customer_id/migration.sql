-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "asaasCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_asaasCustomerId_key" ON "Organization"("asaasCustomerId");
