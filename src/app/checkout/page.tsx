import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { CheckoutForm } from "@/components/booking/CheckoutForm"
import { Header } from "@/components/layout/Header"

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams ?? {}
  const carId = typeof params.carId === 'string' ? params.carId : undefined
  const startDateStr = typeof params.startDate === 'string' ? params.startDate : undefined
  const endDateStr = typeof params.endDate === 'string' ? params.endDate : undefined

  if (!carId || !startDateStr) {
    redirect('/fleet')
  }

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { pricingTiers: true }
  })

  if (!car) {
    notFound()
  }

  const extras = await prisma.extra.findMany({
    orderBy: { name: 'asc' }
  })

  const settings = await prisma.settings.findUnique({
    where: { id: "settings" }
  })

  const startDate = new Date(startDateStr)
  const endDate = endDateStr ? new Date(endDateStr) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000)

  // Serialize complex objects for client component
  const serializedCar = {
    ...car,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    fullInsurancePrice: Number(car.fullInsurancePrice),
    pricingTiers: car.pricingTiers.map(tier => ({
      ...tier,
      pricePerDay: Number(tier.pricePerDay),
      deposit: Number(tier.deposit)
    }))
  }

  const serializedExtras = extras.map(extra => ({
    ...extra,
    price: Number(extra.price)
  }))

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Checkout</h1>
          <p className="text-zinc-500">Complete your booking for {car.make} {car.model}</p>
        </div>

        <CheckoutForm 
          car={serializedCar} 
          extras={serializedExtras}
          startDate={startDate}
          endDate={endDate}
          settings={settings}
        />
      </main>
    </div>
  )
}
