
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
    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-3xl bg-white border-zinc-100 text-zinc-900">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-zinc-900">Customize Your Rental</DialogTitle>
            </DialogHeader>
            
            <div className="grid md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-zinc-900">
                            <Shield className="w-5 h-5 text-red-600" />
                            Select Insurance Plan
                        </h3>
                        <div className="grid gap-4">
                            {insuranceOptions.length > 0 ? insuranceOptions.map((option) => (
                                <div 
                                    key={option.planId}
                                    onClick={() => setSelectedPlanId(option.planId)}
                                    className={cn(
                                        "cursor-pointer border rounded-xl p-4 transition-all relative overflow-hidden",
                                        selectedPlanId === option.planId 
                                            ? "bg-red-50 border-red-600 ring-1 ring-red-600" 
                                            : "bg-white border-zinc-200 hover:border-zinc-300"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-zinc-900">{option.plan.name}</h4>
                                        <span className="font-mono text-sm font-bold text-zinc-700">
                                            {option.pricePerDay > 0 ? `+${option.pricePerDay}€/day` : "Included"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 mb-3">{option.plan.description}</p>
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                                        <CreditCard className="w-3 h-3" />
                                        <span>Deposit: {option.deposit}€</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-500 text-sm">
                                    Standard insurance included. Deposit: {car.deposit}€
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 sticky top-4">
                        <h3 className="font-bold text-lg mb-4 text-zinc-900">Summary</h3>
                        
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between text-zinc-500">
                                <span>Car Rental ({diffDays} days)</span>
                                <span>{totalPrice.toLocaleString()}€</span>
                            </div>
                            {insuranceCost > 0 && (
                                <div className="flex justify-between text-zinc-500">
                                    <span>Insurance ({selectedOption?.plan.name})</span>
                                    <span>{insuranceCost.toLocaleString()}€</span>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-zinc-200 flex justify-between items-end">
                                <span className="font-bold text-zinc-900">Total</span>
                                <span className="text-2xl font-black text-zinc-900">{finalTotal.toLocaleString()}€</span>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3 text-xs text-zinc-500 mt-4 border border-zinc-200">
                                <div className="flex justify-between mb-1">
                                    <span>Refundable Deposit:</span>
                                    <span className="text-zinc-900 font-bold">{finalDeposit}€</span>
                                </div>
                                <p>Blocked on card at pickup.</p>
                            </div>

                            <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold h-12">
                                Continue to Extras
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>

    <div className="group relative bg-white border border-zinc-100 hover:border-zinc-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-1">{car.make} {car.model}</h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider border border-zinc-200 px-2 py-0.5 rounded-sm">
                        Or Similar {car.categories?.map(c => c.name).join(', ')}
                    </span>
                    <span className="text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-sm">
                        ADVICE OF THE DAY
                    </span>
                </div>
            </div>
            {/* Icons */}
            <div className="flex gap-4 text-zinc-400">
                <div className="flex flex-col items-center">
                    <Users className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">{car.seats}</span>
                </div>
                <div className="flex flex-col items-center">
                    <Briefcase className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">{car.suitcases}</span>
                </div>
                <div className="flex flex-col items-center">
                    <Gauge className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-bold">{car.transmission === 'AUTOMATIC' ? 'A' : 'M'}</span>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div className="relative aspect-[16/9] w-full">
                <Image
                  src={car.imageUrl || "/placeholder-car.png"}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-contain"
                />
            </div>

            {/* Pricing & CTA */}
            <div className="flex flex-col justify-between h-full py-4">
                <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-zinc-900">{pricePerDay.toLocaleString()} €</span>
                        <span className="text-sm text-zinc-500">/ day</span>
                    </div>
                    <div className="text-sm text-zinc-500">
                        {totalPrice.toLocaleString()} € TOTAL PRICE
                    </div>
                    <div className="text-xs text-zinc-600 mt-2">
                        {car.dailyMileageLimit ? `${car.dailyMileageLimit} km per rental` : 'Unlimited Mileage'}
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Free Cancellation</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600 font-bold">
                        <Check className="w-3 h-3" />
                        <span>Instant Confirmation</span>
                    </div>
                    
                    <Button 
                        onClick={handleBooking}
                        className="w-full mt-4 bg-zinc-900 text-white hover:bg-zinc-800 font-bold rounded-xl h-12 text-lg"
                    >
                        CHOOSE
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
    </>
  )
}
