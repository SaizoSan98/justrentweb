
import { prisma } from "@/lib/prisma"
import { LongTermCarForm } from "@/components/admin/LongTermCarForm"
import { notFound } from "next/navigation"

export default async function EditLongTermCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const car = await prisma.longTermCar.findUnique({
    where: { id }
  })

  if (!car) notFound()

  // Serialize Decimal fields to avoid server component error
  const serializedCar = {
    ...car,
    monthlyPrice: Number(car.monthlyPrice),
    price1to3: Number((car as any).price1to3 ?? 0),
    price4to6: Number((car as any).price4to6 ?? 0),
    price7plus: Number((car as any).price7plus ?? 0),
    deposit: Number(car.deposit),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Edit Vehicle</h1>
        <p className="text-zinc-500">Update vehicle details.</p>
      </div>

      <LongTermCarForm car={serializedCar} isEditing />
    </div>
  )
}
