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

import { createBooking } from "@/app/fleet/actions"

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
  category: string
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

  const imageUrl = car.imageUrl || (car.images && car.images.length > 0 ? car.images[0] : "/placeholder-car.jpg")

  const [state, formAction, isPending] = useActionState(createBooking, null)

  // Pricing Logic
  const tier = car.pricingTiers.find(
    (t: any) => diffDays >= t.minDays && (t.maxDays === null || diffDays <= t.maxDays)
  )
  const basePricePerDay = tier ? Number(tier.pricePerDay) : Number(car.pricePerDay)
  const depositValue = tier ? Number(tier.deposit) : Number(car.deposit || 0)

  // Booking State
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<"onsite" | "online">("onsite")
  const [mileageOption, setMileageOption] = useState<"limited" | "unlimited">("limited")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  // Calculations
  const unlimitedDailyPrice = Number(car.unlimitedMileagePrice || 0)
  
  const rentalCost = basePricePerDay * diffDays
  const unlimitedCost = mileageOption === "unlimited" ? (unlimitedDailyPrice * diffDays) : 0
  
  // Calculate extras cost
  const extrasCost = selectedExtras.reduce((total, extraId) => {
    const extra = extras.find(e => e.id === extraId)
    if (!extra) return total
    
    if (extra.priceType === 'PER_DAY') {
      return total + (extra.price * diffDays)
    } else {
      return total + extra.price
    }
  }, 0)

  const subTotal = rentalCost + unlimitedCost + extrasCost
  const vatAmount = subTotal * 0.27
  const totalRequired = subTotal + vatAmount + depositValue

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    )
  }

  const getExtraIcon = (iconName: string | null) => {
    switch(iconName) {
      case 'Baby': return <Baby className="w-5 h-5" />
      case 'Map': return <Map className="w-5 h-5" />
      case 'User': return <UserPlus className="w-5 h-5" />
      case 'Wifi': return <Wifi className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const CardContent = (
    <div className={cn(
      "group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 relative border flex flex-col cursor-pointer h-full",
      isDark 
        ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900" 
        : "bg-white border-zinc-200 hover:border-red-200"
    )}>
      {/* Main Card Content */}
      <div className="p-6 relative z-10">
        <h3 className={cn(
          "text-2xl font-black uppercase tracking-tight mb-1",
          isDark ? "text-white" : "text-zinc-900"
        )}>
          {car.make} {car.model}
        </h3>
        <p className={cn(
          "text-sm font-medium mb-4",
          isDark ? "text-zinc-400" : "text-zinc-500"
        )}>{car.orSimilar ? `${t('similar')} | ` : ""}{car.category}</p>
        
        <div className="flex gap-4 mb-4">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border",
            isDark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-zinc-100 text-zinc-600 border-zinc-200"
          )}>
            <Users className="w-3.5 h-3.5" /> {car.seats}
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border",
            isDark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-zinc-100 text-zinc-600 border-zinc-200"
          )}>
            <Briefcase className="w-3.5 h-3.5" /> {car.suitcases}
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border",
            isDark ? "bg-zinc-800 text-zinc-300 border-zinc-700" : "bg-zinc-100 text-zinc-600 border-zinc-200"
          )}>
            <Settings className="w-3.5 h-3.5" /> {tCommon(car.transmission === 'AUTOMATIC' ? 'automatic' : 'manual')}
          </div>
        </div>
      </div>

      {/* Car Image - Clean */}
      <div className="relative h-48 -mt-8 mb-4 flex items-center justify-center p-4">
        <Image 
          src={imageUrl} 
          alt={`${car.make} ${car.model}`} 
          fill
          className="object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500 relative z-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Footer Price */}
      <div className="mt-auto p-6 pt-0 relative z-20">
         <div className={cn(
           "flex items-center gap-2 mb-2 text-xs font-bold",
           isDark ? "text-zinc-300" : "text-zinc-900"
         )}>
            <Check className="w-3 h-3 text-red-600" /> {car.dailyMileageLimit ? `${car.dailyMileageLimit} ${tCommon('km')} / ${tCommon('day')}` : t('unlimited_mileage')}
         </div>
         <div className="flex items-end justify-between">
           <div>
             <span className="text-2xl font-black text-red-600">€{basePricePerDay.toLocaleString()}</span>
             <span className={cn("text-sm font-medium", isDark ? "text-zinc-500" : "text-zinc-500")}> /{tCommon('day')}</span>
           </div>
           <div className={cn("text-xs text-right font-medium", isDark ? "text-zinc-500" : "text-zinc-400")}>
             {diffDays} {tCommon('days')}
           </div>
         </div>
      </div>
    </div>
  )

  if (redirectToFleet) {
    return (
      <Link href="/fleet" className="block h-full">
        {CardContent}
      </Link>
    )
  }

  return (
    <Dialog onOpenChange={(open) => { if(!open) setStep(1) }}>
      <DialogTrigger asChild>
        {CardContent}
      </DialogTrigger>
      
      {/* BOOKING DIALOG CONTENT */}
      <DialogContent className="max-w-5xl p-0 bg-white gap-0 overflow-y-auto md:overflow-hidden border-0 max-h-[90vh] md:h-auto md:max-h-[800px] flex flex-col md:block w-[95vw] md:w-full rounded-2xl md:rounded-xl">
        <div className="flex flex-col md:grid md:grid-cols-12 md:h-full">
          
          {/* LEFT COLUMN: Car Details & Image */}
          <div className="md:col-span-5 bg-zinc-50 p-4 md:p-6 flex flex-col border-b md:border-b-0 md:border-r border-zinc-100 h-auto md:h-full md:overflow-y-auto shrink-0">
             <div className="mb-4">
               <h2 className="text-2xl font-black uppercase text-zinc-900 leading-none mb-1">{car.make} {car.model}</h2>
               <p className="text-zinc-500 font-medium text-sm">{car.orSimilar ? t('similar') + " | " : ""}{car.category}</p>
             </div>
             
             <div className="relative w-full aspect-video mb-4 bg-white rounded-xl p-2 shadow-sm border border-zinc-100 flex items-center justify-center">
                <Image 
                  src={imageUrl} 
                  alt={`${car.make} ${car.model}`} 
                  fill
                  className="object-contain p-2"
                />
             </div>

             <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-100">
                   <Users className="w-4 h-4 text-zinc-400" />
                   <span className="font-bold text-zinc-700">{car.seats} {t('seats')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-100">
                   <Briefcase className="w-4 h-4 text-zinc-400" />
                   <span className="font-bold text-zinc-700">{car.suitcases} {t('bags')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-100">
                   <Settings className="w-4 h-4 text-zinc-400" />
                   <span className="font-bold text-zinc-700">{car.transmission === 'AUTOMATIC' ? tCommon('automatic') : tCommon('manual')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-100">
                   <div className="w-4 h-4 flex items-center justify-center border border-zinc-400 rounded text-[9px] font-bold text-zinc-400">{car.doors}</div>
                   <span className="font-bold text-zinc-700">{car.doors} {t('doors')}</span>
                </div>
             </div>

             <div className="mt-4 pt-4 border-t border-zinc-200 shrink-0">
                <h4 className="font-bold text-zinc-900 mb-2 flex items-center gap-2 text-sm">
                  <Info className="w-3.5 h-3.5 text-red-600" /> {t('rental_details', 'booking')}
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('pickup', 'booking')}</span>
                    <span className="font-medium text-zinc-900">{s.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('return', 'booking')}</span>
                    <span className="font-medium text-zinc-900">{e.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('duration', 'booking')}</span>
                    <span className="font-medium text-zinc-900">{diffDays} {diffDays > 1 ? tCommon('days') : tCommon('day')}</span>
                  </div>
                </div>
             </div>

             {/* Dynamic Price Display */}
             <div className="mt-auto pt-4 border-t border-zinc-200">
                <div className="flex justify-between items-end">
                   <div>
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{t('total')}</span>
                      <div className="text-[10px] text-zinc-400">{t('incl_vat', 'booking')}</div>
                   </div>
                   <div className="text-xl font-black text-red-600">
                      €{totalRequired.toFixed(2)}
                   </div>
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: Configuration & Steps */}
          <div className="md:col-span-7 p-4 md:p-6 flex flex-col h-auto md:h-full md:overflow-y-auto">
            
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-0.5">{t('customize_title', 'booking')}</h3>
                  <p className="text-zinc-500 text-xs">Select the best options for your trip.</p>
                </div>

                {/* Payment Options */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">{t('payment_method', 'booking')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                      onClick={() => setPaymentMethod("onsite")}
                      className={cn(
                        "cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 relative",
                        paymentMethod === "onsite" ? "border-red-600 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", paymentMethod === "onsite" ? "border-red-600" : "border-zinc-300")}>
                          {paymentMethod === "onsite" && <div className="w-2 h-2 rounded-full bg-red-600" />}
                        </div>
                        <span className="font-bold text-zinc-900 text-sm">{t('pay_onsite', 'booking')}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 pl-6">Standard Base Price.</p>
                    </div>

                    <div 
                      className="opacity-60 cursor-not-allowed p-3 rounded-lg border-2 border-zinc-100 bg-zinc-50 relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 bg-zinc-200 text-zinc-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        DEV
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                         <div className="w-4 h-4 rounded-full border-2 border-zinc-200" />
                         <span className="font-bold text-zinc-400 text-sm">{t('pay_online', 'booking')}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 pl-6">Discounted rates.</p>
                    </div>
                  </div>
                </div>

                {/* Mileage Options */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">{t('mileage')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div 
                      onClick={() => setMileageOption("limited")}
                      className={cn(
                        "cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 relative",
                        mileageOption === "limited" ? "border-red-600 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", mileageOption === "limited" ? "border-red-600" : "border-zinc-300")}>
                            {mileageOption === "limited" && <div className="w-2 h-2 rounded-full bg-red-600" />}
                          </div>
                          <span className="font-bold text-zinc-900 text-sm">{t('standard_limit', 'booking')}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 pl-6 mb-1">
                        {car.dailyMileageLimit ? `${car.dailyMileageLimit} ${tCommon('km')}/${tCommon('day')}` : "Standard"}
                      </p>
                      {car.extraKmPrice && (
                        <div className="pl-6 text-[9px] text-zinc-400 font-medium">
                           Extra: €{car.extraKmPrice}/{tCommon('km')}
                        </div>
                      )}
                    </div>

                    <div 
                      onClick={() => setMileageOption("unlimited")}
                      className={cn(
                        "cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 relative",
                        mileageOption === "unlimited" ? "border-red-600 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", mileageOption === "unlimited" ? "border-red-600" : "border-zinc-300")}>
                            {mileageOption === "unlimited" && <div className="w-2 h-2 rounded-full bg-red-600" />}
                          </div>
                          <span className="font-bold text-zinc-900 text-sm">{t('unlimited')}</span>
                        </div>
                        {unlimitedDailyPrice > 0 && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                            +€{unlimitedDailyPrice}/d
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 pl-6">{t('unlimited_desc', 'booking')}</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 space-y-2 mt-auto mb-16 md:mb-0">
                  <h4 className="font-bold text-zinc-900 text-xs mb-2">{t('price_breakdown', 'booking')}</h4>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">{t('car_rental', 'booking')} ({diffDays} {diffDays > 1 ? tCommon('days') : tCommon('day')} x €{basePricePerDay})</span>
                    <span className="font-medium">€{rentalCost.toFixed(2)}</span>
                  </div>
                  
                  {mileageOption === "unlimited" && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-600">{t('unlimited_upgrade', 'booking')}</span>
                      <span className="font-medium">€{unlimitedCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600">{t('vat', 'booking')} (27%)</span>
                    <span className="font-medium">€{vatAmount.toFixed(2)}</span>
                  </div>

                  {extrasCost > 0 && (
                    <div className="flex justify-between text-xs pt-1 border-t border-zinc-200/50">
                       <span className="text-zinc-600">{t('selected_extras', 'booking')}</span>
                       <span className="font-medium">€{extrasCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs pt-1 border-t border-zinc-200/50">
                     <div className="flex items-center gap-1">
                        <span className="text-zinc-600">{t('deposit')}</span>
                        <div className="group relative">
                           <AlertCircle className="w-3 h-3 text-zinc-400 cursor-help" />
                        </div>
                     </div>
                     <span className="font-medium">€{depositValue.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-end pt-2 border-t border-zinc-200 mt-1">
                    <span className="font-black text-sm text-zinc-900">{t('total')}</span>
                    <div className="text-right">
                       <span className="font-black text-xl text-red-600 block leading-none">€{totalRequired.toFixed(2)}</span>
                       <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">{t('incl_vat', 'booking')}</span>
                    </div>
                  </div>
                </div>

                 <div className="md:hidden mt-8 mb-24">
                   <Button 
                     onClick={() => setStep(2)} 
                     className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                   >
                     {tCommon('next_step')} <ArrowRight className="w-5 h-5 ml-2" />
                   </Button>
                 </div>

                 <div className="hidden md:block fixed bottom-0 left-0 w-full p-4 bg-white border-t border-zinc-200 md:static md:p-0 md:bg-transparent md:border-0 z-50">
                  <Button 
                    onClick={() => setStep(2)} 
                    className="w-full h-12 md:h-10 text-base md:text-sm font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                  >
                    {tCommon('next_step')} <ArrowRight className="w-5 h-5 md:w-4 md:h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 md:pb-0">
                 <div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="-ml-2 mb-1 h-8 text-zinc-500 hover:text-zinc-900">
                       <ChevronLeft className="w-4 h-4 mr-1" /> {t('back_to_options', 'booking')}
                    </Button>
                    <h3 className="text-lg font-bold text-zinc-900 mb-0.5">{t('customize_extras', 'booking')}</h3>
                    <p className="text-zinc-500 text-xs">{t('extras_desc', 'booking')}</p>
                 </div>

                 {/* Extras Selection (Now in Step 2) */}
                 {extras.length > 0 ? (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">{t('add_extras', 'booking')}</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {extras.map(extra => (
                        <div 
                          key={extra.id}
                          onClick={() => toggleExtra(extra.id)}
                          className={cn(
                            "cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between",
                            selectedExtras.includes(extra.id) ? "border-red-600 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-8 h-8 rounded-full flex items-center justify-center",
                               selectedExtras.includes(extra.id) ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
                             )}>
                               {getExtraIcon(extra.icon)}
                             </div>
                             <div>
                               <div className="font-bold text-zinc-900 text-sm">{extra.name}</div>
                               <div className="text-[10px] text-zinc-500">
                                 €{extra.price} {extra.priceType === 'PER_DAY' ? `/${tCommon('day')}` : '/rental'}
                               </div>
                             </div>
                          </div>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", selectedExtras.includes(extra.id) ? "border-red-600" : "border-zinc-300")}>
                            {selectedExtras.includes(extra.id) && <div className="w-2 h-2 rounded-full bg-red-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                 ) : (
                   <div className="py-8 text-center text-zinc-500 text-sm bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                     {t('no_extras', 'booking')}
                   </div>
                 )}
                 
                 <div className="md:hidden mt-8 mb-24">
                   <Button 
                     onClick={() => setStep(3)} 
                     className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                   >
                     {tCommon('next_step')} <ArrowRight className="w-5 h-5 ml-2" />
                   </Button>
                 </div>

                 <div className="hidden md:block fixed bottom-0 left-0 w-full p-4 bg-white border-t border-zinc-200 md:static md:p-0 md:bg-transparent md:border-0 z-50">
                   <Button 
                     onClick={() => setStep(3)} 
                     className="w-full h-12 md:h-10 text-base md:text-sm font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                   >
                     {tCommon('next_step')} <ArrowRight className="w-5 h-5 md:w-4 md:h-4 ml-2" />
                   </Button>
                 </div>
              </div>
            )}

            {step === 3 && (
              <form action={formAction} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 md:pb-0">
                 <input type="hidden" name="carId" value={car.id} />
                 <input type="hidden" name="startDate" value={startDate.toISOString()} />
                 <input type="hidden" name="endDate" value={endDate ? endDate.toISOString() : new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString()} />
                 <input type="hidden" name="totalPrice" value={totalRequired} />
                 <input type="hidden" name="extras" value={JSON.stringify(selectedExtras)} />

                 <div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setStep(2)} className="-ml-2 mb-1 h-8 text-zinc-500 hover:text-zinc-900">
                       <ChevronLeft className="w-4 h-4 mr-1" /> {t('back_to_extras', 'booking')}
                    </Button>
                    <h3 className="text-lg font-bold text-zinc-900 mb-0.5">{t('personal_details', 'booking')}</h3>
                    <p className="text-zinc-500 text-xs">{t('fill_details', 'booking')}</p>
                 </div>

                 {state?.error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" />
                       {state.error}
                    </div>
                 )}

                 <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <Label className="text-xs">{t('first_name', 'booking')}</Label>
                          <Input name="firstName" className="h-9" placeholder="John" required />
                       </div>
                       <div className="space-y-1">
                          <Label className="text-xs">{t('last_name', 'booking')}</Label>
                          <Input name="lastName" className="h-9" placeholder="Doe" required />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">{t('email', 'booking')}</Label>
                       <Input name="email" className="h-9" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">{t('phone', 'booking')}</Label>
                       <Input name="phone" className="h-9" type="tel" placeholder="+36 30 123 4567" required />
                    </div>
                    <div className="space-y-1">
                       <Label className="text-xs">{t('comments', 'booking')}</Label>
                       <Input name="comments" className="h-9" placeholder="Flight number, child seat request, etc." />
                    </div>
                 </div>

                 <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex gap-2">
                    <Shield className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">
                       {t('terms_disclaimer', 'booking')}
                    </p>
                 </div>

                 <div className="md:hidden mt-8 mb-24">
                    <Button 
                       type="submit"
                       disabled={isPending}
                       className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 shadow-xl disabled:opacity-50"
                    >
                       {isPending ? tCommon('loading') : t('book_now')}
                    </Button>
                 </div>

                 <div className="hidden md:block fixed bottom-0 left-0 w-full p-4 bg-white border-t border-zinc-200 md:static md:p-0 md:bg-transparent md:border-0 z-50">
                    <Button 
                       type="submit"
                       disabled={isPending}
                       className="w-full h-12 md:h-10 text-base md:text-sm font-bold bg-zinc-900 hover:bg-zinc-800 shadow-xl disabled:opacity-50"
                    >
                       {isPending ? tCommon('loading') : t('book_now')}
                    </Button>
                 </div>
              </form>
            )}
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
