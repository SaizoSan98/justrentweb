import { PrismaClient, CarStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean up existing data
  await prisma.booking.deleteMany()
  await prisma.damageReport.deleteMany()
  await prisma.car.deleteMany()
  await prisma.user.deleteMany()

  // Create Cars
  const cars = [
    {
      make: 'BMW',
      model: 'X5',
      year: 2024,
      licensePlate: 'AA-001-AA',
      mileage: 5000,
      category: 'SUV',
      pricePerDay: 120,
      status: CarStatus.AVAILABLE,
      imageUrl: 'https://images.unsplash.com/photo-1555215696-99ac45e43d34?auto=format&fit=crop&q=80',
      features: ['Automatic', 'GPS', 'Leather Seats', 'Heated Seats', 'Bluetooth'],
    },
    {
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2023,
      licensePlate: 'AA-002-BB',
      mileage: 12000,
      category: 'Sedan',
      pricePerDay: 145,
      status: CarStatus.AVAILABLE,
      imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80',
      features: ['Automatic', 'Sunroof', 'Cruise Control', 'Parking Sensors'],
    },
    {
      make: 'Audi',
      model: 'A5',
      year: 2024,
      licensePlate: 'AA-003-CC',
      mileage: 3500,
      category: 'Coupe',
      pricePerDay: 130,
      status: CarStatus.RENTED,
      imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80',
      features: ['Automatic', 'Sport Package', 'Bang & Olufsen Sound', 'Virtual Cockpit'],
    },
    {
      make: 'Tesla',
      model: 'Model 3',
      year: 2023,
      licensePlate: 'AA-004-DD',
      mileage: 8000,
      category: 'Electric',
      pricePerDay: 110,
      status: CarStatus.AVAILABLE,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80',
      features: ['Autopilot', 'Electric', 'Premium Connectivity', 'Glass Roof'],
    },
     {
      make: 'Porsche',
      model: '911 Carrera',
      year: 2022,
      licensePlate: 'AA-005-EE',
      mileage: 15000,
      category: 'Sports',
      pricePerDay: 350,
      status: CarStatus.MAINTENANCE,
      imageUrl: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80',
      features: ['Automatic', 'Sport Chrono', 'Leather Interior', 'Bose Sound'],
    },
  ]

  for (const car of cars) {
    const createdCar = await prisma.car.create({
      data: car,
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
          maxDays: 30,
          pricePerDay: Number(car.pricePerDay) * 0.85,
          deposit: 140,
        },
        {
          carId: createdCar.id,
          minDays: 31,
          maxDays: null,
          pricePerDay: Number(car.pricePerDay) * 0.8,
          deposit: 120,
        },
      ],
    })

    // Availability blocks per car: mostly available next 30 days, with maintenance gaps
    const today = new Date()
    const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000)

    await prisma.availability.create({
      data: {
        carId: createdCar.id,
        startDate: today,
        endDate: addDays(today, 30),
        status: CarStatus.AVAILABLE,
      },
    })

    await prisma.availability.create({
      data: {
        carId: createdCar.id,
        startDate: addDays(today, 10),
        endDate: addDays(today, 12),
        status: CarStatus.MAINTENANCE,
      },
    })

    await prisma.availability.create({
      data: {
        carId: createdCar.id,
        startDate: addDays(today, 20),
        endDate: addDays(today, 21),
        status: CarStatus.RENTED,
      },
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
