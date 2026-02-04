
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { 
  X, Check, Info, Shield, Zap, CreditCard, Users, Briefcase, Gauge, 
  Fuel, MapPin, Calendar, ArrowRight, ChevronLeft, AlertCircle, Plane
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
// import { createBooking } from "@/app/actions/booking" // We will create this

// Types
type CarType = {
  id: string
  make: string
  model: string
  imageUrl: string | null
  pricePerDay: number
  deposit?: number
  pricingTiers: any[]
  insuranceOptions?: any[]
  seats?: number
  suitcases?: number
  transmission?: string
  fuelType?: string
  dailyMileageLimit?: number | null
  extraKmPrice?: number
  unlimitedMileagePrice?: number
  fullInsurancePrice?: number
  registrationFee?: number
  contractFee?: number
  winterizationFee?: number
  pickupAfterHoursPrice?: number
  returnAfterHoursPrice?: number
}

type Extra = {
  id: string
  name: string
  price: number
  priceType: string
  icon: string | null
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  car: CarType
  searchParams: { startDate?: string; endDate?: string }
  extras: Extra[]
}

const STEPS = [
  { id: 1, title: "Overview" },
  { id: 2, title: "Insurance" },
  { id: 3, title: "Extras" },
  { id: 4, title: "Details" },
  { id: 5, title: "Summary" }
]

export function BookingModal({ isOpen, onClose, car, searchParams, extras }: BookingModalProps) {
  // --- State ---
  const [step, setStep] = useState(1)
  const [isPriceDetailsOpen, setIsPriceDetailsOpen] = useState(false)
  
  // Selections
  const [mileageOption, setMileageOption] = useState<'LIMITED' | 'UNLIMITED'>('LIMITED')
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>("")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  
  // User Details
  const [driverDetails, setDriverDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Hungary", 
    flightNumber: "",
    isAgeConfirmed: false,
    hasLicense: true,
    comments: ""
  })

  // --- Calculations ---
  const startDate = searchParams.startDate ? new Date(searchParams.startDate) : new Date()
  const endDate = searchParams.endDate ? new Date(searchParams.endDate) : new Date(new Date().setDate(new Date().getDate() + 1))
  
  // Normalize dates
  const s = new Date(startDate); s.setHours(0,0,0,0)
  const e = new Date(endDate); e.setHours(0,0,0,0)
  const diffTime = Math.max(0, e.getTime() - s.getTime())
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  // Calculate price based on duration
  let basePricePerDay = car.pricePerDay
  const matchingTier = car.pricingTiers?.find(
    (t: any) => days >= t.minDays && (t.maxDays === null || days <= t.maxDays)
  )
  if (matchingTier) basePricePerDay = matchingTier.pricePerDay

  const rentalCost = basePricePerDay * days

  // Mileage Cost
  const mileageCost = mileageOption === 'UNLIMITED' ? ((car.unlimitedMileagePrice || 0) * days) : 0

  // Insurance Cost & Deposit
  const selectedInsurance = car.insuranceOptions?.find((o: any) => o.planId === selectedInsuranceId)
  const insuranceCost = selectedInsurance ? selectedInsurance.pricePerDay * days : 0
  const currentDeposit = selectedInsurance ? selectedInsurance.deposit : (car.deposit || 0)

  // Extras Cost
  const extrasCost = selectedExtras.reduce((acc, id) => {
    const extra = extras.find(e => e.id === id)
    if (!extra) return acc
    return acc + (extra.priceType === 'PER_DAY' ? extra.price * days : extra.price)
  }, 0)

  // Fees
  const fees = {
    contract: car.contractFee || 0,
    registration: car.registrationFee || 0,
    winterization: car.winterizationFee || 0, // Should be conditional on date
    airport: 0 
  }
  const totalFees = Object.values(fees).reduce((a, b) => a + b, 0)

  const totalCost = rentalCost + mileageCost + insuranceCost + extrasCost + totalFees

  // --- Handlers ---
  const handleNext = () => setStep(prev => Math.min(prev + 1, 5))
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

  const handleBookingSubmit = async () => {
    // Call server action (pending implementation)
    // await createBooking(...)
    alert("Booking submitted! (Implementation pending)")
    onClose()
  }

  // Set default insurance to the cheapest/first one if not set
  useEffect(() => {
    if (car.insuranceOptions && car.insuranceOptions.length > 0 && !selectedInsuranceId) {
       // Sort by price to find "Basic"
       const sorted = [...car.insuranceOptions].sort((a, b) => a.pricePerDay - b.pricePerDay)
       setSelectedInsuranceId(sorted[0].planId)
    }
  }, [car, selectedInsuranceId])

  if (!isOpen) return null

  // Sort insurance options for display
  const sortedInsurance = car.insuranceOptions 
    ? [...car.insuranceOptions].sort((a, b) => a.pricePerDay - b.pricePerDay) 
    : []
  
  // Basic is the first one
  const basicInsurance = sortedInsurance.length > 0 ? sortedInsurance[0] : null
  // Basic+ is the second one (if exists)
  const basicPlusInsurance = sortedInsurance.length > 1 ? sortedInsurance[1] : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-zinc-50 border-none [&>button]:hidden">
        
        {/* Header / Stepper */}
        <div className="bg-white border-b border-zinc-100 p-6 flex justify-between items-center shrink-0">
           <div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-zinc-900">Booking {car.make} {car.model}</h2>
              <div className="text-xs text-zinc-500 flex gap-2 mt-1">
                 {format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")} • {days} Days
              </div>
           </div>
           
           <div className="hidden md:flex gap-2">
              {STEPS.map((s, idx) => (
                 <div key={s.id} className="flex items-center">
                    <div className={cn(
                       "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                       step >= s.id ? "bg-black text-white" : "bg-zinc-100 text-zinc-400"
                    )}>
                       {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                    </div>
                    {idx < STEPS.length - 1 && <div className={cn("w-8 h-0.5 mx-2", step > s.id ? "bg-black" : "bg-zinc-100")} />}
                 </div>
              ))}
           </div>
           
           <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           <div className="max-w-4xl mx-auto">
              
              {/* STEP 1: OVERVIEW */}
              {step === 1 && (
                 <div className="grid md:grid-cols-2 gap-8">
                    <div>
                       <div className="aspect-video relative rounded-2xl overflow-hidden mb-6 bg-white border border-zinc-100 shadow-sm">
                          <Image src={car.imageUrl || "/placeholder.png"} alt={car.model} fill className="object-contain p-4" />
                       </div>
                       
                       <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm space-y-4">
                          <h3 className="font-bold text-lg mb-2">Vehicle Specs</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-zinc-600">
                             <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {car.seats} Seats</div>
                             <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {car.suitcases} Bags</div>
                             <div className="flex items-center gap-2"><Gauge className="w-4 h-4" /> {car.transmission}</div>
                             <div className="flex items-center gap-2"><Fuel className="w-4 h-4" /> {car.fuelType}</div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                          {/* Insurance Quick Select (List all options) */}
                       <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                             <h3 className="font-bold text-zinc-900">Insurance & Deposit</h3>
                          </div>
                          <div className="p-4 space-y-3">
                            {sortedInsurance.map((ins) => (
                               <div 
                                 key={ins.planId}
                                 onClick={() => setSelectedInsuranceId(ins.planId)}
                                 className={cn(
                                   "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                                   selectedInsuranceId === ins.planId ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
                                 )}
                               >
                                  <div className="flex items-center gap-3">
                                     <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedInsuranceId === ins.planId ? "border-black" : "border-zinc-300")}>
                                        {selectedInsuranceId === ins.planId && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                     </div>
                                     <div>
                                        <div className="font-bold text-zinc-900">{ins.plan.name}</div>
                                        <div className="text-xs text-zinc-500">Deposit: {ins.deposit?.toLocaleString() ?? 0} €</div>
                                     </div>
                                  </div>
                                  <span className="font-bold text-sm">
                                    {ins.pricePerDay === 0 ? "Included" : `+${Math.round(ins.pricePerDay * days).toLocaleString()} €`}
                                  </span>
                               </div>
                            ))}
                          </div>
                       </div>

                       {/* Mileage Options */}
                       <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
                          <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                             <h3 className="font-bold text-zinc-900">Mileage Options</h3>
                          </div>
                          <div className="p-4 space-y-3">
                             <div 
                               onClick={() => setMileageOption('LIMITED')}
                               className={cn(
                                 "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                                 mileageOption === 'LIMITED' ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
                               )}
                             >
                                <div className="flex items-center gap-3">
                                   <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", mileageOption === 'LIMITED' ? "border-black" : "border-zinc-300")}>
                                      {mileageOption === 'LIMITED' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                   </div>
                                   <div>
                                      <div className="font-bold text-zinc-900">{car.dailyMileageLimit || 300} km / day</div>
                                      <div className="text-xs text-zinc-500">Included in price</div>
                                   </div>
                                </div>
                                <span className="font-bold text-sm">Free</span>
                             </div>

                             <div 
                               onClick={() => setMileageOption('UNLIMITED')}
                               className={cn(
                                 "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                                 mileageOption === 'UNLIMITED' ? "border-black bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
                               )}
                             >
                                <div className="flex items-center gap-3">
                                   <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", mileageOption === 'UNLIMITED' ? "border-black" : "border-zinc-300")}>
                                      {mileageOption === 'UNLIMITED' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                   </div>
                                   <div>
                                      <div className="font-bold text-zinc-900">Unlimited Mileage</div>
                                      <div className="text-xs text-zinc-500">Drive without limits</div>
                                   </div>
                                </div>
                                <span className="font-bold text-sm">+{Math.round((car.unlimitedMileagePrice || 0) * days).toLocaleString()} €</span>
                             </div>
                          </div>
                       </div>

                    </div>
                 </div>
              )}

              {/* STEP 2: INSURANCE (Full List) */}
              {step === 2 && (
                 <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Choose Protection Plan</h3>
                    <p className="text-zinc-500">Select the coverage that suits you best.</p>
                    
                    <div className="grid gap-4">
                       {sortedInsurance.map((ins) => (
                          <div 
                             key={ins.planId}
                             onClick={() => setSelectedInsuranceId(ins.planId)}
                             className={cn(
                                "flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all bg-white hover:border-zinc-300",
                                selectedInsuranceId === ins.planId ? "border-black shadow-md ring-1 ring-black" : "border-zinc-100"
                             )}
                          >
                             <div className="flex items-center gap-4">
                                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0", selectedInsuranceId === ins.planId ? "border-black" : "border-zinc-300")}>
                                   {selectedInsuranceId === ins.planId && <div className="w-3 h-3 rounded-full bg-black" />}
                                </div>
                                <div>
                                   <div className="font-bold text-lg">{ins.plan.name}</div>
                                   <div className="text-sm text-zinc-500">{ins.plan.description || "Standard coverage"}</div>
                                   <div className="mt-2 flex gap-4 text-xs font-medium text-zinc-700">
                                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Deposit: {ins.deposit?.toLocaleString() ?? 0} Ft</span>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="font-bold text-xl">{ins.pricePerDay === 0 ? "Included" : `+${ins.pricePerDay.toLocaleString()} Ft/day`}</div>
                                {ins.pricePerDay > 0 && <div className="text-xs text-zinc-500">Total: {(ins.pricePerDay * days).toLocaleString()} Ft</div>}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {/* STEP 3: EXTRAS */}
              {step === 3 && (
                 <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Add Extras</h3>
                    <p className="text-zinc-500">Customize your rental with optional extras.</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                       {extras.map((extra) => {
                          const isSelected = selectedExtras.includes(extra.id)
                          return (
                             <div 
                                key={extra.id}
                                onClick={() => {
                                   if (isSelected) setSelectedExtras(prev => prev.filter(id => id !== extra.id))
                                   else setSelectedExtras(prev => [...prev, extra.id])
                                }}
                                className={cn(
                                   "flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all bg-white hover:border-zinc-300",
                                   isSelected ? "border-black bg-zinc-50" : "border-zinc-100"
                                )}
                             >
                                <div className="flex items-center gap-4">
                                   <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors", isSelected ? "bg-black border-black text-white" : "border-zinc-300")}>
                                      {isSelected && <Check className="w-3 h-3" />}
                                   </div>
                                   <div>
                                      <div className="font-bold">{extra.name}</div>
                                      <div className="text-xs text-zinc-500">{extra.priceType === 'PER_DAY' ? 'Daily rate' : 'One-time fee'}</div>
                                   </div>
                                </div>
                                <div className="font-bold">
                                   {extra.price.toLocaleString()} Ft
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>
              )}

              {/* STEP 4: DETAILS */}
              {step === 4 && (
                 <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Driver Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input 
                             value={driverDetails.firstName} 
                             onChange={(e) => setDriverDetails({...driverDetails, firstName: e.target.value})}
                             placeholder="John" 
                          />
                       </div>
                       <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input 
                             value={driverDetails.lastName} 
                             onChange={(e) => setDriverDetails({...driverDetails, lastName: e.target.value})}
                             placeholder="Doe" 
                          />
                       </div>
                       <div className="space-y-2">
                          <Label>Email</Label>
                          <Input 
                             type="email"
                             value={driverDetails.email} 
                             onChange={(e) => setDriverDetails({...driverDetails, email: e.target.value})}
                             placeholder="john@example.com" 
                          />
                       </div>
                       <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input 
                             type="tel"
                             value={driverDetails.phone} 
                             onChange={(e) => setDriverDetails({...driverDetails, phone: e.target.value})}
                             placeholder="+36 30 123 4567" 
                          />
                       </div>
                       <div className="space-y-2">
                          <Label>Flight Number (Optional)</Label>
                          <div className="relative">
                             <Plane className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                             <Input 
                                className="pl-10"
                                value={driverDetails.flightNumber} 
                                onChange={(e) => setDriverDetails({...driverDetails, flightNumber: e.target.value})}
                                placeholder="W6 2345" 
                             />
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <Label>Comments</Label>
                       <Input 
                          value={driverDetails.comments} 
                          onChange={(e) => setDriverDetails({...driverDetails, comments: e.target.value})}
                          placeholder="Any special requests?" 
                       />
                    </div>
                 </div>
              )}

              {/* STEP 5: SUMMARY */}
              {step === 5 && (
                 <div className="space-y-6">
                    <h3 className="text-2xl font-bold">Booking Summary</h3>
                    
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
                       <div className="flex justify-between border-b border-zinc-100 pb-4">
                          <div>
                             <h4 className="font-bold text-lg">{car.make} {car.model}</h4>
                             <div className="text-sm text-zinc-500">
                                {format(startDate, "MMM dd")} - {format(endDate, "MMM dd, yyyy")}
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="font-bold text-lg">{days} Days</div>
                          </div>
                       </div>
                       
                       <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                             <span>Car Rental</span>
                             <span>{rentalCost.toLocaleString()} Ft</span>
                          </div>
                          {mileageOption === 'UNLIMITED' && (
                             <div className="flex justify-between">
                                <span>Unlimited Mileage</span>
                                <span>{mileageCost.toLocaleString()} Ft</span>
                             </div>
                          )}
                          {selectedInsurance && (
                             <div className="flex justify-between">
                                <span>{selectedInsurance.plan.name}</span>
                                <span>{insuranceCost.toLocaleString()} Ft</span>
                             </div>
                          )}
                          {selectedExtras.map(id => {
                             const ex = extras.find(e => e.id === id)
                             if (!ex) return null
                             const cost = ex.priceType === 'PER_DAY' ? ex.price * days : ex.price
                             return (
                                <div key={id} className="flex justify-between">
                                   <span>{ex.name}</span>
                                   <span>{cost.toLocaleString()} Ft</span>
                                </div>
                             )
                          })}
                          <div className="flex justify-between text-zinc-500 pt-2 border-t border-zinc-100">
                             <span>Fees</span>
                             <span>{totalFees.toLocaleString()} Ft</span>
                          </div>
                       </div>
                       
                       <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                          <span className="font-bold text-xl">Total</span>
                          <span className="font-black text-2xl">{totalCost.toLocaleString()} Ft</span>
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm">
                       <Info className="w-5 h-5 shrink-0" />
                       <p>By clicking "Confirm Booking", you agree to our terms and conditions. Payment will be collected upon pickup.</p>
                    </div>
                 </div>
              )}

           </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-zinc-100 p-6 flex justify-between items-center shrink-0">
           {step > 1 ? (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                 <ChevronLeft className="w-4 h-4" /> Back
              </Button>
           ) : (
             <div />
           )}

           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                 <div className="text-xs text-zinc-500">Total Estimate</div>
                 <div className="font-bold text-lg">{totalCost.toLocaleString()} €</div>
              </div>
              {step < 5 ? (
                 <Button onClick={handleNext} className="bg-black text-white hover:bg-zinc-800 gap-2 px-8">
                    Next Step <ArrowRight className="w-4 h-4" />
                 </Button>
              ) : (
                 <Button onClick={handleBookingSubmit} className="bg-black text-white hover:bg-zinc-800 gap-2 px-8">
                    Confirm Booking <Check className="w-4 h-4" />
                 </Button>
              )}
           </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
