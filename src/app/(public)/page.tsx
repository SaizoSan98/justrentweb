

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { FeaturedCars } from "@/components/home/FeaturedCars"
import { getSession } from "@/lib/auth"
import { Hero } from "@/components/home/Hero"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { ArrowRight, Shield, Globe, Zap, Heart } from "lucide-react"
import Image from "next/image"
import { Footer } from "@/components/layout/Footer"

import { BrandStrip } from "@/components/home/BrandStrip"
import { FeatureGrid } from "@/components/home/FeatureGrid"

import { Logo } from "@/components/ui/logo"

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const session = await getSession()
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

  const t = (key: string, section: string = "hero") => (dictionary as any)?.[section]?.[key] || key

  // Fetch Car Count
  const carCount = await prisma.car.count({
    where: { status: 'AVAILABLE' }
  })

  // Fetch Featured Cars
  const featuredCars = await prisma.car.findMany({
    where: { 
        isFeatured: true,
        status: 'AVAILABLE'
    },
    take: 4,
    include: { categories: true }
  })

  // Serialize cars to avoid Decimal issues
  const serializedFeaturedCars = featuredCars.map(car => ({
    ...car,
    categories: car.categories,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    fullInsurancePrice: Number(car.fullInsurancePrice),
    extraKmPrice: Number(car.extraKmPrice),
    unlimitedMileagePrice: Number(car.unlimitedMileagePrice),
    registrationFee: Number(car.registrationFee),
    contractFee: Number(car.contractFee),
    winterizationFee: Number(car.winterizationFee),
    pickupAfterHoursPrice: Number(car.pickupAfterHoursPrice),
    returnAfterHoursPrice: Number(car.returnAfterHoursPrice),
    pricingTiers: [], // Not needed for featured card
    insuranceOptions: [] // Not needed for featured card
  }))

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section */}
      <Hero dictionary={dictionary} carCount={carCount} />

      {/* Spacer for Search Widget - Removed since it's now inside Hero */}
      {/* <div className="h-32 md:h-24 bg-white" /> */}

      {/* Brand Strip */}
      <BrandStrip />

      {/* Popular Cars Section */}
      {serializedFeaturedCars.length > 0 && (
          <FeaturedCars cars={serializedFeaturedCars} />
      )}

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Footer is already in Layout */}
    </div>
  );
}
