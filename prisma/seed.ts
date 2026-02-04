import { PrismaClient, CarStatus, Role, Transmission, FuelType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data
  await prisma.booking.deleteMany()
  await prisma.damageReport.deleteMany()
  await prisma.carInsurance.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.pricingTier.deleteMany()
  await prisma.car.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  // Create Super Admin
  const adminPassword = 'admin' // Stored as plain text per current app logic
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@justrent.com',
      name: 'Super Admin',
      password: adminPassword,
      role: Role.SUPERADMIN,
      phone: '+3612345678',
    }
  })
  console.log(`Created Super Admin: ${superAdmin.email}`)

  // Create Demo Cars (Exactly 2 as requested)
  const cars = [
    {
      make: 'Mercedes-Benz',
      model: 'GLB',
      year: 2024,
      licensePlate: 'DEMO-001',
      mileage: 5000,
      categories: ['SUV', 'Luxury'],
      pricePerDay: 120,
      status: CarStatus.AVAILABLE,
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80',
      features: ['Automatic', 'GPS', 'Leather Seats', 'Heated Seats', 'Bluetooth'],
      seats: 7,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      description: 'The Mercedes-Benz GLB is a versatile compact SUV with optional third-row seating, offering a blend of rugged capability and refined luxury.'
    },
    {
      make: 'Toyota',
      model: 'Corolla',
      year: 2023,
      licensePlate: 'DEMO-002',
      mileage: 12000,
      categories: ['Economy', 'Hybrid'],
      pricePerDay: 45,
      status: CarStatus.AVAILABLE,
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&q=80',
      features: ['Automatic', 'Hybrid', 'CarPlay', 'Rear Camera'],
      seats: 5,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.HYBRID,
      description: 'The Toyota Corolla Hybrid offers excellent fuel economy and a comfortable ride, making it perfect for city driving and longer trips.'
    }
  ]

  for (const car of cars) {
    const { categories, ...carData } = car
    const createdCar = await prisma.car.create({
      data: {
        ...carData,
        categories: {
          connectOrCreate: categories.map((cat) => ({
            where: { slug: cat.toLowerCase() },
            create: { name: cat, slug: cat.toLowerCase() },
          })),
        },
      },
    })
    console.log(`Created car with id: ${createdCar.id}`)

    // Pricing tiers per car
    await prisma.pricingTier.createMany({
      data: [
        {
          carId: createdCar.id,
          minDays: 1,
          maxDays: 2,
          pricePerDay: car.pricePerDay,
          deposit: 200,
        },
        {
          carId: createdCar.id,
          minDays: 3,
          maxDays: 6,
          pricePerDay: Number(car.pricePerDay) * 0.95,
          deposit: 180,
        },
        {
          carId: createdCar.id,
          minDays: 7,
          maxDays: 14,
          pricePerDay: Number(car.pricePerDay) * 0.9,
          deposit: 160,
        },
        {
          carId: createdCar.id,
          minDays: 15,
          maxDays: null,
          pricePerDay: Number(car.pricePerDay) * 0.85,
          deposit: 140,
        },
      ],
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
