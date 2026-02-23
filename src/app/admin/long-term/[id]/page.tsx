
import { prisma } from "@/lib/prisma"
import { LongTermCarForm } from "@/components/admin/LongTermCarForm"
import { notFound } from "next/navigation"

export default async function EditLongTermCarPage({ params }: { params: { id: string } }) {
  const car = await prisma.longTermCar.findUnique({
    where: { id: params.id }
  })

  if (!car) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Edit Vehicle</h1>
        <p className="text-zinc-500">Update vehicle details.</p>
      </div>

      <LongTermCarForm car={car} isEditing />
    </div>
  )
}
