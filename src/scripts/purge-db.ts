
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function purgeDatabase() {
    console.log("⚠️  STARTING FULL DATABASE PURGE (CAR RELATED DATA) ⚠️");
    
    // Order matters due to foreign keys
    
    // 1. Delete Dependencies first
    console.log("Deleting Bookings...");
    await prisma.booking.deleteMany({});
    
    console.log("Deleting Damage Reports...");
    await prisma.damageReport.deleteMany({});
    
    console.log("Deleting Availabilities...");
    await prisma.availability.deleteMany({});
    
    console.log("Deleting Car Insurances...");
    await prisma.carInsurance.deleteMany({});
    
    console.log("Deleting Pricing Tiers...");
    await prisma.pricingTier.deleteMany({});
    
    // 2. Delete Main Entities
    console.log("Deleting Cars...");
    await prisma.car.deleteMany({});
    
    console.log("Deleting Extras...");
    await prisma.extra.deleteMany({});
    
    console.log("Deleting Categories (optional, but cleaner)...");
    await prisma.category.deleteMany({});
    
    console.log("Deleting Insurance Plans...");
    await prisma.insurancePlan.deleteMany({});

    console.log("✅ PURGE COMPLETE. Database is clean.");
}

purgeDatabase()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
