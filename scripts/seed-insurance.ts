
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const plans = [
    { name: 'Basic', description: 'Includes basic coverage with standard deposit.', isDefault: true, order: 1 },
    { name: 'Basic+', description: 'Reduced deposit and extended coverage.', isDefault: false, order: 2 },
    { name: 'Full', description: 'Zero deposit and full coverage.', isDefault: false, order: 3 },
  ]

  for (const plan of plans) {
    const existing = await prisma.insurancePlan.findFirst({ where: { name: plan.name } })
    if (!existing) {
      await prisma.insurancePlan.create({ data: plan })
      console.log(`Created plan: ${plan.name}`)
    } else {
        console.log(`Plan already exists: ${plan.name}`)
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
