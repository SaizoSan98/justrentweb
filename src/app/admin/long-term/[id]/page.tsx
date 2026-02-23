
import { prisma } from "@/lib/prisma"
import { LongTermCarForm } from "@/components/admin/LongTermCarForm"
import { notFound } from "next/navigation"

export default async function EditLongTermCarPage({ params }: { params: { id: string } }) {
  const car = await prisma.longTermCar.findUnique({
    where: { id: params.id }
  })

  if (!car) notFound()

  // Serialize Decimal fields to avoid server component error
  const serializedCar = {
    ...car,
    monthlyPrice: Number(car.monthlyPrice),
    price1to3: Number(car.price1to3),
    price4to6: Number(car.price4to6),
    price7plus: Number(car.price7plus),
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
