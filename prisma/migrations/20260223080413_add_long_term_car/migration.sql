-- CreateTable
CREATE TABLE "LongTermCar" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "monthlyPrice" DECIMAL(65,30) NOT NULL,
    "deposit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "description" TEXT,
    "features" TEXT[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "transmission" "Transmission" NOT NULL DEFAULT 'MANUAL',
    "fuelType" "FuelType" NOT NULL DEFAULT 'PETROL',
    "seats" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LongTermCar_pkey" PRIMARY KEY ("id")
);
