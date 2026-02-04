import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { CheckoutForm } from "@/components/booking/CheckoutForm"
import { Header } from "@/components/layout/Header"
import { getSession } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 1. Check Auth (Removed strict redirect per user request)
  const session = await getSession()
  // if (!session?.user) {
  //   redirect('/login?tab=register&error=login_required_for_booking')
  // }

  const params = await searchParams ?? {}
  const carId = typeof params.carId === 'string' ? params.carId : undefined
  const startDateStr = typeof params.startDate === 'string' ? params.startDate : undefined
  const endDateStr = typeof params.endDate === 'string' ? params.endDate : undefined
  
  // New params for pre-selection
  const initialInsurance = typeof params.insurance === 'string' ? params.insurance : undefined
  const initialMileage = typeof params.mileage === 'string' ? params.mileage : undefined

  if (!carId) {
    redirect('/fleet')
  }

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { pricingTiers: true, insuranceOptions: { include: { plan: true } } }
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

  const startDate = (startDateStr && startDateStr !== 'undefined') ? new Date(startDateStr) : new Date()
  const endDate = (endDateStr && endDateStr !== 'undefined') ? new Date(endDateStr) : undefined

  // Serialize complex objects for client component
  const serializedCar = {
    ...car,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    fullInsurancePrice: Number(car.fullInsurancePrice),
    unlimitedMileagePrice: Number(car.unlimitedMileagePrice || 0),
    pricingTiers: car.pricingTiers.map(tier => ({
      ...tier,
      pricePerDay: Number(tier.pricePerDay),
      deposit: Number(tier.deposit)
    })),
    insuranceOptions: car.insuranceOptions.map(opt => ({
      ...opt,
      pricePerDay: Number(opt.pricePerDay),
      deposit: Number(opt.deposit),
      plan: opt.plan
    }))
  }

  const serializedExtras = extras.map(extra => ({
    ...extra,
    price: Number(extra.price)
  }))

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={session.user} />
      
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
          initialInsurance={initialInsurance}
          initialMileage={initialMileage}
        />
      </main>
    </div>
  )
}
