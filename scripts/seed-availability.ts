
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding availability for all cars...');

  try {
    // 1. Get all cars
    const cars = await prisma.car.findMany();
    console.log(`Found ${cars.length} cars.`);

    if (cars.length === 0) {
      console.log('No cars found. Please seed cars first.');
      return;
    }

    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    // 2. Create availability for each car
    for (const car of cars) {
      // Check if availability already exists to avoid duplicates (optional, but good practice)
      // For simplicity in this "fix-it-now" script, we'll just create a new one covering the whole year
      // or we can delete existing future availabilities and create a fresh one.
      
      // Let's delete existing availabilities for simplicity to ensure clean state
      await prisma.availability.deleteMany({
        where: {
          carId: car.id,
        },
      });

      await prisma.availability.create({
        data: {
          carId: car.id,
          startDate: today,
          endDate: nextYear,
          status: 'AVAILABLE', // Assuming 'AVAILABLE' is a valid enum value based on schema
        },
      });
      console.log(`Created availability for car: ${car.make} ${car.model}`);
    }

    console.log('Availability seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
