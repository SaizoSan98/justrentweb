
import { prisma } from "@/lib/prisma"
import { FeaturedCarsList } from "@/components/admin/FeaturedCarsList"

export const dynamic = 'force-dynamic'

export default async function FeaturedPage() {
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Serialize for client component
  const serializedCars = cars.map(car => ({
    ...car,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    fullInsurancePrice: Number(car.fullInsurancePrice),
    pickupAfterHoursPrice: Number(car.pickupAfterHoursPrice),
    returnAfterHoursPrice: Number(car.returnAfterHoursPrice),
    extraKmPrice: Number(car.extraKmPrice),
    unlimitedMileagePrice: Number(car.unlimitedMileagePrice),
    registrationFee: Number(car.registrationFee),
    contractFee: Number(car.contractFee),
    winterizationFee: Number(car.winterizationFee),
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Featured Vehicles</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <p className="text-zinc-500 mb-6">
          Select up to 6 vehicles to display on the homepage. Use the switch to toggle visibility.
        </p>
        <FeaturedCarsList cars={serializedCars} />
      </div>
    </div>
  )
}
