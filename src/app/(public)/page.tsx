

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { FeaturedCars } from "@/components/home/FeaturedCars"
import { Reviews } from "@/components/home/Reviews"
import { getSession } from "@/lib/auth"
import { Hero } from "@/components/home/Hero"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { ArrowRight, Shield, Globe, Zap, Heart } from "lucide-react"
import Image from "next/image"
import { Footer } from "@/components/layout/Footer"
import { BrandStrip } from "@/components/home/BrandStrip"
import { PartnersStrip } from "@/components/home/PartnersStrip"
import { FeatureGrid } from "@/components/home/FeatureGrid"
import { checkRealTimeAvailability } from "@/app/actions/renteon-availability";
import { mapCarToCategoryId } from "@/lib/renteon";
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
    take: 10,
    include: { categories: true }
  })

  // Fetch Real-time Renteon prices for the featured cars
  // Stage 1: Try tomorrow (3-day window)
  const rentDateOut1 = new Date();
  rentDateOut1.setDate(rentDateOut1.getDate() + 1);
  const rentDateIn1 = new Date(rentDateOut1);
  rentDateIn1.setDate(rentDateIn1.getDate() + 3);

  let renteonPrices = new Map<number, number>();

  async function fetchPrices(dOut: Date, dIn: Date) {
    try {
      const renteonResult = await checkRealTimeAvailability(dOut, dIn);
      if (renteonResult.success && Array.isArray(renteonResult.data)) {
        renteonResult.data.forEach((item: any) => {
          const catId = item.CarCategoryId || item.CategoryId || item.Id;
          if (catId && item.dailyRate > 0) {
            // Only set if not already present or if we want to ensure we get a price
            if (!renteonPrices.has(catId)) {
              renteonPrices.set(catId, Number(item.dailyRate));
            }
          }
        });
        return true;
      }
    } catch (err) {
      console.error("Failed to fetch featured car Renteon prices:", err);
    }
    return false;
  }

  // Initial fetch for tomorrow
  await fetchPrices(rentDateOut1, rentDateIn1);

  // Stage 2: Fallback to 30 days in the future if we don't have prices for all featured cars
  // (We check if at least one price was found, or we could check specific cars)
  const hasAtLeastOnePrice = renteonPrices.size > 0;
  if (!hasAtLeastOnePrice) {
    const rentDateOut2 = new Date();
    rentDateOut2.setDate(rentDateOut2.getDate() + 30);
    const rentDateIn2 = new Date(rentDateOut2);
    rentDateIn2.setDate(rentDateOut2.getDate() + 3);
    await fetchPrices(rentDateOut2, rentDateIn2);
  }

  // Serialize cars and apply Renteon prices
  const serializedFeaturedCars = featuredCars.map(car => {
    const catId = mapCarToCategoryId(car);
    const rRate = renteonPrices.get(catId);

    return {
      ...car,
      categories: car.categories,
      // Use Renteon daily rate. If still missing, we set to 0 and filter out.
      pricePerDay: rRate ? Math.round(rRate) : 0,
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
    };
  }).filter(c => c.pricePerDay > 0); // User specifically asked for ONLY Renteon prices

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section */}
      <Hero dictionary={dictionary} carCount={carCount} />

      {/* Partners Strip */}
      <PartnersStrip dictionary={dictionary} />

      {/* Brand Strip */}
      <BrandStrip />

      {/* Popular Cars Section */}
      {serializedFeaturedCars.length > 0 && (
        <FeaturedCars cars={serializedFeaturedCars} dictionary={dictionary} />
      )}

      {/* Reviews Section */}
      <Reviews dictionary={dictionary} />

      {/* Feature Grid */}
      <FeatureGrid dictionary={dictionary} />

      {/* Footer is already in Layout */}
    </div>
  );
}
