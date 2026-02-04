
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

    <div className="group relative bg-white border border-zinc-100 hover:border-zinc-200 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
      <div className="p-4 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
                <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-none">{car.make} <span className="text-zinc-500 font-bold">{car.model}</span></h3>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        OR SIMILAR
                    </span>
                </div>
            </div>
            
            {/* Price Badge */}
            <div className="text-right">
                 <span className="text-2xl font-black text-zinc-900 tracking-tighter block leading-none">{pricePerDay.toLocaleString()} €</span>
                 <span className="text-[10px] font-bold text-zinc-400 uppercase">/ day</span>
            </div>
        </div>

        {/* Image */}
        <div className="relative aspect-[16/9] w-full flex items-center justify-center my-2 bg-zinc-50 rounded-xl overflow-hidden">
            <Image
              src={car.imageUrl || "/placeholder-car.png"}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-contain p-2 hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>

        {/* Specs - Compact Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 rounded-lg">
                <Users className="w-4 h-4 text-zinc-900 mb-1" />
                <span className="text-[10px] font-bold text-zinc-500">{car.seats}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-zinc-900 mb-1" />
                <span className="text-[10px] font-bold text-zinc-500">{car.suitcases}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 rounded-lg">
                <Gauge className="w-4 h-4 text-zinc-900 mb-1" />
                <span className="text-[10px] font-bold text-zinc-500">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Man'}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 rounded-lg">
                <Fuel className="w-4 h-4 text-zinc-900 mb-1" />
                <span className="text-[10px] font-bold text-zinc-500">{car.fuelType}</span>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-2 border-t border-zinc-100 flex items-center justify-between gap-4">
             <div className="text-[10px] font-bold text-zinc-400">
                Total: {totalPrice.toLocaleString()} €
             </div>
             <Button 
                onClick={handleBooking}
                size="sm"
                className="bg-black text-white hover:bg-zinc-800 font-bold rounded-lg px-6 h-9 text-xs uppercase tracking-wider"
            >
                Select
            </Button>
        </div>
      </div>
    </div>
    </>
  )
}
