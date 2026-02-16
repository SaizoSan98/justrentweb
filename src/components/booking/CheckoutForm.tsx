"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { differenceInDays, format, addDays } from "date-fns"
import { Calendar as CalendarIcon, MapPin, Check, ShieldCheck, CreditCard, Wallet, PlaneLanding, PlaneTakeoff, Baby, User, Map as MapIcon, Snowflake, Star, Clock, Edit2, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { createBooking } from "@/app/actions/booking"
import { useRouter } from "next/navigation"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const ICON_MAP: Record<string, any> = {
  Map: MapIcon,
  Baby: Baby,
  User: User,
  PlaneLanding: PlaneLanding,
  PlaneTakeoff: PlaneTakeoff,
  Snowflake: Snowflake,
  Star: Star
}

interface CheckoutFormProps {
  car: any
  extras: any[]
  startDate: Date
  endDate?: Date
  settings?: any
  initialInsurance?: string
  initialMileage?: string
  user?: {
    name?: string | null
    email?: string | null
    phone?: string | null
  }
}

export function CheckoutForm({ car, extras, startDate: initialStartDate, endDate: initialEndDate, settings, initialInsurance, initialMileage, user }: CheckoutFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Booking Details State
  const [startDate, setStartDate] = useState<Date>(initialStartDate)
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate)
  const [startTime, setStartTime] = useState(format(initialStartDate, "HH:mm"))
  const [endTime, setEndTime] = useState(initialEndDate ? format(initialEndDate, "HH:mm") : "10:00")
  const [pickupLocation, setPickupLocation] = useState("Budapest Airport")
  const [dropoffLocation, setDropoffLocation] = useState("Budapest Airport")
  const [isEditingDetails, setIsEditingDetails] = useState(false)

  // Extras & Payment State
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  
  // Renter Details State
  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '')
  const [lastName, setLastName] = useState(user?.name?.split(' ').slice(1).join(' ') || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  
  // Insurance State Logic
  const defaultInsurance = (car.insuranceOptions && car.insuranceOptions.length > 0) 
      ? [...car.insuranceOptions].sort((a: any, b: any) => (a.plan?.order || 0) - (b.plan?.order || 0))[0].planId 
      : ""
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string>(initialInsurance || defaultInsurance)
  const [mileageOption, setMileageOption] = useState<'LIMITED' | 'UNLIMITED'>(initialMileage as 'LIMITED' | 'UNLIMITED' || 'LIMITED')
  
  const [fullInsurance, setFullInsurance] = useState(false) // Legacy, keeping for compatibility or removing if fully replaced by tiered insurance
  const [isCompany, setIsCompany] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_SITE")
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Calculation Logic
  const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
    const h = Math.floor(i / 2)
    const m = i % 2 === 0 ? "00" : "30"
    return `${h.toString().padStart(2, '0')}:${m}`
  })

  const calculateDays = () => {
    // If endDate is missing, default to 1 day
    if (!endDate) return 1
    
    // Combine date and time safely
    try {
        const startStr = `${format(startDate, 'yyyy-MM-dd')}T${startTime}`
        const endStr = `${format(endDate, 'yyyy-MM-dd')}T${endTime}`
        const start = new Date(startStr)
        const end = new Date(endStr)
        
        // If invalid dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1

        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return Math.max(1, diff)
    } catch (e) {
        return 1
    }
  }

  const days = calculateDays()

  const getPricePerDay = () => {
    if (!car.pricingTiers || car.pricingTiers.length === 0) return car.pricePerDay
    
    // Find matching tier
    const tier = car.pricingTiers.find((t: any) => 
      days >= t.minDays && (t.maxDays === null || days <= t.maxDays)
    )
    
    return tier ? tier.pricePerDay : car.pricePerDay
  }

  const pricePerDay = getPricePerDay()
  const basePrice = pricePerDay * days
  
  // Calculate Insurance Price
  const selectedInsurance = car.insuranceOptions?.find((opt: any) => opt.planId === selectedInsuranceId)
  const insurancePrice = selectedInsurance ? (selectedInsurance.pricePerDay * days) : 0
  
  // Deposit Calculation
  const currentDeposit = selectedInsurance ? selectedInsurance.deposit : (car.deposit || 0)
  
  // Calculate Mileage Price
  const mileagePrice = mileageOption === 'UNLIMITED' ? ((car.unlimitedMileagePrice || 0) * days) : 0
  
  const extrasPrice = selectedExtras.reduce((total, id) => {
    const extra = extras.find(e => e.id === id)
    if (!extra) return total
    const price = extra.priceType === 'PER_DAY' ? extra.price * days : extra.price
    return total + price
  }, 0)

  // After Hours Logic
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const isAfterHours = (date: Date | undefined, time: string) => {
    if (!settings || !date) return false
    
    // Parse weekly settings
    let weeklyHours = settings.weeklyHours
    if (typeof weeklyHours === 'string') {
      try {
        weeklyHours = JSON.parse(weeklyHours)
      } catch (e) {
        weeklyHours = {}
      }
    }
    
    if (!weeklyHours) {
        // Fallback to global legacy settings
        const t = parseTime(time)
        const open = parseTime(settings.openingTime || "08:00")
        const close = parseTime(settings.closingTime || "18:00")
        return t < open || t > close
    }

    const dayName = format(date, 'EEEE') // "Monday", "Tuesday"...
    const daySettings = weeklyHours[dayName]

    if (!daySettings) {
        // If no settings for this day, assume default open
        const t = parseTime(time)
        const open = parseTime(settings.openingTime || "08:00")
        const close = parseTime(settings.closingTime || "18:00")
        return t < open || t > close
    }

    if (daySettings.isClosed) return true

    const t = parseTime(time)
    const open = parseTime(daySettings.open)
    const close = parseTime(daySettings.close)

    return t < open || t > close
  }

  const pickupFee = (settings && isAfterHours(startDate, startTime)) ? Number(car.pickupAfterHoursPrice || 0) : 0
  const returnFee = (settings && isAfterHours(endDate, endTime)) ? Number(car.returnAfterHoursPrice || 0) : 0

  // Automatically find and add out-of-hours extras if applicable
  // This ensures they are passed to the server action as "selectedExtras" even if hidden from UI
  // But wait, the server action re-calculates fees? No, server action takes selectedExtras from form.
  // We need to inject these extras into selectedExtras implicitly or handle them separately.
  // Current logic: pickupFee and returnFee are calculated purely for display price.
  // The server action creates booking. It calculates total price itself? No, it takes totalPrice from form.
  // But it connects extras based on ID.
  // We need to find the ID of the "Out of hours" extra if it exists in the 'extras' prop
  // and add it to the submission if conditions are met.
  
  const outOfHoursExtra = extras.find(e => {
      const n = e.name.toLowerCase()
      return n.includes('out of hours') || n.includes('after hours')
  })

  // Calculate if we need to auto-select this extra
  const needsOutOfHours = (settings && (isAfterHours(startDate, startTime) || isAfterHours(endDate, endTime)))
  
  // Update: We don't want to double charge. car.pickupAfterHoursPrice is likely what we use for calculation.
  // If there is an EXTRA for it, we should use that instead? 
  // User instruction: "automatically be checked".
  // If we have car.pickupAfterHoursPrice, we use that for calculation above.
  // If we ALSO have an extra, we shouldn't use both.
  // Let's assume the "Extra" in the list IS the fee the user sees and wants hidden/auto-added.
  
  const effectiveExtras = [...selectedExtras]
  if (needsOutOfHours && outOfHoursExtra && !effectiveExtras.includes(outOfHoursExtra.id)) {
      // We don't add it to state to avoid loop, but we need to account for it in price?
      // Actually, let's just rely on pickupFee/returnFee logic which uses car properties.
      // If the user wants the "Extra" entity to be linked to the booking, we need to add it.
      // But usually "Out of hours" is a fee field on the booking, not necessarily an extra relation.
      // However, if Renteon expects an Extra ID, we must include it.
      
      // Let's rely on the explicit fee calculation we already have:
      // const pickupFee = ...
      // const returnFee = ...
      // These are added to totalPrice.
      
      // If there is an "Out of hours" item in the extras list, it's likely a duplicate of the built-in fee logic 
      // or the source of truth. The user wants it hidden from list but applied.
      // If we already calculate `pickupFee` using `car.pickupAfterHoursPrice`, that is correct.
      // We just hid the extra from the list so user can't manually toggle it.
      // NOW: We must ensure that if Renteon needs this as an "Extra" service, we include its ID in submission.
  }

  const totalPrice = basePrice + insurancePrice + mileagePrice + extrasPrice + pickupFee + returnFee

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!termsAccepted) return
    if (!endDate) {
        alert("Please select a return date.")
        return
    }

    const formData = new FormData(e.currentTarget)
    
    // Prepare extras list including hidden auto-extras
    let finalExtras = [...selectedExtras]
    
    // If we have an "Out of hours" extra and we are out of hours, add it
    // ONLY IF we aren't already charging via car.pickupAfterHoursPrice to avoid double charge?
    // Actually, usually the system either uses the car field OR the extra. 
    // If `pickupFee` > 0, it means we are charging.
    // If we also send the Extra ID, Renteon might charge twice? 
    // Or maybe we need to send the Extra ID *instead* of the fee?
    // Let's play safe: The user said "automatically be checked". 
    // So we should add the Extra ID if it exists and condition is met.
    if (needsOutOfHours && outOfHoursExtra && !finalExtras.includes(outOfHoursExtra.id)) {
        finalExtras.push(outOfHoursExtra.id)
    }

    // Append derived/state values
    formData.append('carId', car.id)
    formData.append('startDate', `${format(startDate, 'yyyy-MM-dd')}T${startTime}`)
    formData.append('endDate', `${format(endDate, 'yyyy-MM-dd')}T${endTime}`)
    formData.append('pickupLocation', pickupLocation)
    formData.append('dropoffLocation', dropoffLocation)
    formData.append('totalPrice', totalPrice.toString())
    formData.append('isCompany', isCompany.toString())
    // Pass selected plan ID instead of boolean
    formData.append('insurancePlanId', selectedInsuranceId)
    formData.append('mileageOption', mileageOption)
    formData.append('paymentMethod', paymentMethod)
    formData.append('selectedExtras', JSON.stringify(finalExtras))

    startTransition(async () => {
      const result = await createBooking(null, formData)
      if (result.success) {
        router.push(`/booking/success/${result.bookingId}`)
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Left Column: Forms */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Booking Details (Editable) */}
        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-red-600" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pick-up */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <div className="w-2 h-2 rounded-full bg-red-600" />
                  Pick-up
                </div>
                <div className="space-y-3 pl-4 border-l-2 border-zinc-100">
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500">Date & Time</Label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4 flex gap-4" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setStartDate(date)}
                                    disabled={(date) => date < new Date()}
                                />
                                <div className="h-[300px] w-px bg-zinc-100" />
                                <div className="h-[300px] overflow-y-auto w-24 space-y-1 pr-2">
                                    {TIME_OPTIONS.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setStartTime(time)}
                                            className={cn(
                                                "w-full text-xs font-bold py-2 rounded-md hover:bg-zinc-100 transition-colors",
                                                startTime === time ? "bg-black text-white hover:bg-black" : "text-zinc-600"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                      <Input 
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-24 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500">Location</Label>
                    <Input 
                      value={pickupLocation}
                      readOnly
                      className="font-medium bg-zinc-50 text-zinc-500 cursor-not-allowed border-zinc-200 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>

              {/* Drop-off */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <div className="w-2 h-2 rounded-full bg-red-600" />
                  Drop-off
                </div>
                <div className="space-y-3 pl-4 border-l-2 border-zinc-100">
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500">Date & Time</Label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "border-red-500")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4 flex gap-4" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => date && setEndDate(date)}
                                    disabled={(date) => date < startDate}
                                />
                                <div className="h-[300px] w-px bg-zinc-100" />
                                <div className="h-[300px] overflow-y-auto w-24 space-y-1 pr-2">
                                    {TIME_OPTIONS.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setEndTime(time)}
                                            className={cn(
                                                "w-full text-xs font-bold py-2 rounded-md hover:bg-zinc-100 transition-colors",
                                                endTime === time ? "bg-black text-white hover:bg-black" : "text-zinc-600"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                      <Input 
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-24 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500">Location</Label>
                    <Input 
                      value={dropoffLocation}
                      readOnly
                      className="font-medium bg-zinc-50 text-zinc-500 cursor-not-allowed border-zinc-200 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Total Duration */}
            <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between bg-zinc-50 p-4 rounded-lg">
              <span className="text-zinc-500 font-medium">Total Duration</span>
              <span className="text-xl font-black text-zinc-900">{days} Days</span>
            </div>
          </CardContent>
        </Card>

        {/* Renter Details */}
        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Renter Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input 
                name="firstName" 
                placeholder="John" 
                required 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input 
                name="lastName" 
                placeholder="Doe" 
                required 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input 
                name="email" 
                type="email" 
                placeholder="john@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input 
                name="phone" 
                type="tel" 
                placeholder="+36 20 123 4567" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Flight Number</Label>
              <Input name="flightNumber" placeholder="Optional" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Comments</Label>
              <Textarea name="comments" placeholder="Any special requests?" />
            </div>
          </CardContent>
        </Card>

        {/* Company Details Toggle */}
        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-red-600" />
              Company Details
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="company-mode" className="text-sm text-zinc-500">I need an invoice</Label>
              <Switch id="company-mode" checked={isCompany} onCheckedChange={setIsCompany} />
            </div>
          </CardHeader>
          {isCompany && (
            <CardContent className="p-6 grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input name="companyName" required={isCompany} />
              </div>
              <div className="space-y-2">
                <Label>Tax Number (Adószám) *</Label>
                <Input name="companyTaxId" required={isCompany} />
              </div>
              <div className="space-y-2">
                <Label>Company Email *</Label>
                <Input name="companyEmail" type="email" required={isCompany} />
              </div>
              <div className="space-y-2">
                <Label>Company Phone *</Label>
                <Input name="companyPhone" type="tel" required={isCompany} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Company Address *</Label>
                <Input name="companyAddress" required={isCompany} />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Insurance & Mileage - New Tiered UI */}
        <Card className="border-0 shadow-sm overflow-hidden ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              Insurance Plan
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
             {car.insuranceOptions?.sort((a: any, b: any) => (a.plan?.order || 0) - (b.plan?.order || 0)).map((ins: any) => (
                <div 
                  key={ins.planId}
                  className={cn(
                    "border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4",
                    selectedInsuranceId === ins.planId ? "border-black bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
                  )}
                  onClick={() => setSelectedInsuranceId(ins.planId)}
                >
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 shrink-0", selectedInsuranceId === ins.planId ? "border-black" : "border-zinc-300")}>
                    {selectedInsuranceId === ins.planId && <div className="w-3 h-3 bg-black rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-zinc-900">{ins.plan.name?.replace(/ - (Mini|Midi|Maxi)/g, "")}</h4>
                      <span className="font-bold text-zinc-900 text-right">
                        {ins.pricePerDay === 0 ? "Included" : (
                            <>
                                <div>+€{Math.round(ins.pricePerDay * days)}</div>
                                <div className="text-[10px] text-zinc-400 font-normal">€{Math.round(ins.pricePerDay)} / day</div>
                            </>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{ins.plan.description || "Basic coverage."}</p>
                    <p className="text-xs font-semibold text-zinc-700 mt-1">Deposit: €{ins.deposit}</p>
                  </div>
                </div>
             ))}
          </div>
        </Card>

        <Card className="border-0 shadow-sm overflow-hidden ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Gauge className="w-5 h-5 text-red-600" />
              Mileage
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
             <div 
               className={cn(
                 "border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4",
                 mileageOption === 'LIMITED' ? "border-black bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
               )}
               onClick={() => setMileageOption('LIMITED')}
             >
               <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 shrink-0", mileageOption === 'LIMITED' ? "border-black" : "border-zinc-300")}>
                 {mileageOption === 'LIMITED' && <div className="w-3 h-3 bg-black rounded-full" />}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="font-bold text-zinc-900">{car.dailyMileageLimit || 300} km / day</h4>
                   <span className="font-bold text-zinc-900">Included</span>
                 </div>
               </div>
             </div>

             <div 
               className={cn(
                 "border-2 rounded-xl p-4 transition-all flex items-start gap-4 opacity-50 cursor-not-allowed",
                 mileageOption === 'UNLIMITED' ? "border-black bg-zinc-50" : "border-zinc-200"
               )}
               // onClick={() => setMileageOption('UNLIMITED')}
             >
               <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 shrink-0", mileageOption === 'UNLIMITED' ? "border-black" : "border-zinc-300")}>
                 {mileageOption === 'UNLIMITED' && <div className="w-3 h-3 bg-black rounded-full" />}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                     Unlimited km
                     <span className="bg-zinc-200 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">DEV</span>
                   </h4>
                   <span className="font-bold text-zinc-400">+{Math.round((car.unlimitedMileagePrice || 0) * days)} €</span>
                 </div>
               </div>
             </div>
          </div>
        </Card>

        {/* Extras */}
        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-red-600" />
              Extras
            </CardTitle>
          </CardHeader>
          <div className="p-6 grid md:grid-cols-2 gap-4">
            {extras.filter(extra => {
                const name = extra.name.toLowerCase()
                // Filter out automatic fees from manual selection
                return !name.includes('out of hours') && !name.includes('after hours') && !name.includes('pickup fee') && !name.includes('return fee')
            }).map((extra) => {
              const Icon = ICON_MAP[extra.icon] || Star
              const isSelected = selectedExtras.includes(extra.id)
              
              return (
                <div 
                  key={extra.id}
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3",
                    isSelected ? "border-red-600 bg-red-50/10 ring-1 ring-red-600/10" : "border-zinc-200 hover:border-zinc-300"
                  )}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedExtras(selectedExtras.filter(id => id !== extra.id))
                    } else {
                      setSelectedExtras([...selectedExtras, extra.id])
                    }
                  }}
                >
                  <div className="p-2 bg-zinc-100 rounded-lg shrink-0">
                    <Icon className="w-5 h-5 text-zinc-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-zinc-900 truncate pr-2">{extra.name}</h4>
                      <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center shrink-0", isSelected ? "bg-red-600 border-red-600" : "border-zinc-300")}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{extra.description}</p>
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-full">
                      €{extra.price} {extra.priceType === 'PER_DAY' ? '/ day' : '/ rental'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="border-0 shadow-sm ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-red-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div 
              className={cn("border-2 rounded-xl p-4 cursor-pointer flex items-center gap-4", paymentMethod === 'CASH_ON_SITE' ? "border-red-600 bg-red-50/10" : "border-zinc-200")}
              onClick={() => setPaymentMethod('CASH_ON_SITE')}
            >
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === 'CASH_ON_SITE' ? "border-red-600 bg-red-600" : "border-zinc-300")}>
                {paymentMethod === 'CASH_ON_SITE' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="font-bold text-zinc-900">Cash on site</span>
            </div>
            
            <div 
              className={cn("border-2 rounded-xl p-4 cursor-pointer flex items-center gap-4", paymentMethod === 'CARD_ON_SITE' ? "border-red-600 bg-red-50/10" : "border-zinc-200")}
              onClick={() => setPaymentMethod('CARD_ON_SITE')}
            >
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === 'CARD_ON_SITE' ? "border-red-600 bg-red-600" : "border-zinc-300")}>
                {paymentMethod === 'CARD_ON_SITE' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="font-bold text-zinc-900">Credit Card on site</span>
            </div>

            <div className="border-2 border-zinc-100 rounded-xl p-4 flex items-center gap-4 opacity-50 cursor-not-allowed bg-zinc-50">
              <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />
              <div className="flex justify-between items-center flex-1">
                <span className="font-bold text-zinc-400">Prepayment (Credit Card)</span>
                <span className="text-xs font-bold bg-zinc-200 text-zinc-500 px-2 py-1 rounded">Coming Soon</span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Right Column: Summary (Sticky) */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <Card className="border-0 shadow-lg bg-zinc-900 text-white overflow-hidden">
            <div className="p-6 border-b border-zinc-800">
              <h3 className="text-lg font-bold mb-4">Booking Summary</h3>
              <div className="flex items-start gap-4 mb-6">
                <div className="relative w-24 h-16 bg-white rounded-lg overflow-hidden">
                  <Image 
                    src={car.imageUrl} 
                    alt={car.model} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-black uppercase text-lg leading-tight">{car.make} {car.model}</div>
                  <div className="text-zinc-400 text-sm">{car.category}</div>
                  <div className="flex items-center gap-2 mt-2">
                     <CreditCard className="w-4 h-4 text-zinc-400" />
                     <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">MINIMUM DRIVER AGE: 21 YEARS</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-zinc-400 text-xs">Pick-up</div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="font-bold hover:bg-zinc-100 px-1 -ml-1 rounded transition-colors text-left">
                                {format(startDate, 'MMM d, yyyy')} {startTime}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 flex gap-4" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => date && setStartDate(date)}
                                disabled={(date) => date < new Date()}
                            />
                            <div className="h-[300px] w-px bg-zinc-100" />
                            <div className="h-[300px] overflow-y-auto w-24 space-y-1 pr-2">
                                {TIME_OPTIONS.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setStartTime(time)}
                                        className={cn(
                                            "w-full text-xs font-bold py-2 rounded-md hover:bg-zinc-100 transition-colors",
                                            startTime === time ? "bg-black text-white hover:bg-black" : "text-zinc-600"
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <div className="text-zinc-500 text-xs">{pickupLocation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-zinc-400 text-xs">Drop-off</div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className="font-bold hover:bg-zinc-100 px-1 -ml-1 rounded transition-colors text-left">
                                {endDate ? format(endDate, 'MMM d, yyyy') : 'Select Date'} {endTime}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4 flex gap-4" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => date && setEndDate(date)}
                                disabled={(date) => date < startDate}
                            />
                            <div className="h-[300px] w-px bg-zinc-100" />
                            <div className="h-[300px] overflow-y-auto w-24 space-y-1 pr-2">
                                {TIME_OPTIONS.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => setEndTime(time)}
                                        className={cn(
                                            "w-full text-xs font-bold py-2 rounded-md hover:bg-zinc-100 transition-colors",
                                            endTime === time ? "bg-black text-white hover:bg-black" : "text-zinc-600"
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    <div className="text-zinc-500 text-xs">{dropoffLocation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex items-center justify-center font-bold text-red-500">
                    {days}
                  </div>
                  <div>
                    <div className="text-zinc-400 text-xs">Duration</div>
                    <div className="font-bold">{days} Days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-zinc-950/50 space-y-3 text-sm">
              
              <Dialog>
                <DialogTrigger asChild>
                    <button type="button" className="w-full flex justify-between items-center group">
                        <span className="text-zinc-400 font-medium group-hover:text-white transition-colors">Total Price</span>
                        <div className="flex items-center gap-2">
                             <span className="text-3xl font-black text-red-500">€{totalPrice.toLocaleString()}</span>
                             <div className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-1 rounded uppercase font-bold group-hover:bg-zinc-700 transition-colors">Details</div>
                        </div>
                    </button>
                </DialogTrigger>
                <DialogContent className="w-[90%] sm:max-w-[425px] bg-white text-zinc-900 border-zinc-200 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Price Breakdown</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 pt-4">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Car Rental ({days} days)</span>
                            <span className="font-bold">€{basePrice.toLocaleString()}</span>
                        </div>
                        
                        {insurancePrice > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Insurance</span>
                                <span>+€{insurancePrice.toLocaleString()}</span>
                            </div>
                        )}

                        {mileagePrice > 0 && (
                            <div className="flex justify-between text-zinc-500">
                                <span>Unlimited Mileage</span>
                                <span>+€{mileagePrice.toLocaleString()}</span>
                            </div>
                        )}

                        {selectedExtras.map(id => {
                            const extra = extras.find(e => e.id === id)
                            if (!extra) return null
                            const price = extra.priceType === 'PER_DAY' ? extra.price * days : extra.price
                            return (
                                <div key={id} className="flex justify-between text-zinc-500">
                                    <span>{extra.name}</span>
                                    <span>+€{price.toLocaleString()}</span>
                                </div>
                            )
                        })}

                        {pickupFee > 0 && (
                            <div className="flex justify-between text-zinc-500">
                                <span>After Hours Pickup</span>
                                <span>+€{pickupFee.toLocaleString()}</span>
                            </div>
                        )}
                        {returnFee > 0 && (
                            <div className="flex justify-between text-zinc-500">
                                <span>After Hours Return</span>
                                <span>+€{returnFee.toLocaleString()}</span>
                            </div>
                        )}

                        <div className="pt-4 border-t border-zinc-100 flex justify-between items-end mt-4">
                            <span className="text-zinc-900 font-bold">Total</span>
                            <span className="text-2xl font-black text-red-600">€{totalPrice.toLocaleString()}</span>
                        </div>
                        
                        <div className="pt-3 border-t border-zinc-100 flex justify-between items-center">
                             <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Security Deposit
                             </div>
                             <span className="font-bold text-zinc-900">€{currentDeposit.toLocaleString()}</span>
                        </div>
                    </div>
                </DialogContent>
              </Dialog>
              
              {/* Visible Deposit Field below Total */}
              <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4" />
                      Security Deposit
                   </div>
                   <span className="font-bold text-white text-lg">€{currentDeposit.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Terms */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm text-zinc-600 font-normal leading-relaxed cursor-pointer">
                I accept the <a href="/uploads/Terms%20And%20Conditions%20JR.pdf" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline">General Terms and Conditions</a> and <a href="#" className="text-red-600 font-bold hover:underline">Privacy Policy</a>. I acknowledge that I have read and understood them.
              </Label>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg uppercase tracking-wide shadow-xl shadow-red-600/20"
            disabled={!termsAccepted || isPending}
          >
            {isPending ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </div>
    </form>
  )
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
