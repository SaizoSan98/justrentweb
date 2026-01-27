"use client"

import { useState } from "react"
import { Car } from "@prisma/client"
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

type FleetCardProps = {
  car: Car & { pricingTiers: PricingTier[] }
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
        <div className="group bg-zinc-900 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative border border-zinc-800 flex flex-col cursor-pointer h-full">
          {/* Main Card Content - SIXT Style */}
          <div className="p-6 relative z-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
              {car.make} {car.model}
            </h3>
            <p className="text-zinc-400 text-sm font-medium mb-4">vagy hasonló | {car.category}</p>
            
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded text-zinc-300 text-xs font-bold">
                <Users className="w-3.5 h-3.5" /> 5
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded text-zinc-300 text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5" /> 2
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded text-zinc-300 text-xs font-bold">
                <Gauge className="w-3.5 h-3.5" /> Kézi
              </div>
            </div>
          </div>

          {/* Car Image - Overlapping */}
          <div className="relative h-48 -mt-8 mb-4 flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt={`${car.make} ${car.model}`} 
              className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-0"
            />
            {/* Fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
          </div>

          {/* Footer Price */}
          <div className="mt-auto p-6 pt-0 relative z-20">
             <div className="flex items-center gap-2 mb-2 text-green-500 text-xs font-bold">
                <Check className="w-3 h-3" /> Korlátlan kilométer
             </div>
             <div className="flex items-end justify-between">
               <div>
                 <span className="text-2xl font-black text-white">{pricePerDay.toLocaleString()} Ft</span>
                 <span className="text-zinc-400 text-sm font-medium"> /nap</span>
               </div>
               <div className="text-zinc-500 text-xs text-right">
                 {totalPrice.toLocaleString()} Ft Összesen
               </div>
             </div>
          </div>
        </div>
      </DialogTrigger>
      
      {/* Detail Modal */}
      <DialogContent className="max-w-5xl p-0 bg-white gap-0 overflow-hidden border-0">
        <div className="grid md:grid-cols-2 h-full min-h-[600px]">
          {/* Left: Car Visuals */}
          <div className="bg-zinc-900 p-8 flex flex-col relative text-white">
             <div className="mb-8">
               <h2 className="text-4xl font-black uppercase mb-2">{car.make} {car.model}</h2>
               <p className="text-zinc-400 font-medium">vagy hasonló | {car.category}</p>
             </div>
             
             <div className="flex-grow flex items-center justify-center relative my-8">
                <img 
                  src={imageUrl} 
                  alt={`${car.make} ${car.model}`} 
                  className="w-full object-contain drop-shadow-2xl scale-110"
                />
             </div>

             <div className="grid grid-cols-4 gap-4 text-center mt-auto">
                <div className="flex flex-col items-center gap-2">
                   <Users className="w-6 h-6 text-zinc-400" />
                   <span className="text-sm font-bold">5 ülés</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <Briefcase className="w-6 h-6 text-zinc-400" />
                   <span className="text-sm font-bold">2 táska</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <Gauge className="w-6 h-6 text-zinc-400" />
                   <span className="text-sm font-bold">Kézi</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-6 h-6 flex items-center justify-center border-2 border-zinc-400 rounded text-xs font-bold text-zinc-400">5</div>
                   <span className="text-sm font-bold">5 ajtó</span>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center gap-2 text-zinc-400 text-sm">
                <Info className="w-4 h-4" /> A sofőr minimális életkora: 21 év
             </div>
          </div>

          {/* Right: Booking Options */}
          <div className="p-8 flex flex-col bg-zinc-50 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-zinc-900">Foglalási lehetőségek</h3>
               {/* Close button is handled by DialogPrimitive.Close in DialogContent but we can add visual header if needed */}
             </div>

             {/* Rate Selection */}
             <div className="space-y-4 mb-8">
                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-orange-200",
                    selectedRate === "best" ? "border-black ring-1 ring-black/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedRate("best")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedRate === "best" ? (
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">Legjobb ár</h4>
                            <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded">Tartalmaz</span>
                         </div>
                         <p className="text-xs text-zinc-500">Fizess most, lemondható és módosítható díj ellenében</p>
                      </div>
                   </div>
                </div>

                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-orange-200",
                    selectedRate === "flexible" ? "border-black ring-1 ring-black/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedRate("flexible")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedRate === "flexible" ? (
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">Maradjon rugalmas</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold bg-orange-600 text-white px-2 py-1 rounded">Népszerű</span>
                              <span className="text-xs font-bold text-zinc-900">+{flexibleSurcharge.toLocaleString()} Ft / nap</span>
                            </div>
                         </div>
                         <p className="text-xs text-zinc-500">Fizessen átvételkor, ingyenes lemondás és újrafoglalás bármikor az átvétel időpontja előtt</p>
                      </div>
                   </div>
                </div>
             </div>

             <h3 className="text-lg font-bold text-zinc-900 mb-4">Futásteljesítményt</h3>

             {/* Mileage Selection */}
             <div className="space-y-4 mb-8">
                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-orange-200",
                    selectedMileage === "limited" ? "border-black ring-1 ring-black/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedMileage("limited")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedMileage === "limited" ? (
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">1200 km</h4>
                            <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded">Tartalmaz</span>
                         </div>
                         <p className="text-xs text-zinc-500">+194,74 Ft / minden megtett plusz km</p>
                      </div>
                   </div>
                </div>

                <div 
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all bg-white hover:border-orange-200",
                    selectedMileage === "unlimited" ? "border-black ring-1 ring-black/5" : "border-zinc-200"
                  )}
                  onClick={() => setSelectedMileage("unlimited")}
                >
                   <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {selectedMileage === "unlimited" ? (
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-zinc-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-grow">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold text-zinc-900">Korlátlan km</h4>
                            <span className="text-xs font-bold text-zinc-900">+{Math.round(unlimitedMileageSurcharge).toLocaleString()} Ft naponta</span>
                         </div>
                         <p className="text-xs text-zinc-500">Az összes kilométer benne van az árban</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Footer Summary */}
             <div className="mt-auto pt-6 border-t border-zinc-200">
                <div className="flex justify-between items-end mb-4">
                   <div>
                      <div className="text-3xl font-black text-zinc-900">{Math.round(finalPricePerDay).toLocaleString()} Ft <span className="text-lg font-medium text-zinc-500">/nap</span></div>
                      <div className="text-sm text-zinc-500">{finalTotalPrice.toLocaleString()} Ft Összesen</div>
                   </div>
                   
                   {/* Price Breakdown Trigger - Could be another Dialog */}
                   <Dialog>
                     <DialogTrigger asChild>
                       <button className="text-sm font-bold underline text-zinc-900 hover:text-orange-600">Ár részletezése</button>
                     </DialogTrigger>
                     <DialogContent className="max-w-md bg-white p-6">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black uppercase mb-6">Ár Részletezése</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                           <div>
                              <h4 className="font-bold mb-2">Bérleti díjak</h4>
                              <div className="flex justify-between text-sm">
                                 <span>{diffDays} Alapdíj x {Math.round(finalPricePerDay).toLocaleString()} Ft</span>
                                 <span className="font-bold">{finalTotalPrice.toLocaleString()} Ft</span>
                              </div>
                           </div>
                           
                           <div>
                              <h4 className="font-bold mb-2">Adók és díjak</h4>
                              <div className="space-y-2 text-sm text-zinc-600">
                                 <div className="flex justify-between">
                                    <span>Regisztrációs díj</span>
                                    <span>34 916 Ft</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span>Szerződéskötési díj</span>
                                    <span>1 115 Ft</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span>Winterization fee</span>
                                    <span>48 494 Ft</span>
                                 </div>
                              </div>
                           </div>

                           <div className="pt-4 border-t border-zinc-200 flex justify-between items-center">
                              <span className="font-bold text-lg">Összesen (adóval együtt)</span>
                              <span className="font-black text-2xl">{(finalTotalPrice + 34916 + 1115 + 48494).toLocaleString()} Ft</span>
                           </div>
                        </div>
                     </DialogContent>
                   </Dialog>
                </div>
                
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-orange-600/20 text-lg uppercase tracking-wide">
                   Következő
                </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
