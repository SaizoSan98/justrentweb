
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Users, Briefcase, Gauge, Info, Check, Shield, Zap, CreditCard, MapPin, Calendar, ArrowRight, ChevronLeft, AlertCircle, Settings, Fuel, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getBrandLogo } from "@/lib/brand-logos"

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
  renteonId?: string | null
  isAvailable?: boolean
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>("")
  const [mileageOption, setMileageOption] = useState<'LIMITED' | 'UNLIMITED'>('LIMITED')
  const [showBreakdown, setShowBreakdown] = useState(false)

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
  let pricePerDay = Math.round(car.pricePerDay)
  const matchingTier = car.pricingTiers?.find(
    t => diffDays >= t.minDays && (t.maxDays === null || diffDays <= t.maxDays)
  )
  if (matchingTier) {
    pricePerDay = Math.round(matchingTier.pricePerDay)
  }
  
  const totalPrice = pricePerDay * diffDays

  // Insurance Logic
  const insuranceOptions = car.insuranceOptions?.sort((a, b) => (a.plan?.order || 0) - (b.plan?.order || 0)) || []
  
  // Initialize default insurance
  if (!selectedInsuranceId && insuranceOptions.length > 0) {
      setSelectedInsuranceId(insuranceOptions[0].planId)
  }

  const selectedOption = insuranceOptions.find(o => o.planId === selectedInsuranceId)
  const insuranceCost = selectedOption ? selectedOption.pricePerDay * diffDays : 0
  const mileageCost = mileageOption === 'UNLIMITED' ? ((car.unlimitedMileagePrice || 0) * diffDays) : 0
  
  const finalTotal = totalPrice + insuranceCost + mileageCost

  const isAvailable = car.isAvailable !== false // Default to true if undefined

  const handleToggle = () => {
      if (!isAvailable) return
      setIsExpanded(!isExpanded)
  }

  return (
    <div className={cn(
        "group relative bg-white border border-zinc-100 rounded-[2rem] overflow-hidden transition-all duration-300",
        isExpanded ? "shadow-2xl ring-1 ring-zinc-200 col-span-1 md:col-span-2 xl:col-span-3" : "hover:border-zinc-200 hover:shadow-xl hover:-translate-y-1",
        !isAvailable && "opacity-60 grayscale pointer-events-none"
    )}>
      
      {!isAvailable && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-100/10 backdrop-blur-[1px]">
            <div className="bg-zinc-900 text-white px-6 py-2 rounded-full font-black text-xl tracking-widest uppercase border-2 border-white shadow-xl transform -rotate-12">
                UNAVAILABLE
            </div>
        </div>
      )}

      {/* --- COLLAPSED STATE (DEFAULT CARD) --- */}
      <div className={cn("p-6 flex flex-col h-full bg-[#f3f4f6]", isExpanded && "hidden")}>
        {/* Header */}
        <div className="mb-4">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1 line-clamp-1">
                {car.make} {car.model}
            </h3>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <span className="truncate">{car.categories?.[0]?.name || "Car Class"}</span>
                <span className="text-zinc-300">|</span>
                <span>OR SIMILAR</span>
            </p>
        </div>

        {/* Specs - Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-zinc-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-600">{car.fuelType} Vehicle</span>
            </div>
            <div className="bg-zinc-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs font-bold text-zinc-600">{car.seats}</span>
            </div>
            <div className="bg-zinc-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs font-bold text-zinc-600">{car.suitcases}</span>
            </div>
            <div className="bg-zinc-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs font-bold text-zinc-600">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
            </div>
        </div>

        {/* Image */}
        <div className="relative w-full h-[220px] flex items-center justify-center my-4 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-500" onClick={handleToggle}>
            <Image
              src={car.imageUrl || "/placeholder-car.png"}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-4 flex items-end justify-between">
             <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-zinc-900 tracking-tighter">€{pricePerDay.toLocaleString()}</span>
                    <span className="text-sm text-zinc-500 font-medium">/day</span>
                </div>
                <div className="text-sm font-bold text-zinc-800 mt-1">
                    €{finalTotal.toLocaleString()} <span className="text-xs font-normal text-zinc-500">total</span>
                </div>
             </div>
             
             <Button 
                onClick={handleToggle}
                className="bg-[#c92a2a] hover:bg-[#b02525] text-white font-bold rounded-lg px-8 h-10 text-sm shadow-lg shadow-red-900/10"
            >
                Select
            </Button>
        </div>
      </div>

      {/* --- EXPANDED STATE (SPLIT VIEW) --- */}
      {isExpanded && (
        <div className="flex flex-col md:flex-row h-auto min-h-[500px]">
           {/* LEFT SIDE: DARK (Image + Specs) */}
           <div className="w-full md:w-[55%] bg-white md:bg-[#0a0a0a] text-zinc-900 md:text-white p-8 relative flex flex-col justify-between">
              
              {/* Brand Logo Watermark */}
              {getBrandLogo(car.make) && (
                <div className="absolute top-8 right-8 w-12 h-12 opacity-50 md:opacity-20 z-10">
                  <Image 
                      src={getBrandLogo(car.make)}
                      alt={car.make}
                      fill
                      className="object-contain md:invert"
                      unoptimized
                  />
                </div>
              )}

              {/* Header */}
              <div className="space-y-1 relative z-10">
                 <h2 className="text-3xl font-black uppercase tracking-tight">{car.make} {car.model}</h2>
                 <p className="text-zinc-500 md:text-zinc-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <span>or similar class</span>
                    <span className="font-mono opacity-50">ID: {car.renteonId || car.id.slice(0, 8)}</span>
                 </p>
                 <p className="text-zinc-500 md:text-white/60 text-sm mt-1">{car.categories?.[0]?.name} {car.transmission} {car.fuelType}</p>
              </div>

              {/* Hero Image */}
              <div className="relative w-full aspect-[16/9] my-6 z-10">
                 <Image
                    src={car.imageUrl || "/placeholder-car.png"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-contain"
                 />
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-4 gap-4 relative z-10">
                  <div className="flex items-center gap-2 text-zinc-600 md:text-zinc-300">
                     <Users className="w-4 h-4" /> <span className="text-sm font-bold">{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 md:text-zinc-300">
                     <Briefcase className="w-4 h-4" /> <span className="text-sm font-bold">{car.suitcases} Bags</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 md:text-zinc-300">
                     <Gauge className="w-4 h-4" /> <span className="text-sm font-bold">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 md:text-zinc-300">
                     <Fuel className="w-4 h-4" /> <span className="text-sm font-bold">{car.fuelType}</span>
                  </div>
              </div>
              
              {/* Age Restriction Note */}
              <div className="flex items-center gap-2 mt-6 text-zinc-400 md:text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  <CreditCard className="w-3 h-3" />
                  <span>Minimum driver age: 21 years</span>
              </div>

              {/* Background Gradient */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
           </div>

           {/* RIGHT SIDE: WHITE (Options + Total) */}
           <div className="w-full md:w-[45%] bg-white p-6 flex flex-col relative">
              
              {/* Close Button */}
              <button 
                 onClick={handleToggle}
                 className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition-colors"
              >
                 <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-zinc-900 mb-6 text-lg">Booking Options</h3>

              <div className="space-y-6 flex-1">
                 {/* Insurance Options */}
                 <div className="space-y-3">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Insurance Plan</Label>
                    <div className="space-y-2">
                       {insuranceOptions.map((ins) => (
                          <div 
                             key={ins.planId}
                             onClick={() => setSelectedInsuranceId(ins.planId)}
                             className={cn(
                               "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                               selectedInsuranceId === ins.planId ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
                             )}
                           >
                              <div className="flex items-center gap-3">
                                 <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", selectedInsuranceId === ins.planId ? "border-black" : "border-zinc-300")}>
                                    {selectedInsuranceId === ins.planId && <div className="w-2 h-2 rounded-full bg-black" />}
                                 </div>
                                 <div>
                                    <div className="font-bold text-sm text-zinc-900">{ins.plan.name?.replace(/ - (Mini|Midi|Maxi)/g, "")}</div>
                                    <div className="text-[10px] text-zinc-500 leading-tight max-w-[180px]">
                                        {ins.plan.description || "Basic coverage"}
                                        <span className="block text-zinc-400">Deposit: {ins.deposit?.toLocaleString() ?? 0} €</span>
                                    </div>
                                 </div>
                              </div>
                              <span className="font-bold text-sm text-right">
                                 {ins.pricePerDay === 0 ? "Included" : (
                                     <>
                                         <div>+{Math.round(ins.pricePerDay * diffDays).toLocaleString()} €</div>
                                         <div className="text-[10px] text-zinc-400">({Math.round(ins.pricePerDay)} € / day)</div>
                                     </>
                                 )}
                              </span>
                           </div>
                       ))}
                    </div>
                 </div>

                 {/* Mileage Options */}
                 <div className="space-y-3">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mileage</Label>
                    <div className="space-y-2">
                         <div 
                           onClick={() => setMileageOption('LIMITED')}
                           className={cn(
                             "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                             mileageOption === 'LIMITED' ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
                           )}
                         >
                            <div className="flex items-center gap-3">
                               <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", mileageOption === 'LIMITED' ? "border-black" : "border-zinc-300")}>
                                  {mileageOption === 'LIMITED' && <div className="w-2 h-2 rounded-full bg-black" />}
                               </div>
                               <div>
                                  <div className="font-bold text-sm text-zinc-900">{car.dailyMileageLimit || 300} km / day</div>
                               </div>
                            </div>
                            <span className="font-bold text-sm">Included</span>
                         </div>

                         <div 
                           // DISABLED: Unlimited Mileage Temporarily
                           // onClick={() => setMileageOption('UNLIMITED')}
                           className={cn(
                             "flex items-center justify-between p-3 rounded-xl border-2 transition-all opacity-50 cursor-not-allowed",
                             mileageOption === 'UNLIMITED' ? "border-black bg-zinc-50" : "border-zinc-100"
                           )}
                         >
                            <div className="flex items-center gap-3">
                               <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center border-zinc-300")}>
                                  {/* No checkmark for disabled option */}
                               </div>
                               <div>
                                  <div className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                                      Unlimited km
                                      <span className="bg-zinc-200 text-zinc-600 text-[8px] px-1 py-0.5 rounded uppercase tracking-wider font-bold">DEV</span>
                                  </div>
                               </div>
                            </div>
                            <span className="font-bold text-sm text-zinc-400">0 €</span>
                         </div>
                    </div>
                 </div>
              </div>

              {/* Bottom Total & CTA */}
              <div className="mt-8 pt-6 border-t border-zinc-100">
                  <div className="flex justify-between items-end mb-4">
                      <div>
                          <span className="block text-2xl font-black text-zinc-900 tracking-tighter leading-none">
                              {Math.round(finalTotal / diffDays).toLocaleString()} €
                              <span className="text-sm text-zinc-400 font-bold ml-1">/ day</span>
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">
                              Total: {finalTotal.toLocaleString()} €
                          </span>
                      </div>
                      <Link href={`/checkout?carId=${car.id}&insurance=${selectedInsuranceId}&mileage=${mileageOption}&startDate=${startDate.toISOString()}&endDate=${endDate?.toISOString()}`} className="w-1/2">
                        <Button className="w-full bg-[#ff5f00] hover:bg-[#ff5f00]/90 text-white font-bold h-12 rounded-xl uppercase tracking-wider shadow-lg shadow-orange-500/20">
                            Next Step
                        </Button>
                      </Link>
                  </div>
                  <button 
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-[10px] font-bold text-zinc-400 underline uppercase tracking-wider hover:text-zinc-600"
                  >
                      {showBreakdown ? 'Hide Breakdown' : 'Price Breakdown'}
                  </button>
                  
                  {showBreakdown && (
                    <div className="mt-4 p-4 bg-zinc-50 rounded-xl space-y-2 text-xs animate-in slide-in-from-top-2">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Base Rental ({diffDays} days)</span>
                            <span className="font-bold text-zinc-900">{totalPrice.toLocaleString()} €</span>
                        </div>
                        {selectedOption && (
                             <div className="flex justify-between">
                                <span className="text-zinc-500">Insurance ({selectedOption.plan.name?.replace(/ - (Mini|Midi|Maxi)/g, "")})</span>
                                <span className="font-bold text-zinc-900">+{Math.round(insuranceCost).toLocaleString()} €</span>
                            </div>
                        )}
                        {mileageOption === 'UNLIMITED' && (
                             <div className="flex justify-between">
                                <span className="text-zinc-500">Unlimited Mileage</span>
                                <span className="font-bold text-zinc-900">+{Math.round(mileageCost).toLocaleString()} €</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-zinc-200">
                             <span className="font-bold text-zinc-900">Total</span>
                             <span className="font-bold text-zinc-900">{finalTotal.toLocaleString()} €</span>
                        </div>
                    </div>
                  )}
              </div>

           </div>
        </div>
      )}

    </div>
  )
}
