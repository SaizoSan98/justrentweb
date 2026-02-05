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
  
  let car: any = null;
  
  try {
    car = await prisma.car.findUnique({
      where: { id },
      include: { 
          pricingTiers: true,
          insuranceOptions: true,
          categories: true
      }
    })
  } catch (error) {
    console.error("Error fetching car by ID:", error)
  }

  // Fallback: Try to find by Renteon ID if standard lookup failed
  // This helps if someone navigates using Renteon ID or if ID format is unusual
  if (!car && /^\d+$/.test(id)) {
      try {
        car = await prisma.car.findUnique({
            where: { renteonId: id } as any,
            include: { 
                pricingTiers: true,
                insuranceOptions: true,
                categories: true
            }
        })
      } catch (error) {
        console.error("Error fetching car by Renteon ID:", error)
      }
  }

  if (!car) {
    notFound()
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
  
  const insurancePlans = await prisma.insurancePlan.findMany({
    orderBy: { order: 'asc' }
  })

  let translations: any[] = []
  try {
    translations = await getTranslations([car.id], 'Car', 'he')
  } catch (error) {
    console.error("Error fetching translations:", error)
    // Continue without translations
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
    })),
    insuranceOptions: car.insuranceOptions.map((opt: any) => ({
        ...opt,
        pricePerDay: Number(opt.pricePerDay),
        deposit: Number(opt.deposit)
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
      
      <CarForm 
        car={serializedCar} 
        categories={categories} 
        insurancePlans={insurancePlans}
        isEditing={true} 
        translations={translations} 
      />
    </div>
  )
}
