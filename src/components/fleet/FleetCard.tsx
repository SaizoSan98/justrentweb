"use client"

import { useState } from "react"
import Image from "next/image"
import { Users, Briefcase, Gauge, Info, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  pricePerDay: number
  status: string
  pricingTiers: PricingTier[]
  // New fields
  seats?: number
  suitcases?: number
  doors?: number
  transmission?: string
  fuelType?: string
  orSimilar?: boolean
  dailyMileageLimit?: number | null
}

type FleetCardProps = {
  car: CarType
  diffDays: number
  imageUrl: string
}

export function FleetCard({ car, diffDays, imageUrl }: FleetCardProps) {
  const tier = car.pricingTiers.find(
    (t) => diffDays >= t.minDays && (t.maxDays === null || diffDays <= t.maxDays)
  )
  const pricePerDay = tier ? Number(tier.pricePerDay) : Number(car.pricePerDay)
  const totalPrice = pricePerDay * diffDays
  
  // Options state
  const [selectedRate, setSelectedRate] = useState<"best" | "flexible">("best")
  const [selectedMileage, setSelectedMileage] = useState<"limited" | "unlimited">("limited")
  
  // Calculations
  const flexibleSurcharge = Math.round(pricePerDay * 0.15) // 15% extra
  const unlimitedMileageSurcharge = 46968 / diffDays // Fixed total extra spread per day for demo
  
  const finalPricePerDay = pricePerDay + 
    (selectedRate === "flexible" ? flexibleSurcharge : 0) +
    (selectedMileage === "unlimited" ? unlimitedMileageSurcharge : 0)
    
  const finalTotalPrice = Math.round(finalPricePerDay * diffDays)

  return (
    <Dialog>
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
                 <span className="text-2xl font-black text-red-600">{pricePerDay.toLocaleString()} Ft</span>
                 <span className="text-zinc-500 text-sm font-medium"> /day</span>
               </div>
               <div className="text-zinc-400 text-xs text-right font-medium">
                 {totalPrice.toLocaleString()} Ft Total
               </div>
             </div>
          </div>
        </div>
      </DialogTrigger>
      
      {/* Detail Modal */}
      <DialogContent className="max-w-5xl p-0 bg-white gap-0 overflow-hidden border-0">
        <div className="grid md:grid-cols-2 h-full min-h-[600px]">
          {/* Left: Car Visuals */}
          <div className="bg-white p-8 flex flex-col relative text-zinc-900 border-r border-zinc-100">
             <div className="mb-8">
               <h2 className="text-4xl font-black uppercase mb-2">{car.make} {car.model}</h2>
               <p className="text-zinc-500 font-medium">{car.orSimilar ? "or similar | " : ""}{car.category}</p>
             </div>
             
             <div className="flex-grow flex items-center justify-center relative my-8 h-64">
                <Image 
                  src={imageUrl} 
                  alt={`${car.make} ${car.model}`} 
                  fill
                  className="object-contain drop-shadow-2xl scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
             </div>

             <div className="grid grid-cols-4 gap-4 text-center mt-auto">
                <div className="flex flex-col items-center gap-2">
                   <Users className="w-6 h-6 text-zinc-400" />
                   <span className="text-sm font-bold">{car.seats} seats</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <Briefcase className="w-6 h-6 text-zinc-400" />
                   <span className="text-sm font-bold">{car.suitcases} bags</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <Gauge className="w-6 h-6 text-zinc-400" />
                   <span className="text-sm font-bold">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-6 h-6 flex items-center justify-center border-2 border-zinc-400 rounded text-xs font-bold text-zinc-400">{car.doors}</div>
                   <span className="text-sm font-bold">{car.doors} doors</span>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-zinc-200 flex items-center gap-2 text-zinc-500 text-sm">
                <Info className="w-4 h-4" /> Minimum driver age: 21
             </div>
          </div>

          {/* Right: Booking Options */}
          <div className="p-8 flex flex-col bg-white h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-zinc-900">Booking Options</h3>
               {/* Close button is handled by DialogPrimitive.Close in DialogContent but we can add visual header if needed */}
             </div>

             {/* Rate Selection */}
             <div className="space-y-4 mb-8">
                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-red-200",
                    selectedRate === "best" ? "border-red-600 ring-1 ring-red-600/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedRate("best")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedRate === "best" ? (
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">Best Price</h4>
                            <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded">Included</span>
                         </div>
                         <p className="text-xs text-zinc-500">Pay now, cancellable and modifiable for a fee</p>
                      </div>
                   </div>
                </div>

                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-red-200",
                    selectedRate === "flexible" ? "border-red-600 ring-1 ring-red-600/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedRate("flexible")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedRate === "flexible" ? (
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">Stay Flexible</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded">Popular</span>
                              <span className="text-xs font-bold text-zinc-900">+{flexibleSurcharge.toLocaleString()} Ft / day</span>
                            </div>
                         </div>
                         <p className="text-xs text-zinc-500">Pay at pick-up, free cancellation and rebooking anytime before pick-up</p>
                      </div>
                   </div>
                </div>
             </div>

             <h3 className="text-lg font-bold text-zinc-900 mb-4">Mileage</h3>

             {/* Mileage Selection */}
             <div className="space-y-4 mb-8">
                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-red-200",
                    selectedMileage === "limited" ? "border-red-600 ring-1 ring-red-600/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedMileage("limited")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedMileage === "limited" ? (
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">1200 km</h4>
                            <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded">Included</span>
                         </div>
                         <p className="text-xs text-zinc-500">+194.74 Ft / extra km</p>
                      </div>
                   </div>
                </div>

                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-red-200",
                    selectedMileage === "unlimited" ? "border-red-600 ring-1 ring-red-600/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedMileage("unlimited")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedMileage === "unlimited" ? (
                          <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">Unlimited km</h4>
                            <span className="text-xs font-bold text-zinc-900">+{Math.round(unlimitedMileageSurcharge).toLocaleString()} Ft per day</span>
                         </div>
                         <p className="text-xs text-zinc-500">All kilometers included in the price</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Footer Summary */}
             <div className="mt-auto pt-6 border-t border-zinc-200">
                <div className="flex justify-between items-end mb-4">
                   <div>
                      <div className="text-3xl font-black text-zinc-900">{Math.round(finalPricePerDay).toLocaleString()} Ft <span className="text-lg font-medium text-zinc-500">/day</span></div>
                      <div className="text-sm text-zinc-500">{finalTotalPrice.toLocaleString()} Ft Total</div>
                   </div>
                   
                   {/* Price Breakdown Trigger - Could be another Dialog */}
                   <Dialog>
                     <DialogTrigger asChild>
                       <button className="text-sm font-bold underline text-zinc-900 hover:text-red-600">Price Breakdown</button>
                     </DialogTrigger>
                     <DialogContent className="max-w-md bg-white p-6">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black uppercase mb-6">Price Breakdown</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                           <div>
                              <h4 className="font-bold mb-2">Rental Fees</h4>
                              <div className="flex justify-between text-sm">
                                 <span>{diffDays} Base rate x {Math.round(finalPricePerDay).toLocaleString()} Ft</span>
                                 <span className="font-bold">{finalTotalPrice.toLocaleString()} Ft</span>
                              </div>
                           </div>
                           
                           <div>
                              <h4 className="font-bold mb-2">Taxes & Fees</h4>
                              <div className="space-y-2 text-sm text-zinc-600">
                                 <div className="flex justify-between">
                                    <span>Registration Fee</span>
                                    <span>34,916 Ft</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span>Contract Fee</span>
                                    <span>1,115 Ft</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span>Winterization Fee</span>
                                    <span>48,494 Ft</span>
                                 </div>
                              </div>
                           </div>

                           <div className="pt-4 border-t border-zinc-200 flex justify-between items-center">
                              <span className="font-bold text-lg">Total (incl. tax)</span>
                              <span className="font-black text-2xl">{(finalTotalPrice + 34916 + 1115 + 48494).toLocaleString()} Ft</span>
                           </div>
                        </div>
                     </DialogContent>
                   </Dialog>
                </div>
                
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-red-600/20 text-lg uppercase tracking-wide"
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search)
                    params.set('carId', car.id)
                    window.location.href = `/checkout?${params.toString()}`
                  }}
                >
                   Next
                </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
