
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
        "group relative bg-[#18181b] border border-zinc-800 rounded-[2rem] overflow-hidden transition-all duration-300",
        isExpanded ? "shadow-2xl ring-1 ring-zinc-700 col-span-1 md:col-span-2 xl:col-span-3" : "hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1",
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
      <div className={cn("p-6 flex flex-col h-full bg-[#18181b] border border-zinc-800 rounded-[2rem]", isExpanded && "hidden")}>
        {/* Header */}
        <div className="mb-4">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-1 line-clamp-1">
                {car.make} {car.model}
            </h3>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                {car.categories?.[0]?.name && (
                    <>
                        <span className="truncate">{car.categories[0].name}</span>
                        <span className="text-zinc-600">|</span>
                    </>
                )}
                <span>OR SIMILAR</span>
            </p>
        </div>

        {/* Specs - Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
            <div className="bg-zinc-800/50 border border-zinc-700/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-300">{car.fuelType} Vehicle</span>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">{car.seats}</span>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">{car.suitcases}</span>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
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
        <div className="mt-auto pt-4 flex items-end justify-between border-t border-zinc-800/50">
             <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tracking-tighter">€{pricePerDay.toLocaleString()}</span>
                    <span className="text-sm text-zinc-500 font-medium">/day</span>
                </div>
                <div className="text-sm font-bold text-zinc-400 mt-1">
                    €{finalTotal.toLocaleString()} <span className="text-xs font-normal text-zinc-600">total</span>
                </div>
             </div>
             
             <Button 
                onClick={handleToggle}
                className="bg-white text-black hover:bg-zinc-200 font-black rounded-xl px-8 h-10 text-sm uppercase tracking-wider transition-colors"
            >
                Select
            </Button>
        </div>
      </div>

      {/* --- EXPANDED STATE (SPLIT VIEW) --- */}
      {isExpanded && (
        <div className="flex flex-col md:flex-row h-auto min-h-[500px] border-t border-zinc-800">
           {/* LEFT SIDE: DARK (Image + Specs) */}
           <div className="w-full md:w-[55%] bg-[#18181b] text-white p-8 relative flex flex-col justify-between overflow-hidden">
              
              {/* Brand Logo Watermark */}
              {getBrandLogo(car.make) && (
                <div className="absolute top-8 right-8 w-32 h-32 opacity-5 pointer-events-none z-0">
                  <Image 
                      src={getBrandLogo(car.make)}
                      alt={car.make}
                      fill
                      className="object-contain invert"
                      unoptimized
                  />
                </div>
              )}

              {/* Header */}
              <div className="space-y-1 relative z-10">
                 <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">{car.make} {car.model}</h2>
                 <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <span>or similar class</span>
                    <span className="font-mono opacity-50 text-zinc-600">|</span>
                    <span className="font-mono opacity-50">ID: {car.renteonId || car.id.slice(0, 8)}</span>
                 </p>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{car.categories?.[0]?.name}</span>
                    <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{car.transmission}</span>
                    <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{car.fuelType}</span>
                 </div>
              </div>

              {/* Hero Image */}
              <div className="relative w-full aspect-[16/9] my-8 z-10">
                 <Image
                    src={car.imageUrl || "/placeholder-car.png"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-contain drop-shadow-2xl"
                 />
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 backdrop-blur-sm">
                     <Users className="w-5 h-5 text-zinc-400 mb-1" /> 
                     <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Seats</span>
                     <span className="text-sm font-bold text-white">{car.seats}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 backdrop-blur-sm">
                     <Briefcase className="w-5 h-5 text-zinc-400 mb-1" /> 
                     <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Luggage</span>
                     <span className="text-sm font-bold text-white">{car.suitcases} Bags</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 backdrop-blur-sm">
                     <Gauge className="w-5 h-5 text-zinc-400 mb-1" /> 
                     <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Gearbox</span>
                     <span className="text-sm font-bold text-white">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 backdrop-blur-sm">
                     <Fuel className="w-5 h-5 text-zinc-400 mb-1" /> 
                     <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Fuel</span>
                     <span className="text-sm font-bold text-white">{car.fuelType}</span>
                  </div>
              </div>
              
              {/* Age Restriction Note */}
              <div className="flex items-center gap-2 mt-6 text-zinc-500 text-xs font-bold uppercase tracking-wider opacity-60">
                  <CreditCard className="w-3 h-3" />
                  <span>Minimum driver age: 21 years</span>
              </div>
           </div>

           {/* RIGHT SIDE: DARK (Options + Total) */}
           <div className="w-full md:w-[45%] bg-[#18181b] border-l border-zinc-800 p-6 flex flex-col relative">
              
              {/* Close Button */}
              <button 
                 onClick={handleToggle}
                 className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors z-20"
              >
                 <X className="w-5 h-5" />
              </button>

              <h3 className="font-black text-white mb-6 text-lg tracking-tight">Booking Configuration</h3>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                 {/* Insurance Options */}
                 <div className="space-y-3">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Insurance Plan</Label>
                    <div className="space-y-2">
                       {insuranceOptions.map((ins) => (
                          <div 
                             key={ins.planId}
                             onClick={() => setSelectedInsuranceId(ins.planId)}
                             className={cn(
                               "relative flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                               selectedInsuranceId === ins.planId 
                                 ? "border-white bg-zinc-800 shadow-xl" 
                                 : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50"
                             )}
                           >
                              <div className="flex items-center gap-4">
                                 <div className={cn(
                                     "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", 
                                     selectedInsuranceId === ins.planId ? "border-white" : "border-zinc-600 group-hover:border-zinc-500"
                                 )}>
                                    {selectedInsuranceId === ins.planId && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                 </div>
                                 <div>
                                    <div className={cn("font-bold text-sm transition-colors", selectedInsuranceId === ins.planId ? "text-white" : "text-zinc-300")}>
                                        {ins.plan.name?.replace(/ - (Mini|Midi|Maxi)/g, "")}
                                    </div>
                                    <div className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                                        {ins.plan.description || "Standard coverage protection"}
                                        <span className="block text-zinc-400 font-medium mt-0.5">Deposit: {ins.deposit?.toLocaleString() ?? 0} €</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 {ins.pricePerDay === 0 ? (
                                     <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded">Included</span>
                                 ) : (
                                     <>
                                         <div className={cn("font-bold text-sm", selectedInsuranceId === ins.planId ? "text-white" : "text-zinc-300")}>
                                            +{Math.round(ins.pricePerDay * diffDays).toLocaleString()} €
                                         </div>
                                         <div className="text-[10px] text-zinc-500">({Math.round(ins.pricePerDay)} €/day)</div>
                                     </>
                                 )}
                              </div>
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
                             "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                             mileageOption === 'LIMITED' 
                                ? "border-white bg-zinc-800 shadow-xl" 
                                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50"
                           )}
                         >
                            <div className="flex items-center gap-4">
                               <div className={cn(
                                   "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", 
                                   mileageOption === 'LIMITED' ? "border-white" : "border-zinc-600 group-hover:border-zinc-500"
                               )}>
                                  {mileageOption === 'LIMITED' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                               </div>
                               <div>
                                  <div className={cn("font-bold text-sm transition-colors", mileageOption === 'LIMITED' ? "text-white" : "text-zinc-300")}>
                                      {car.dailyMileageLimit || 300} km / day
                                  </div>
                                  <div className="text-[11px] text-zinc-500 mt-0.5">Standard daily allowance</div>
                               </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-2 py-1 rounded">Included</span>
                         </div>

                         <div 
                           // DISABLED: Unlimited Mileage Temporarily
                           className={cn(
                             "flex items-center justify-between p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20 opacity-40 cursor-not-allowed grayscale",
                           )}
                         >
                            <div className="flex items-center gap-4">
                               <div className="w-5 h-5 rounded-full border-2 border-zinc-700 flex items-center justify-center"></div>
                               <div>
                                  <div className="font-bold text-sm text-zinc-500 flex items-center gap-2">
                                      Unlimited km
                                      <span className="bg-zinc-800 text-zinc-500 text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Soon</span>
                                  </div>
                               </div>
                            </div>
                            <span className="font-bold text-sm text-zinc-600">-- €</span>
                         </div>
                    </div>
                 </div>
              </div>

              {/* Bottom Total & CTA */}
              <div className="mt-8 pt-6 border-t border-zinc-800">
                  <div className="flex justify-between items-end mb-4">
                      <div>
                          <span className="block text-3xl font-black text-white tracking-tighter leading-none">
                              {Math.round(finalTotal / diffDays).toLocaleString()} €
                              <span className="text-sm text-zinc-500 font-bold ml-1">/ day</span>
                          </span>
                          <span className="text-xs text-zinc-400 font-medium mt-1 block">
                              Total for {diffDays} days: <span className="text-white">{finalTotal.toLocaleString()} €</span>
                          </span>
                      </div>
                      <Link href={`/checkout?carId=${car.id}&insurance=${selectedInsuranceId}&mileage=${mileageOption}&startDate=${startDate.toISOString()}&endDate=${endDate?.toISOString()}`} className="w-1/2">
                        <Button className="w-full bg-white hover:bg-zinc-200 text-black font-black h-12 rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-zinc-900/50">
                            Book Now
                        </Button>
                      </Link>
                  </div>
                  
                  <button 
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="text-[10px] font-bold text-zinc-500 underline uppercase tracking-wider hover:text-zinc-300 transition-colors"
                  >
                      {showBreakdown ? 'Hide Breakdown' : 'Price Breakdown'}
                  </button>
                  
                  {showBreakdown && (
                    <div className="mt-4 p-4 bg-zinc-900 rounded-xl space-y-2 text-xs animate-in slide-in-from-top-2 border border-zinc-800">
                        <div className="flex justify-between">
                            <span className="text-zinc-400">Base Rental ({diffDays} days)</span>
                            <span className="font-bold text-zinc-200">{totalPrice.toLocaleString()} €</span>
                        </div>
                        {selectedOption && (
                             <div className="flex justify-between">
                                <span className="text-zinc-400">Insurance ({selectedOption.plan.name?.replace(/ - (Mini|Midi|Maxi)/g, "")})</span>
                                <span className="font-bold text-zinc-200">+{Math.round(insuranceCost).toLocaleString()} €</span>
                            </div>
                        )}
                        {mileageOption === 'UNLIMITED' && (
                             <div className="flex justify-between">
                                <span className="text-zinc-400">Unlimited Mileage</span>
                                <span className="font-bold text-zinc-200">+{Math.round(mileageCost).toLocaleString()} €</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-zinc-800 mt-2">
                             <span className="font-bold text-white">Total</span>
                             <span className="font-bold text-white">{finalTotal.toLocaleString()} €</span>
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
