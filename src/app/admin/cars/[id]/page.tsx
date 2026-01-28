import { prisma } from "@/lib/prisma"
import { getTranslations } from "@/lib/translation"
import { CarForm } from "@/components/admin/CarForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCarPage({ params }: PageProps) {
  const { id } = await params
  
  const car = await prisma.car.findUnique({
    where: { id },
    include: { pricingTiers: true }
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  const translations = await getTranslations([id], 'Car', 'he')

  if (!car) {
    notFound()
  }

  // Convert decimals to numbers for the form
  const serializedCar = {
    ...car,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    fullInsurancePrice: Number(car.fullInsurancePrice),
    pickupAfterHoursPrice: Number(car.pickupAfterHoursPrice),
    returnAfterHoursPrice: Number(car.returnAfterHoursPrice),
    pricingTiers: car.pricingTiers.map((tier: any) => ({
      ...tier,
      pricePerDay: Number(tier.pricePerDay),
      deposit: Number(tier.deposit)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/cars">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Edit Car</h1>
      </div>
      
      <CarForm car={serializedCar} categories={categories} isEditing={true} translations={translations} />
    </div>
  )
}
