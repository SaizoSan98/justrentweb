
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
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
        <Link href="/admin/cars/new">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </Link>
      </div>

      <CarsTable cars={cars} />
    </div>
  )
}
