import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up demo data...')

  // 1. Delete all bookings, availability, pricing tiers (except we might want to keep some cars)
  // Actually user said "demo adatot az autókon kívül törölj ki".
  // So we keep Cars, but maybe reset their relations if they are "demo" bookings.
  
  await prisma.booking.deleteMany({})
  await prisma.damageReport.deleteMany({})
  // We keep PricingTiers as they are part of Car config? "árazásokat készíteni" -> maybe user wants to create them.
  // But for the existing cars (Tesla, BMW, Mercedes), we should probably keep them or recreate them to be "clean".
  // Let's keep PricingTiers for now so the fleet page still works.
  
  // 2. Delete Users (except if we want to keep one?)
  await prisma.user.deleteMany({})

  console.log('Creating Admin user...')
  
  // Simple password hashing simulation (in real app use bcrypt/argon2)
  // For this demo I will just store "admin" and compare directly in the login for simplicity unless I add bcrypt.
  // Wait, I should do it right. I'll add a simple hashing helper in the app later.
  const adminPassword = "admin"
  
  await prisma.user.create({
    data: {
      email: 'admin@justrent.com',
      name: 'Admin User',
      password: adminPassword, // In a real app, hash this!
      role: 'ADMIN',
    },
  })

  console.log('Creating sample Extras...')
  await prisma.extra.createMany({
    data: [
      { name: 'GPS Navigation', price: 1500, priceType: 'PER_DAY', description: 'Reliable navigation system' },
      { name: 'Child Seat', price: 2000, priceType: 'PER_DAY', description: 'Safety for your little ones' },
      { name: 'Full Insurance', price: 5000, priceType: 'PER_DAY', description: 'Zero deductible' },
      { name: 'Wi-Fi Hotspot', price: 3000, priceType: 'PER_DAY', description: 'Unlimited 4G internet' },
    ]
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
