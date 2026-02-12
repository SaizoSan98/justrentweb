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

  console.log('Seeding finished. (No demo cars created - use strict Renteon Sync)')
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
