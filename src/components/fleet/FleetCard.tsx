"use client"

import { useState } from "react"
import Image from "next/image"
import { Users, Briefcase, Gauge, Info, Check, Shield, Zap, CreditCard, MapPin, Calendar, ArrowRight, ChevronLeft, AlertCircle } from "lucide-react"
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

export function FleetCard({ 
  car, 
  searchParams 
}: { 
  car: CarType,
  searchParams?: {
    startDate?: string
    endDate?: string
  }
}) {
  const startDate = searchParams?.startDate ? new Date(searchParams.startDate) : new Date()
  const endDate = searchParams?.endDate ? new Date(searchParams.endDate) : undefined
  
  // Calculate days
  const s = new Date(startDate); s.setHours(0,0,0,0)
  const e = endDate ? new Date(endDate) : new Date(startDate)
  if (endDate) e.setHours(0,0,0,0)
  else e.setDate(e.getDate() + 1)
  
  const diffTime = Math.max(0, e.getTime() - s.getTime())
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  const imageUrl = car.imageUrl || (car.images && car.images.length > 0 ? car.images[0] : "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1936&auto=format&fit=crop")

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

  // Calculations
  const unlimitedDailyPrice = Number(car.unlimitedMileagePrice || 0)
  
  const rentalCost = basePricePerDay * diffDays
  const unlimitedCost = mileageOption === "unlimited" ? (unlimitedDailyPrice * diffDays) : 0
  
  const subTotal = rentalCost + unlimitedCost
  const vatAmount = subTotal * 0.27
  const totalRequired = subTotal + vatAmount + depositValue

  return (
    <Dialog onOpenChange={(open) => { if(!open) setStep(1) }}>
      <DialogTrigger asChild>
        <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 relative border border-zinc-200 flex flex-col cursor-pointer h-full">
          {/* Main Card Content */}
          <div className="p-6 relative z-10">
            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-1">
              {car.make} {car.model}
            </h3>
            <p className="text-zinc-500 text-sm font-medium mb-4">{car.orSimilar ? "or similar | " : ""}{car.category}</p>
            
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded text-zinc-600 text-xs font-bold border border-zinc-200">
                <Users className="w-3.5 h-3.5" /> {car.seats}
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded text-zinc-600 text-xs font-bold border border-zinc-200">
                <Briefcase className="w-3.5 h-3.5" /> {car.suitcases}
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-100 px-2 py-1 rounded text-zinc-600 text-xs font-bold border border-zinc-200">
                <Gauge className="w-3.5 h-3.5" /> {car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}
              </div>
            </div>
          </div>

          {/* Car Image - Clean on white */}
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
             <div className="flex items-center gap-2 mb-2 text-zinc-900 text-xs font-bold">
                <Check className="w-3 h-3 text-red-600" /> {car.dailyMileageLimit ? `${car.dailyMileageLimit} km / day` : "Unlimited Mileage"}
             </div>
             <div className="flex items-end justify-between">
               <div>
                 <span className="text-2xl font-black text-red-600">€{basePricePerDay.toLocaleString()}</span>
                 <span className="text-zinc-500 text-sm font-medium"> /day</span>
               </div>
               <div className="text-zinc-400 text-xs text-right font-medium">
                 {diffDays} days
               </div>
             </div>
          </div>
        </div>
      </DialogTrigger>
      
      {/* BOOKING DIALOG CONTENT */}
      <DialogContent className="max-w-5xl p-0 bg-white gap-0 overflow-hidden border-0 h-[90vh] md:h-auto md:min-h-[600px] flex flex-col md:block">
        <div className="grid md:grid-cols-12 h-full">
          
          {/* LEFT COLUMN: Car Details & Image */}
          <div className="md:col-span-5 bg-zinc-50 p-6 md:p-8 flex flex-col border-r border-zinc-100 overflow-y-auto">
             <div className="mb-6">
               <h2 className="text-3xl font-black uppercase text-zinc-900 leading-none mb-2">{car.make} {car.model}</h2>
               <p className="text-zinc-500 font-medium">{car.orSimilar ? "or similar | " : ""}{car.category}</p>
             </div>
             
             <div className="relative w-full aspect-video mb-8 bg-white rounded-xl p-4 shadow-sm border border-zinc-100 flex items-center justify-center">
                <Image 
                  src={imageUrl} 
                  alt={`${car.make} ${car.model}`} 
                  fill
                  className="object-contain p-2"
                />
             </div>

             <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
                   <Users className="w-5 h-5 text-zinc-400" />
                   <span className="font-bold text-zinc-700">{car.seats} seats</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
                   <Briefcase className="w-5 h-5 text-zinc-400" />
                   <span className="font-bold text-zinc-700">{car.suitcases} bags</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
                   <Gauge className="w-5 h-5 text-zinc-400" />
                   <span className="font-bold text-zinc-700">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-100">
                   <div className="w-5 h-5 flex items-center justify-center border-2 border-zinc-400 rounded text-[10px] font-bold text-zinc-400">{car.doors}</div>
                   <span className="font-bold text-zinc-700">{car.doors} doors</span>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-zinc-200">
                <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-red-600" /> Rental Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pick-up</span>
                    <span className="font-medium text-zinc-900">{s.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Return</span>
                    <span className="font-medium text-zinc-900">{e.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Duration</span>
                    <span className="font-medium text-zinc-900">{diffDays} Days</span>
                  </div>
                </div>
             </div>
          </div>

          {/* RIGHT COLUMN: Configuration & Steps */}
          <div className="md:col-span-7 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[90vh] md:max-h-[800px]">
            
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-1">Customize Your Booking</h3>
                  <p className="text-zinc-500 text-sm">Select the best options for your trip.</p>
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Payment Option</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setPaymentMethod("onsite")}
                      className={cn(
                        "cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative",
                        paymentMethod === "onsite" ? "border-red-600 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === "onsite" ? "border-red-600" : "border-zinc-300")}>
                          {paymentMethod === "onsite" && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                        </div>
                        <span className="font-bold text-zinc-900">Pay on Arrival</span>
                      </div>
                      <p className="text-xs text-zinc-500 pl-8">Standard Base Price. Pay when you pick up the car.</p>
                    </div>

                    <div 
                      className="opacity-60 cursor-not-allowed p-4 rounded-xl border-2 border-zinc-100 bg-zinc-50 relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2 bg-zinc-200 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        DEV
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />
                         <span className="font-bold text-zinc-400">Pay Online</span>
                      </div>
                      <p className="text-xs text-zinc-400 pl-8">Discounted rates. Currently under development.</p>
                    </div>
                  </div>
                </div>

                {/* Mileage Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Mileage Limit</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setMileageOption("limited")}
                      className={cn(
                        "cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative",
                        mileageOption === "limited" ? "border-red-600 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", mileageOption === "limited" ? "border-red-600" : "border-zinc-300")}>
                            {mileageOption === "limited" && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                          </div>
                          <span className="font-bold text-zinc-900">Standard Limit</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 pl-8 mb-2">
                        {car.dailyMileageLimit ? `${car.dailyMileageLimit} km per day included.` : "Standard mileage policy."}
                      </p>
                      {car.extraKmPrice && (
                        <div className="pl-8 text-[10px] text-zinc-400 font-medium">
                           Extra km: €{car.extraKmPrice}/km
                        </div>
                      )}
                    </div>

                    <div 
                      onClick={() => setMileageOption("unlimited")}
                      className={cn(
                        "cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 relative",
                        mileageOption === "unlimited" ? "border-red-600 bg-red-50/50" : "border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", mileageOption === "unlimited" ? "border-red-600" : "border-zinc-300")}>
                            {mileageOption === "unlimited" && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                          </div>
                          <span className="font-bold text-zinc-900">Unlimited KM</span>
                        </div>
                        {unlimitedDailyPrice > 0 && (
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            +€{unlimitedDailyPrice}/day
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 pl-8">Drive as much as you want with no extra fees.</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-3">
                  <h4 className="font-bold text-zinc-900 text-sm mb-4">Price Breakdown</h4>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Car Rental ({diffDays} days x €{basePricePerDay})</span>
                    <span className="font-medium">€{rentalCost.toFixed(2)}</span>
                  </div>
                  
                  {mileageOption === "unlimited" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Unlimited Mileage Upgrade</span>
                      <span className="font-medium">€{unlimitedCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">VAT (27%)</span>
                    <span className="font-medium">€{vatAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm pt-2 border-t border-zinc-200/50">
                     <div className="flex items-center gap-2">
                        <span className="text-zinc-600">Security Deposit</span>
                        <div className="group relative">
                           <AlertCircle className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-zinc-900 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              Refundable upon safe return of the vehicle.
                           </div>
                        </div>
                     </div>
                     <span className="font-medium">€{depositValue.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-end pt-4 border-t border-zinc-200 mt-2">
                    <span className="font-black text-lg text-zinc-900">Total</span>
                    <div className="text-right">
                       <span className="font-black text-2xl text-red-600 block leading-none">€{totalRequired.toFixed(2)}</span>
                       <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Includes VAT & Deposit</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20"
                >
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="-ml-2 mb-2 text-zinc-500 hover:text-zinc-900">
                       <ChevronLeft className="w-4 h-4 mr-1" /> Back to Options
                    </Button>
                    <h3 className="text-xl font-bold text-zinc-900 mb-1">Your Details</h3>
                    <p className="text-zinc-500 text-sm">Please fill in your information to complete the booking.</p>
                 </div>

                 <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input placeholder="John" />
                       </div>
                       <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input placeholder="Doe" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label>Email Address</Label>
                       <Input type="email" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                       <Label>Phone Number</Label>
                       <Input type="tel" placeholder="+36 30 123 4567" />
                    </div>
                    <div className="space-y-2">
                       <Label>Additional Requests (Optional)</Label>
                       <Input placeholder="Flight number, child seat request, etc." />
                    </div>
                 </div>

                 <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex gap-3">
                    <Shield className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                       By clicking "Book Now", you agree to our Terms of Service and Privacy Policy. The security deposit will be blocked on your card upon arrival.
                    </p>
                 </div>

                 <Button 
                    className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 shadow-xl"
                 >
                    Book Now
                 </Button>
              </div>
            )}
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
