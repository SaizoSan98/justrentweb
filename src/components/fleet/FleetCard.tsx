
"use client"

import { useState, useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Users, Briefcase, Gauge, Info, Check, Shield, Zap, CreditCard, MapPin, Calendar, ArrowRight, ChevronLeft, AlertCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type PricingTier = {
  minDays: number
  maxDays: number | null
  pricePerDay: number
  deposit: number
}

type CarType = {
  id: string
  make: string
  model: string
  year: number
  categories: { name: string, slug: string }[]
  imageUrl: string | null
  images: string[]
  pricePerDay: number
  status: string
  pricingTiers: PricingTier[]
  seats?: number
  suitcases?: number
  doors?: number
  transmission?: string
  fuelType?: string
  orSimilar?: boolean
  dailyMileageLimit?: number | null
  fullInsurancePrice?: number
  extraKmPrice?: number
  unlimitedMileagePrice?: number
  registrationFee?: number
  contractFee?: number
  winterizationFee?: number
  pickupAfterHoursPrice?: number
  returnAfterHoursPrice?: number
  deposit?: number
  insuranceOptions?: {
    planId: string
    pricePerDay: number
    deposit: number
    plan: {
      name: string
      description: string
      order: number
    }
  }[]
}

import { Baby, Map, UserPlus, Wifi } from "lucide-react"

type Extra = {
  id: string
  name: string
  price: number
  priceType: string // PER_DAY or PER_RENTAL
  icon: string | null
}

import { BookingModal } from "./BookingModal"

export function FleetCard({ 
  car, 
  searchParams,
  redirectToFleet,
  extras = [],
  dictionary = {},
  variant = 'light'
}: { 
  car: CarType,
  searchParams?: {
    startDate?: string
    endDate?: string
  },
  redirectToFleet?: boolean,
  extras?: Extra[],
  dictionary?: any,
  variant?: 'light' | 'dark'
}) {
  const t = (key: string, section: string = "fleet") => dictionary?.[section]?.[key] || key
  const tCommon = (key: string) => dictionary?.common?.[key?.toLowerCase()] || key
  
  const isDark = variant === 'dark'
  
  const startDate = searchParams?.startDate ? new Date(searchParams.startDate) : new Date()
  const endDate = searchParams?.endDate ? new Date(searchParams.endDate) : undefined
  
  // Calculate days
  const s = new Date(startDate); s.setHours(0,0,0,0)
  const e = endDate ? new Date(endDate) : new Date(startDate)
  if (endDate) e.setHours(0,0,0,0)
  else e.setDate(e.getDate() + 1)
  
  const diffTime = Math.max(0, e.getTime() - s.getTime())
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  
  // Calculate price based on duration
  let pricePerDay = car.pricePerDay
  const matchingTier = car.pricingTiers?.find(
    t => diffDays >= t.minDays && (t.maxDays === null || diffDays <= t.maxDays)
  )
  if (matchingTier) {
    pricePerDay = matchingTier.pricePerDay
  }
  
  const totalPrice = pricePerDay * diffDays

  // Insurance Logic
  const insuranceOptions = car.insuranceOptions?.sort((a, b) => (a.plan?.order || 0) - (b.plan?.order || 0)) || []
  const [selectedPlanId, setSelectedPlanId] = useState<string>(insuranceOptions[0]?.planId || "")
  
  const selectedOption = insuranceOptions.find(o => o.planId === selectedPlanId)
  const insuranceCost = selectedOption ? selectedOption.pricePerDay * diffDays : 0
  const finalTotal = totalPrice + insuranceCost
  const finalDeposit = selectedOption ? selectedOption.deposit : (car.deposit || 0)

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  
  const handleBooking = () => {
      setIsBookingOpen(true)
  }

  return (
    <>
    <BookingModal 
      isOpen={isBookingOpen} 
      onClose={() => setIsBookingOpen(false)} 
      car={car}
      searchParams={{
        startDate: searchParams?.startDate,
        endDate: searchParams?.endDate
      }}
      extras={extras}
    />

    <div className="group relative bg-white border border-zinc-100 hover:border-zinc-200 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
                <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{car.make} {car.model}</h3>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200 px-3 py-1 rounded-full">
                        OR SIMILAR {car.categories?.map(c => c.name).join(', ').toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-[#ff5f00] px-3 py-1 rounded-full uppercase tracking-widest">
                        ADVICE OF THE DAY
                    </span>
                </div>
            </div>
            
            {/* ACRISS Icons - Minimalist */}
            <div className="flex gap-6 text-zinc-400">
                <div className="flex flex-col items-center gap-1">
                    <Users className="w-5 h-5 stroke-[1.5]" />
                    <span className="text-xs font-bold">{car.seats}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Briefcase className="w-5 h-5 stroke-[1.5]" />
                    <span className="text-xs font-bold">{car.suitcases}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Gauge className="w-5 h-5 stroke-[1.5]" />
                    <span className="text-xs font-bold">{car.transmission === 'AUTOMATIC' ? 'A' : 'M'}</span>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative aspect-[16/10] w-full flex items-center justify-center p-4">
                <Image
                  src={car.imageUrl || "/placeholder-car.png"}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Pricing & CTA */}
            <div className="flex flex-col justify-center h-full space-y-8 pl-4 border-l border-zinc-100/0 md:border-zinc-100">
                <div className="space-y-1 text-right md:text-left">
                    <div className="flex items-baseline justify-end md:justify-start gap-1">
                        <span className="text-5xl font-black text-zinc-900 tracking-tighter">{pricePerDay.toLocaleString()} €</span>
                        <span className="text-lg font-medium text-zinc-400">/ day</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                        {totalPrice.toLocaleString()} € Total Price
                    </div>
                    <div className="text-sm font-medium text-zinc-900 mt-2">
                        {car.dailyMileageLimit ? `${car.dailyMileageLimit} km per rental` : 'Unlimited Mileage'}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-end md:justify-start gap-2 text-xs font-bold text-green-600 uppercase tracking-wide">
                        <Check className="w-4 h-4" />
                        <span>Free Cancellation</span>
                    </div>
                    <div className="flex items-center justify-end md:justify-start gap-2 text-xs font-bold text-green-600 uppercase tracking-wide">
                        <Check className="w-4 h-4" />
                        <span>Instant Confirmation</span>
                    </div>
                </div>

                <Button 
                    onClick={handleBooking}
                    className="w-full bg-[#1a1a1a] text-white hover:bg-black font-bold rounded-xl h-14 text-lg uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
                >
                    CHOOSE
                </Button>
            </div>
        </div>
      </div>
    </div>
    </>
  )
}
