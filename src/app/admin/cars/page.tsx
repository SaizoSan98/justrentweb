
import { prisma } from "@/lib/prisma"
import { CarsTable } from "@/components/admin/CarsTable"

export const dynamic = 'force-dynamic'

export default async function CarsPage() {
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: true }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Fleet Management</h1>
      </div>

      <CarsTable cars={cars} />
    </div>
  )
}
