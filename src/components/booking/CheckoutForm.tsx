"use client"

import { useState, useTransition } from "react"
import { differenceInDays, format, addDays } from "date-fns"
import { Calendar, MapPin, Check, ShieldCheck, CreditCard, Wallet, PlaneLanding, PlaneTakeoff, Baby, User, Map as MapIcon, Snowflake, Star, Clock, Edit2 } from "lucide-react"
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
  endDate: Date
}

export function CheckoutForm({ car, extras, startDate: initialStartDate, endDate: initialEndDate }: CheckoutFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Booking Details State
  const [startDate, setStartDate] = useState<Date>(initialStartDate)
  const [endDate, setEndDate] = useState<Date>(initialEndDate)
  const [startTime, setStartTime] = useState(format(initialStartDate, "HH:mm"))
  const [endTime, setEndTime] = useState(format(initialEndDate, "HH:mm"))
  const [pickupLocation, setPickupLocation] = useState("Budapest Airport")
  const [dropoffLocation, setDropoffLocation] = useState("Budapest Airport")
  const [isEditingDetails, setIsEditingDetails] = useState(false)

  // Extras & Payment State
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [fullInsurance, setFullInsurance] = useState(false)
  const [isCompany, setIsCompany] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_SITE")
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Calculation Logic
  const calculateDays = () => {
    // Combine date and time
    const start = new Date(`${format(startDate, 'yyyy-MM-dd')}T${startTime}`)
    const end = new Date(`${format(endDate, 'yyyy-MM-dd')}T${endTime}`)
    
    const diff = differenceInDays(end, start)
    return Math.max(1, diff) // Minimum 1 day
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
  const insurancePrice = fullInsurance ? (car.fullInsurancePrice * days) : 0
  
  const extrasPrice = selectedExtras.reduce((total, id) => {
    const extra = extras.find(e => e.id === id)
    if (!extra) return total
    const price = extra.priceType === 'PER_DAY' ? extra.price * days : extra.price
    return total + price
  }, 0)

  const totalPrice = basePrice + insurancePrice + extrasPrice

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!termsAccepted) return

    const formData = new FormData(e.currentTarget)
    
    // Append derived/state values
    formData.append('carId', car.id)
    formData.append('startDate', `${format(startDate, 'yyyy-MM-dd')}T${startTime}`)
    formData.append('endDate', `${format(endDate, 'yyyy-MM-dd')}T${endTime}`)
    formData.append('pickupLocation', pickupLocation)
    formData.append('dropoffLocation', dropoffLocation)
    formData.append('totalPrice', totalPrice.toString())
    formData.append('isCompany', isCompany.toString())
    formData.append('fullInsurance', fullInsurance.toString())
    formData.append('paymentMethod', paymentMethod)
    formData.append('selectedExtras', JSON.stringify(selectedExtras))

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
              <Calendar className="w-5 h-5 text-red-600" />
              Booking Details
            </CardTitle>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsEditingDetails(!isEditingDetails)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditingDetails ? 'Done' : 'Edit'}
            </Button>
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
                      <Input 
                        type="date" 
                        value={format(startDate, 'yyyy-MM-dd')}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        disabled={!isEditingDetails}
                        className="font-medium"
                      />
                      <Input 
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={!isEditingDetails}
                        className="w-24 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500">Location</Label>
                    <Input 
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      disabled={!isEditingDetails}
                      className="font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Drop-off */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-900">
                  <div className="w-2 h-2 rounded-full bg-zinc-900" />
                  Drop-off
                </div>
                <div className="space-y-3 pl-4 border-l-2 border-zinc-100">
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500">Date & Time</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="date" 
                        value={format(endDate, 'yyyy-MM-dd')}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        disabled={!isEditingDetails}
                        className="font-medium"
                      />
                      <Input 
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={!isEditingDetails}
                        className="w-24 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-500">Location</Label>
                    <Input 
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      disabled={!isEditingDetails}
                      className="font-medium"
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
              <Input name="firstName" placeholder="John" required />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input name="lastName" placeholder="Doe" required />
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input name="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <Input name="phone" type="tel" placeholder="+36 20 123 4567" required />
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
              <div className="md:col-span-2 space-y-2">
                <Label>Company Address *</Label>
                <Input name="companyAddress" required={isCompany} />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Insurance */}
        <Card className="border-0 shadow-sm overflow-hidden ring-1 ring-zinc-200">
          <CardHeader className="border-b border-zinc-100 bg-white">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              Insurance
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
             <div 
               className={cn(
                 "border-2 rounded-xl p-4 cursor-pointer transition-all flex items-start gap-4",
                 fullInsurance ? "border-red-600 bg-red-50/10" : "border-zinc-200 hover:border-zinc-300"
               )}
               onClick={() => setFullInsurance(!fullInsurance)}
             >
               <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 shrink-0", fullInsurance ? "border-red-600 bg-red-600" : "border-zinc-300")}>
                 {fullInsurance && <Check className="w-4 h-4 text-white" />}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                   <h4 className="font-bold text-zinc-900">Full Insurance (Zero Deductible)</h4>
                   <span className="text-red-600 font-bold">+€{car.fullInsurancePrice} / day</span>
                 </div>
                 <p className="text-sm text-zinc-500">Complete peace of mind. Covers all damages with €0 deductible.</p>
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
            {extras.map((extra) => {
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
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-zinc-400 text-xs">Pick-up</div>
                    <div className="font-bold">{format(startDate, 'MMM d, yyyy')} {startTime}</div>
                    <div className="text-zinc-500 text-xs">{pickupLocation}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-zinc-400 text-xs">Drop-off</div>
                    <div className="font-bold">{format(endDate, 'MMM d, yyyy')} {endTime}</div>
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
              <div className="flex justify-between">
                <span className="text-zinc-400">Car Rental ({days} days)</span>
                <span>€{basePrice.toLocaleString()}</span>
              </div>
              
              {fullInsurance && (
                <div className="flex justify-between text-green-400">
                  <span>Full Insurance</span>
                  <span>+€{insurancePrice.toLocaleString()}</span>
                </div>
              )}

              {selectedExtras.map(id => {
                const extra = extras.find(e => e.id === id)
                if (!extra) return null
                const price = extra.priceType === 'PER_DAY' ? extra.price * days : extra.price
                return (
                  <div key={id} className="flex justify-between text-zinc-300">
                    <span>{extra.name}</span>
                    <span>+€{price.toLocaleString()}</span>
                  </div>
                )
              })}

              <div className="pt-4 border-t border-zinc-800 flex justify-between items-end">
                <span className="text-zinc-400 font-medium">Total</span>
                <span className="text-3xl font-black text-red-500">€{totalPrice.toLocaleString()}</span>
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
                I accept the <a href="#" className="text-red-600 font-bold hover:underline">General Terms and Conditions</a> and <a href="#" className="text-red-600 font-bold hover:underline">Privacy Policy</a>. I acknowledge that I have read and understood them.
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
