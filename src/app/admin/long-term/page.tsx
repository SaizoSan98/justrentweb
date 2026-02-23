
import { prisma } from "@/lib/prisma"
import { LongTermCarsTable } from "@/components/admin/LongTermCarsTable"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function LongTermCarsPage() {
  const cars = await prisma.longTermCar.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Long Term Rentals</h1>
          <p className="text-zinc-500">Manage your long-term fleet, monthly pricing, and availability.</p>
        </div>
        <Link href="/admin/long-term/new">
          <Button className="bg-black hover:bg-zinc-800 text-white font-bold rounded-xl shadow-lg shadow-zinc-900/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5 mr-2" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      <LongTermCarsTable cars={cars} />
    </div>
  )
}
