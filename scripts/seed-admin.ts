import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up demo data...')

  // Delete all existing bookings and damage reports
  await prisma.booking.deleteMany({})
  await prisma.damageReport.deleteMany({})
  
  // Note: We are keeping Cars and PricingTiers as requested previously.
  // But we might want to update the extras.
  await prisma.extra.deleteMany({})

  // Delete Users (except if we want to keep one? No, we recreate admin)
  await prisma.user.deleteMany({})

  console.log('Creating Admin user...')
  
  const adminPassword = "admin"
  
  await prisma.user.create({
    data: {
      email: 'admin@justrent.com',
      name: 'Admin User',
      password: adminPassword, // In a real app, hash this!
      role: 'ADMIN',
    },
  })

  console.log('Creating specific Extras...')
  // -Border Crossing (EU): 50 euró per rental
  // -Child Seat: 5 euró per day
  // -Young Driver Fee (21-25): 18 euró per rental
  // -Airport Delivery IN: 30 euró per rental
  // -Airport Delivery OUT: 30 euró per rental
  // -Winter Package: 50 euró per rental
  
  await prisma.extra.createMany({
    data: [
      { 
        name: 'Border Crossing (EU)', 
        price: 50, 
        priceType: 'PER_RENTAL', 
        description: 'Permission to drive within EU countries',
        icon: 'Map'
      },
      { 
        name: 'Child Seat', 
        price: 5, 
        priceType: 'PER_DAY', 
        description: 'Safety for your little ones',
        icon: 'Baby'
      },
      { 
        name: 'Young Driver Fee (21-25)', 
        price: 18, 
        priceType: 'PER_RENTAL', 
        description: 'Surcharge for drivers under 25',
        icon: 'User'
      },
      { 
        name: 'Airport Delivery IN', 
        price: 30, 
        priceType: 'PER_RENTAL', 
        description: 'Delivery to Airport Arrival',
        icon: 'PlaneLanding'
      },
      { 
        name: 'Airport Delivery OUT', 
        price: 30, 
        priceType: 'PER_RENTAL', 
        description: 'Pickup from Airport Departure',
        icon: 'PlaneTakeoff'
      },
      { 
        name: 'Winter Package', 
        price: 50, 
        priceType: 'PER_RENTAL', 
        description: 'Snow chains and winter equipment',
        icon: 'Snowflake'
      },
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
