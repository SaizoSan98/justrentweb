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
}

export function BookingEngine({ 
  initialStartDate, 
  initialEndDate,
  className,
  showLabel = true,
  compact = false
}: BookingEngineProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = React.useState(!compact)
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
      <div className={cn("w-full max-w-6xl mx-auto px-4 relative z-20", className)}>
        <Card className="border-0 shadow-sm bg-white rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-red-600" />
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-zinc-400 uppercase">Dates</span>
                   <span className="font-bold text-zinc-900">
                     {dateRange?.from ? format(dateRange.from, "MMM d.") : "Select"} - {dateRange?.to ? format(dateRange.to, "MMM d.") : "Select"}
                   </span>
                </div>
             </div>
             <div className="w-px h-8 bg-zinc-200 hidden sm:block"></div>
             <div className="flex items-center gap-3 hidden sm:flex">
                <Clock className="w-5 h-5 text-red-600" />
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-zinc-400 uppercase">Time</span>
                   <span className="font-bold text-zinc-900">{startTime} - {endTime}</span>
                </div>
             </div>
          </div>
          
          <Button 
            onClick={() => setIsExpanded(true)}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
          >
            Change Dates
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto -mt-24 relative z-20 px-4", className)}>
      {/* Tab selection */}
      {showLabel && (
        <div className="flex gap-2 mb-4">
          <Button variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6 gap-2">
            <Car className="w-4 h-4" /> Car Rental
          </Button>
        </div>
      )}

      <Card className="border-0 shadow-2xl bg-white rounded-3xl p-6">
        <CardContent className="p-0 space-y-6">
          
          {/* Header for Compact Mode Expanded */}
          {compact && (
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-2">
              <h3 className="font-bold text-lg">Edit Search</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>Cancel</Button>
            </div>
          )}

          {/* Location Input */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
              Pick-up & Return
            </label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                value={location}
                readOnly
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Date & Time Selection */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              
              {/* Pick-up */}
              <div className="flex gap-2">
                <div className="flex-grow relative">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
                    Pick-up Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-bold text-lg h-14 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-red-600 rounded-xl",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-zinc-400" />
                        {dateRange?.from ? format(dateRange.from, "MMM d.") : <span>Pick Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-4 bg-white rounded-xl shadow-xl border border-zinc-100">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          disabled={(date) => date < startOfDay(new Date())}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <TimePicker 
                  label="Time"
                  value={startTime}
                  onChange={setStartTime}
                />
              </div>

              {/* Drop-off */}
              <div className="flex gap-2">
                <div className="flex-grow relative">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
                    Return Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-bold text-lg h-14 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-red-600 rounded-xl",
                          !dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-zinc-400" />
                        {dateRange?.to ? format(dateRange.to, "MMM d.") : <span>Pick Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <div className="p-4 bg-white rounded-xl shadow-xl border border-zinc-100">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <TimePicker 
                  label="Time"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="w-full lg:w-48 pb-0.5">
              <Button 
                onClick={handleSearch}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Show Cars
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
