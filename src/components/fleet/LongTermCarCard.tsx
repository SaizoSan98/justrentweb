
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Users, Gauge, Fuel, Check, Info, ArrowRight, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog"
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link"
import { submitLongTermInquiry } from "@/app/actions/long-term-inquiry"

export interface LongTermCar {
   id: string
   make: string
   model: string
   year: number
   imageUrl: string | null
   monthlyPrice: any
   price1to3: any
   price4to6: any
   price7plus: any
   deposit: any
   transmission: string
   fuelType: string
   seats: number
   features: string[]
   description: string | null
}

export function LongTermCarCard({ car }: { car: LongTermCar }) {
   const [duration, setDuration] = useState(12)
   const [currentPrice, setCurrentPrice] = useState(Number(car.monthlyPrice))

   // Inquiry Form State
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [showInquiryForm, setShowInquiryForm] = useState(false)

   // Calculate lowest price for "from" display
   const prices = [
      Number(car.price1to3),
      Number(car.price4to6),
      Number(car.price7plus)
   ].filter(p => p > 0)

   const minPrice = prices.length > 0 ? Math.min(...prices) : Number(car.monthlyPrice)

   useEffect(() => {
      let price = Number(car.monthlyPrice)

      if (duration >= 1 && duration <= 3) {
         const p = Number(car.price1to3)
         if (p > 0) price = p
      } else if (duration >= 4 && duration <= 6) {
         const p = Number(car.price4to6)
         if (p > 0) price = p
      } else if (duration >= 7) {
         const p = Number(car.price7plus)
         if (p > 0) price = p
      }

      setCurrentPrice(price)
   }, [duration, car])

   const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsSubmitting(true)

      const formData = new FormData(e.currentTarget)
      formData.append("carId", car.id)
      formData.append("carName", `${car.make} ${car.model}`)
      formData.append("duration", duration.toString())
      formData.append("monthlyPrice", currentPrice.toString())

      const result = await submitLongTermInquiry(formData)

      setIsSubmitting(false)

      if (result.success) {
         toast.success("Inquiry sent successfully! We will contact you shortly.")
         setShowInquiryForm(false)
      } else {
         toast.error(result.error || "Failed to send inquiry. Please try again.")
      }
   }

   return (
      <Dialog>
         <DialogTrigger asChild>
            <div className="group relative bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer">

               {/* Image */}
               <div className="relative h-56 bg-zinc-100 flex items-center justify-center p-4 shrink-0">
                  {car.imageUrl ? (
                     <Image
                        src={car.imageUrl}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-contain object-center transition-transform duration-500 group-hover:scale-105 p-4"
                     />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        No Image
                     </div>
                  )}
                  <div className="absolute top-4 right-4 z-10">
                     <Badge className="bg-black text-white hover:bg-black uppercase tracking-wider font-bold">
                        Long Term
                     </Badge>
                  </div>
               </div>

               <div className="p-6 flex flex-col flex-grow">
                  {/* Header */}
                  <div className="mb-4">
                     <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">
                        {car.make} {car.model}
                     </h3>
                     <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">
                        {car.year} • {car.transmission}
                     </p>
                  </div>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                     <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
                        <Users className="w-3.5 h-3.5" />
                        {car.seats} Seats
                     </div>
                     <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
                        <Fuel className="w-3.5 h-3.5" />
                        {car.fuelType}
                     </div>
                     <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
                        <Gauge className="w-3.5 h-3.5" />
                        {car.transmission}
                     </div>
                  </div>

                  {/* Features Preview */}
                  {car.features.length > 0 && (
                     <div className="mb-6 space-y-1" onClick={(e) => e.stopPropagation()}>
                        {car.features.slice(0, 3).map((feature, idx) => (
                           <div key={idx} className="flex items-center gap-2 text-xs text-zinc-500">
                              <Check className="w-3 h-3 text-green-500" />
                              {feature}
                           </div>
                        ))}
                        {car.features.length > 3 && (
                           <Popover>
                              <PopoverTrigger asChild>
                                 <button className="text-xs text-zinc-400 pl-5 hover:text-zinc-600 hover:underline transition-colors text-left">
                                    +{car.features.length - 3} more features
                                 </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-4">
                                 <div className="space-y-2">
                                    <h4 className="font-bold text-sm mb-2">All Features</h4>
                                    {car.features.map((feature, idx) => (
                                       <div key={idx} className="flex items-center gap-2 text-xs text-zinc-600">
                                          <Check className="w-3 h-3 text-green-500 shrink-0" />
                                          {feature}
                                       </div>
                                    ))}
                                 </div>
                              </PopoverContent>
                           </Popover>
                        )}
                     </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-zinc-100 flex items-end justify-between">
                     <div>
                        <div className="flex items-baseline gap-1">
                           <span className="text-sm text-zinc-500 font-bold">from</span>
                           <span className="text-3xl font-black text-red-600 tracking-tighter">€{minPrice}</span>
                           <span className="text-sm text-zinc-500 font-bold">/ month</span>
                        </div>
                     </div>

                     <Button className="bg-black hover:bg-zinc-800 text-white font-bold rounded-xl px-6">
                        View Deal
                     </Button>
                  </div>
               </div>
            </div>
         </DialogTrigger>

         <DialogContent className="max-w-3xl w-[95vw] md:w-full p-0 bg-white max-h-[90vh] flex flex-col rounded-2xl md:rounded-3xl border-none shadow-2xl overflow-hidden">
            <div className="flex-1 grid md:grid-cols-2 h-full overflow-hidden">
               {/* Left: Image & Specs */}
               <div className="bg-zinc-100 p-6 md:p-8 flex flex-col shrink-0 overflow-y-auto">
                  <div className="relative aspect-[4/3] w-full mb-6 mix-blend-multiply">
                     {car.imageUrl ? (
                        <Image
                           src={car.imageUrl}
                           alt={`${car.make} ${car.model}`}
                           fill
                           className="object-contain"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">No Image</div>
                     )}
                  </div>

                  <div className="mt-auto space-y-4">
                     <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-white p-3 rounded-xl">
                           <div className="text-xs text-zinc-500 mb-1">Transmission</div>
                           <div className="font-bold text-sm flex items-center gap-2">
                              <Gauge className="w-4 h-4 text-zinc-400" />
                              {car.transmission}
                           </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl">
                           <div className="text-xs text-zinc-500 mb-1">Fuel Type</div>
                           <div className="font-bold text-sm flex items-center gap-2">
                              <Fuel className="w-4 h-4 text-zinc-400" />
                              {car.fuelType}
                           </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl">
                           <div className="text-xs text-zinc-500 mb-1">Seats</div>
                           <div className="font-bold text-sm flex items-center gap-2">
                              <Users className="w-4 h-4 text-zinc-400" />
                              {car.seats} Persons
                           </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl">
                           <div className="text-xs text-zinc-500 mb-1">Year</div>
                           <div className="font-bold text-sm flex items-center gap-2">
                              <Info className="w-4 h-4 text-zinc-400" />
                              {car.year}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right: Calculator & Form */}
               <div className="p-6 md:p-8 flex flex-col h-full overflow-y-auto min-h-0">
                  <DialogHeader className="mb-6 pt-4 md:pt-0 shrink-0">
                     <DialogTitle className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight uppercase leading-none">
                        {car.make} <span className="text-red-600">{car.model}</span>
                     </DialogTitle>
                     {car.description && (
                        <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                           {car.description}
                        </p>
                     )}
                  </DialogHeader>

                  <div className="space-y-8 mb-8">
                     {/* Duration Slider */}
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-bold uppercase text-zinc-500 tracking-wider">Rental Duration</span>
                           <span className="text-lg font-black text-zinc-900">{duration} Months</span>
                        </div>
                        <input
                           type="range"
                           min="1"
                           max="12"
                           value={duration}
                           onChange={(e) => setDuration(parseInt(e.target.value))}
                           className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <div className="flex justify-between text-xs text-zinc-400 font-medium uppercase tracking-wider">
                           <span>1 Mo</span>
                           <span>6 Mo</span>
                           <span>12+ Mo</span>
                        </div>
                     </div>

                     {/* Price Display */}
                     <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                        <div className="flex items-end justify-between mb-2">
                           <span className="text-zinc-500 font-medium">Monthly Rate</span>
                           <span className="text-4xl font-black text-zinc-900 tracking-tighter">€{currentPrice}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-zinc-400 pt-4 border-t border-zinc-200/50">
                           <span>Security Deposit</span>
                           <span className="font-bold text-zinc-600">€{Number(car.deposit)}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto pb-8 md:pb-4">
                     {showInquiryForm ? (
                        <form onSubmit={handleInquirySubmit} className="space-y-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                           <div className="flex justify-between items-center mb-2">
                              <h4 className="font-bold text-zinc-900">Send Inquiry</h4>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setShowInquiryForm(false)} className="h-6 w-6 p-0">
                                 <span className="sr-only">Close</span>
                                 <span aria-hidden="true">&times;</span>
                              </Button>
                           </div>

                           {/* Honeypot field - visually hidden to humans, attractive to bots */}
                           <div className="hidden" aria-hidden="true">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input id="lastName" name="lastName" tabIndex={-1} autoComplete="off" />
                           </div>

                           <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input id="name" name="name" placeholder="John Doe" required className="bg-white" />
                           </div>

                           <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-white" />
                           </div>

                           <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input id="phone" name="phone" type="tel" placeholder="+36..." required className="bg-white" />
                           </div>

                           <div className="space-y-2">
                              <Label htmlFor="message">Message (Optional)</Label>
                              <Textarea
                                 id="message"
                                 name="message"
                                 placeholder="Any specific questions?"
                                 className="bg-white min-h-[80px]"
                                 defaultValue={`I am interested in renting the ${car.make} ${car.model} for ${duration} months.`}
                              />
                           </div>

                           <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl" disabled={isSubmitting}>
                              {isSubmitting ? (
                                 <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                 </>
                              ) : (
                                 "Send Request"
                              )}
                           </Button>
                        </form>
                     ) : (
                        <>
                           <Button
                              onClick={() => setShowInquiryForm(true)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                           >
                              Inquire Now
                              <ArrowRight className="ml-2 w-5 h-5" />
                           </Button>
                           <p className="text-center text-xs text-zinc-400 mt-4">
                              No payment required now. Send an inquiry to check availability.
                           </p>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
   )
}
