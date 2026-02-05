/*
  Warnings:

  - You are about to drop the column `category` on the `Car` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vin]` on the table `Car` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[renteonId]` on the table `Car` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SUPERADMIN';
ALTER TYPE "Role" ADD VALUE 'PARTNER';

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "comments" TEXT,
ADD COLUMN     "companyAddress" TEXT,
ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "companyTaxId" TEXT,
ADD COLUMN     "dropoffLocation" TEXT NOT NULL DEFAULT 'Budapest Airport',
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "flightNumber" TEXT,
ADD COLUMN     "fullInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "insurancePlanId" TEXT,
ADD COLUMN     "isCompany" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'CASH_ON_SITE',
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "pickupLocation" TEXT NOT NULL DEFAULT 'Budapest Airport',
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "category",
ADD COLUMN     "airConditioning" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contractFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "dailyMileageLimit" INTEGER,
ADD COLUMN     "deposit" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "doors" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "extraKmPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "fuelPolicy" TEXT NOT NULL DEFAULT 'FULL_TO_FULL',
ADD COLUMN     "fuelType" "FuelType" NOT NULL DEFAULT 'PETROL',
ADD COLUMN     "fullInsurancePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orSimilar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickupAfterHoursPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "registrationFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "renteonId" TEXT,
ADD COLUMN     "returnAfterHoursPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "seats" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "suitcases" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "transmission" "Transmission" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "unlimitedMileagePrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "vin" TEXT,
ADD COLUMN     "winterizationFee" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "taxId" TEXT;

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'settings',
    "openingTime" TEXT NOT NULL DEFAULT '08:00',
    "closingTime" TEXT NOT NULL DEFAULT '18:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "weeklyHours" JSONB,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Extra" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "priceType" TEXT NOT NULL DEFAULT 'PER_DAY',
    "icon" TEXT,

    CONSTRAINT "Extra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarInsurance" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "pricePerDay" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "deposit" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "CarInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CarToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_BookingToExtra" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CarInsurance_carId_planId_key" ON "CarInsurance"("carId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_entityId_entityType_field_language_key" ON "Translation"("entityId", "entityType", "field", "language");

-- CreateIndex
CREATE UNIQUE INDEX "_CarToCategory_AB_unique" ON "_CarToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_CarToCategory_B_index" ON "_CarToCategory"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BookingToExtra_AB_unique" ON "_BookingToExtra"("A", "B");

-- CreateIndex
CREATE INDEX "_BookingToExtra_B_index" ON "_BookingToExtra"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Car_vin_key" ON "Car"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Car_renteonId_key" ON "Car"("renteonId");

-- AddForeignKey
ALTER TABLE "CarInsurance" ADD CONSTRAINT "CarInsurance_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarInsurance" ADD CONSTRAINT "CarInsurance_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InsurancePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_insurancePlanId_fkey" FOREIGN KEY ("insurancePlanId") REFERENCES "InsurancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarToCategory" ADD CONSTRAINT "_CarToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarToCategory" ADD CONSTRAINT "_CarToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingToExtra" ADD CONSTRAINT "_BookingToExtra_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingToExtra" ADD CONSTRAINT "_BookingToExtra_B_fkey" FOREIGN KEY ("B") REFERENCES "Extra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
