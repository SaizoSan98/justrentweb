
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

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section - Full Width Image */}
      <div className="relative w-full h-[800px] bg-zinc-900">
        <Image 
          src="/rs6.avif" 
          alt="Hero" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        <div className="container mx-auto px-6 relative z-10 h-full flex flex-col pt-32 items-center text-center">
            {/* Search Widget - Top Positioned */}
            <div className="w-full mb-12 md:mb-24">
               <BookingEngine dictionary={dictionary} />
            </div>

           <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 max-w-4xl leading-tight uppercase tracking-wide">
             Rent a Car BUDAPEST
           </h1>
        </div>
      </div>

      {/* Spacer for Search Widget */}
      <div className="h-32 md:h-24 bg-white" />

      {/* Brand Strip */}
      <BrandStrip />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Footer is already in Layout */}
    </div>
  );
}
