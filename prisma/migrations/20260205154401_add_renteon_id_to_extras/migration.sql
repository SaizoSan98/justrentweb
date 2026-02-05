/*
  Warnings:

  - A unique constraint covering the columns `[renteonId]` on the table `Extra` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[renteonId]` on the table `InsurancePlan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Extra" ADD COLUMN     "code" TEXT,
ADD COLUMN     "renteonId" TEXT;

-- AlterTable
ALTER TABLE "InsurancePlan" ADD COLUMN     "code" TEXT,
ADD COLUMN     "renteonId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Extra_renteonId_key" ON "Extra"("renteonId");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePlan_renteonId_key" ON "InsurancePlan"("renteonId");
