import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { CheckoutForm } from "@/components/booking/CheckoutForm"
import { Header } from "@/components/layout/Header"
import { getSession } from "@/lib/auth"
import { checkRealTimeAvailability } from "@/app/actions/renteon-availability"
import { mapCarToCategoryId } from "@/lib/renteon"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

  // 1. Check Auth (Removed strict redirect per user request)
  const session = await getSession()
  
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

  // FETCH FRESH RENTEON DATA for this specific car/dates
  let renteonPrice = 0;
  let renteonDeposit = 0;
  
  if (endDate) {
      try {
          const res = await checkRealTimeAvailability(startDate, endDate);
          if (res.success && Array.isArray(res.data)) {
              // Find the matching Renteon item for this car
              const renteonItem = res.data.find((item: any) => {
                  const catId = item.CarCategoryId || item.CategoryId || item.Id;
                  return catId === mapCarToCategoryId(car);
              });

              if (renteonItem) {
                  renteonPrice = Number(renteonItem.Amount || 0);
                  renteonDeposit = Number(renteonItem.DepositAmount || renteonItem.Deposit || 0);
                  console.log(`Checkout: Fetched fresh Renteon price: ${renteonPrice} EUR, Deposit: ${renteonDeposit}`);
              }
          }
      } catch (e) {
          console.error("Checkout Renteon Fetch Error:", e);
      }
  }

  // Serialize complex objects for client component
  // Override DB values with Renteon values if available
  const durationMs = endDate ? endDate.getTime() - startDate.getTime() : 0;
  const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
  
  const effectivePricePerDay = renteonPrice > 0 
      ? Math.round(renteonPrice / days) 
      : Number(car.pricePerDay);

  const effectiveDeposit = renteonDeposit > 0 
      ? renteonDeposit 
      : Number(car.deposit);

  const serializedCar = {
    ...car,
    pricePerDay: effectivePricePerDay,
    deposit: effectiveDeposit,
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
      <Header user={session?.user} dictionary={dictionary} lang={lang} />
      
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
          user={session?.user}
          dictionary={dictionary}
        />
      </main>
    </div>
  )
}
