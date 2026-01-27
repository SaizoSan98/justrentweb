import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@justrent.com' }
  })
  console.log('Admin user found:', user)
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
