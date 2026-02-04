"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Car, Clock } from "lucide-react"
import { addDays, format, differenceInDays, isBefore, startOfDay, addHours } from "date-fns"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TimePicker } from "@/components/ui/time-picker"

interface BookingEngineProps {
  initialStartDate?: Date
  initialEndDate?: Date
  className?: string
  showLabel?: boolean
  compact?: boolean
  dictionary?: any
}

export function BookingEngine({ 
  initialStartDate, 
  initialEndDate,
  className,
  showLabel = true,
  compact = false,
  dictionary = {}
}: BookingEngineProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = React.useState(!compact)
  
  // Helper to safely get dictionary value
  const t = (key: string, section: string = "hero") => {
    return dictionary?.[section]?.[key] || key
  }
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => ({
    from: initialStartDate || new Date(),
    to: initialEndDate,
  }))
  
  const [startTime, setStartTime] = React.useState("10:00")
  const [endTime, setEndTime] = React.useState("10:00")
  const [location] = React.useState("Budapest Airport (BUD)")
  const [error, setError] = React.useState<string | null>(null)
  
  const daysSelected = dateRange?.from && dateRange?.to 
    ? Math.max(1, differenceInDays(dateRange.to, dateRange.from)) 
    : 0

  const handleSearch = () => {
    setError(null)

    if (!dateRange?.from || !dateRange?.to) {
      setError("Please select a valid date range.")
      return
    }

    // 1. Check for past dates (Pick-up date cannot be in the past)
    const today = startOfDay(new Date())
    if (isBefore(dateRange.from, today)) {
      setError("Pick-up date cannot be in the past.")
      return
    }

    // 2. Check max 30 days
    const daysDiff = differenceInDays(dateRange.to, dateRange.from)
    if (daysDiff > 30) {
      setError("For rentals longer than 30 days, please contact us directly at info@justrent.com or +36 1 234 5678.")
      return
    }

    // 3. Check minimum 4-hour lead time
    // Construct full pickup date object
    const now = new Date()
    const [hours, minutes] = startTime.split(':').map(Number)
    const pickupDateTime = new Date(dateRange.from)
    pickupDateTime.setHours(hours, minutes, 0, 0)

    if (isBefore(pickupDateTime, addHours(now, 4))) {
      setError("Pick-up time must be at least 4 hours from now.")
      return
    }

    const params = new URLSearchParams()
    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString())
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString())
    router.push(`/fleet?${params.toString()}`)
    
    // In compact mode, collapse after search if we are on fleet page (implied by usage)
    if (compact) setIsExpanded(false)
  }

  if (compact && !isExpanded) {
      return (
        <div className={cn("w-full relative z-20", className)}>
          <div className="bg-white rounded-full shadow-lg border border-zinc-100 p-2 pl-6 flex items-center justify-between gap-4 transition-all hover:shadow-xl">
            <div className="flex items-center gap-6 overflow-hidden">
               <div className="flex items-center gap-3 min-w-0">
                  <CalendarIcon className="w-5 h-5 text-red-600 shrink-0" />
                  <div className="text-sm truncate">
                    <span className="font-bold block text-zinc-900 truncate">{dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : t('pick_date')}</span>
                    <span className="text-xs text-zinc-500 truncate block">
                      {dateRange?.to ? `${format(dateRange.from!, "MMM d")} - ${format(dateRange.to, "MMM d")}` : t('pickup_date')}
                    </span>
                  </div>
               </div>
            </div>
            <Button 
              onClick={() => setIsExpanded(true)} 
              variant="default"
              className="rounded-full px-6 font-bold bg-zinc-900 text-white hover:bg-zinc-800"
            >
              {t('edit', 'common')}
            </Button>
          </div>
        </div>
      )
  }

  return (
    <div className={cn("w-full relative z-20", className)}>
      <Card className={cn(
        "border-0 shadow-2xl shadow-zinc-900/10 bg-white/95 backdrop-blur-xl overflow-hidden rounded-[2rem] ring-1 ring-zinc-900/5",
        compact && "shadow-xl" // Less shadow for compact mode
      )}>
        <CardContent className={cn(
          "p-6 md:p-8",
          compact && "p-4" // Less padding for compact mode
        )}>
          {showLabel && !compact && (
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm shadow-red-600/20">{t('car_rental', 'booking')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Location - Full Width on Mobile, 4 cols on Desktop */}
            <div className="lg:col-span-4 space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-4">{t('airport', 'hero')}</label>
              <div className="relative group">
                <MapPin className={cn(
                  "absolute left-5 top-1/2 -translate-y-1/2 text-red-600 w-5 h-5 group-hover:scale-110 transition-transform",
                  compact && "left-4 w-4 h-4"
                )} />
                <div className={cn(
                  "h-16 w-full rounded-2xl bg-zinc-50 border-0 ring-1 ring-zinc-100 focus-within:ring-2 focus-within:ring-red-600/20 pl-14 pr-4 flex items-center font-bold text-zinc-900 transition-all",
                  compact && "h-12 pl-12 text-sm"
                )}>
                  {location}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-2 lg:hidden">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-4">Return Location</label>
               <div className="relative group">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <div className="h-16 w-full rounded-2xl bg-zinc-50 border-0 ring-1 ring-zinc-100 pl-14 pr-4 flex items-center font-bold text-zinc-900 opacity-60">
                   Same as Pick-up
                </div>
               </div>
            </div>

            {/* Date & Time Selection - 6 cols */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pick-up */}
              <div className="flex gap-2">
                <div className={cn("w-28 shrink-0 space-y-2", compact && "w-24")}>
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">{t('time')}</label>
                   <div className="relative">
                      <Clock className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4",
                        compact && "left-3"
                      )} />
                      <select 
                        className={cn(
                          "h-16 w-full rounded-2xl bg-zinc-50 border-0 ring-1 ring-zinc-100 focus:ring-2 focus:ring-red-600/20 pl-10 pr-2 text-sm font-bold text-zinc-900 appearance-none outline-none transition-all cursor-pointer hover:bg-zinc-100",
                          compact && "h-12 pl-9"
                        )}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                   </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">{t('pickup_date')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-16 justify-start text-left font-bold text-base rounded-2xl bg-zinc-50 border-0 ring-1 ring-zinc-100 hover:bg-zinc-100 hover:text-zinc-900 transition-all",
                          !dateRange?.from && "text-muted-foreground",
                          compact && "h-12 text-sm"
                        )}
                      >
                        <CalendarIcon className={cn("mr-3 h-5 w-5 text-red-600", compact && "w-4 h-4 mr-2")} />
                        {dateRange?.from ? format(dateRange.from, "MMM d") : <span>{t('pick_date')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-xl border-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={(date) => isBefore(date, startOfDay(new Date()))}
                        className="p-4 bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Return */}
              <div className="flex gap-2">
                <div className={cn("w-28 shrink-0 space-y-2", compact && "w-24")}>
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">{t('time')}</label>
                   <div className="relative">
                      <Clock className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4",
                        compact && "left-3"
                      )} />
                      <select 
                        className={cn(
                          "h-16 w-full rounded-2xl bg-zinc-50 border-0 ring-1 ring-zinc-100 focus:ring-2 focus:ring-red-600/20 pl-10 pr-2 text-sm font-bold text-zinc-900 appearance-none outline-none transition-all cursor-pointer hover:bg-zinc-100",
                          compact && "h-12 pl-9"
                        )}
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      >
                        {Array.from({ length: 24 }).map((_, i) => (
                          <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {i.toString().padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                   </div>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">{t('return_date')}</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-16 justify-start text-left font-bold text-base rounded-2xl bg-zinc-50 border-0 ring-1 ring-zinc-100 hover:bg-zinc-100 hover:text-zinc-900 transition-all",
                          !dateRange?.to && "text-muted-foreground",
                          compact && "h-12 text-sm"
                        )}
                      >
                        <CalendarIcon className={cn("mr-3 h-5 w-5 text-red-600", compact && "w-4 h-4 mr-2")} />
                        {dateRange?.to ? format(dateRange.to, "MMM d") : <span>{t('pick_date')}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden shadow-xl border-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={(date) => isBefore(date, startOfDay(new Date()))}
                        className="p-4 bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Search Button - 2 cols */}
            <div className={cn("lg:col-span-2", compact && "lg:col-span-12 md:col-span-12")}>
              <Button 
                size="lg" 
                className={cn(
                  "w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]",
                  compact && "h-12 text-base"
                )}
                onClick={handleSearch}
              >
                {t('show_cars')}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center animate-in slide-in-from-top-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
