
"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRightLeft, ChevronDown } from "lucide-react"
import { format, differenceInDays, isBefore, startOfDay, addHours } from "date-fns"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

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
  compact = false,
  dictionary = {}
}: BookingEngineProps) {
  const router = useRouter()
  
  // Helper to safely get dictionary value
  const t = (key: string, section: string = "hero") => {
    return dictionary?.[section]?.[key] || key
  }

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => ({
    from: initialStartDate || new Date(),
    to: initialEndDate,
  }))
  
  const [startTime, setStartTime] = React.useState("10:30 AM")
  const [endTime, setEndTime] = React.useState("04:30 PM")
  const [departure, setDeparture] = React.useState("Budapest Liszt Ferenc Airport (BUD)")
  const [returnLocation, setReturnLocation] = React.useState("Budapest Liszt Ferenc Airport (BUD)")
  const [isRoundTrip, setIsRoundTrip] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSearch = () => {
    setError(null)

    if (!dateRange?.from || !dateRange?.to) {
      setError("Please select a valid date range.")
      return
    }

    const params = new URLSearchParams()
    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString())
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString())
    
    router.push(`/fleet?${params.toString()}`)
  }

  if (compact) {
    return (
      <div className={cn("w-full bg-white rounded-2xl shadow-sm border border-zinc-100 p-4", className)}>
        <div className="flex flex-col lg:flex-row items-center gap-4">
             {/* Departure */}
            <div className="flex-1 w-full min-w-[200px]">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Departure</label>
               <div className="relative">
                  <input 
                    type="text" 
                    value={departure}
                    className="w-full text-sm font-bold text-zinc-900 bg-transparent outline-none truncate"
                    readOnly
                  />
               </div>
            </div>

            <div className="w-px h-8 bg-zinc-100 hidden lg:block" />

            {/* Return */}
            <div className="flex-1 w-full min-w-[200px]">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Return Location</label>
               <div className="relative">
                  <input 
                    type="text" 
                    value={returnLocation}
                    className="w-full text-sm font-bold text-zinc-900 bg-transparent outline-none truncate"
                    readOnly
                  />
               </div>
            </div>

            <div className="w-px h-8 bg-zinc-100 hidden lg:block" />

            {/* Pick Up */}
            <div className="flex-1 w-full min-w-[200px]">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Pick Up Date & Time</label>
               <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-bold text-zinc-900 hover:text-zinc-700 outline-none truncate">
                         <CalendarIcon className="w-3 h-3 mr-2 text-zinc-400" />
                         {dateRange?.from ? format(dateRange.from, "d MMM yyyy") : "Select"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(date) => setDateRange(prev => ({ from: date, to: prev?.to }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <select 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-sm font-medium text-zinc-500 outline-none bg-transparent cursor-pointer"
                  >
                     <option>10:30 AM</option>
                     <option>11:00 AM</option>
                  </select>
               </div>
            </div>

            <div className="w-px h-8 bg-zinc-100 hidden lg:block" />

            {/* Return */}
            <div className="flex-1 w-full min-w-[200px]">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Return Date & Time</label>
               <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-bold text-zinc-900 hover:text-zinc-700 outline-none truncate">
                         <CalendarIcon className="w-3 h-3 mr-2 text-zinc-400" />
                         {dateRange?.to ? format(dateRange.to, "d MMM yyyy") : "Select"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.to}
                        onSelect={(date) => setDateRange(prev => ({ from: prev?.from, to: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <select 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-sm font-medium text-zinc-500 outline-none bg-transparent cursor-pointer"
                  >
                     <option>04:30 PM</option>
                     <option>05:00 PM</option>
                  </select>
               </div>
            </div>

            <Button 
                onClick={handleSearch}
                className="bg-black hover:bg-zinc-800 text-white rounded-xl px-6 h-10 font-bold shrink-0"
            >
                Search <ArrowRightLeft className="w-3 h-3 ml-2" />
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full relative z-20", className)}>
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
         {/* Top Row: Fields */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            
            {/* Departure */}
            <div className="relative border-b lg:border-b-0 lg:border-r border-zinc-100 pb-4 lg:pb-0 lg:pr-6">
               <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-zinc-900">Departure</label>
               </div>
               <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400">
                     <div className="w-2 h-2 rounded-full border-2 border-zinc-400"></div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="City, airport or station" 
                    className="w-full pl-6 pr-4 py-2 text-sm text-zinc-600 placeholder:text-zinc-300 outline-none font-medium bg-transparent cursor-not-allowed opacity-70"
                    value={departure}
                    readOnly
                    disabled
                  />
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4 pointer-events-none" />
               </div>
            </div>

            {/* Return Location */}
            <div className="relative border-b lg:border-b-0 lg:border-r border-zinc-100 pb-4 lg:pb-0 lg:pr-6">
               <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-zinc-900">Return Location</label>
               </div>
               <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400">
                     <div className="w-2 h-2 rounded-full border-2 border-zinc-400"></div>
                  </div>
                  <input 
                    type="text" 
                    placeholder="City, airport or station" 
                    className="w-full pl-6 pr-4 py-2 text-sm text-zinc-600 placeholder:text-zinc-300 outline-none font-medium bg-transparent cursor-not-allowed opacity-70"
                    value={returnLocation}
                    readOnly
                    disabled
                  />
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4 pointer-events-none" />
               </div>
            </div>

            {/* Pick Up Date & Time */}
            <div className="relative border-b lg:border-b-0 lg:border-r border-zinc-100 pb-4 lg:pb-0 lg:pr-6">
               <label className="text-sm font-bold text-zinc-900 mb-2 block">Pick Up Date & Time</label>
               <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 outline-none">
                         <CalendarIcon className="w-4 h-4 mr-2 text-zinc-400" />
                         {dateRange?.from ? format(dateRange.from, "d MMM yyyy") : "Select Date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.from}
                        onSelect={(date) => setDateRange(prev => ({ from: date, to: prev?.to }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="h-4 w-px bg-zinc-200"></div>
                  <select 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-sm font-medium text-zinc-600 outline-none bg-transparent cursor-pointer"
                  >
                     <option>10:30 AM</option>
                     <option>11:00 AM</option>
                  </select>
               </div>
            </div>

            {/* Return Date & Time */}
            <div className="relative">
               <label className="text-sm font-bold text-zinc-900 mb-2 block">Return Date & Time</label>
               <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 outline-none">
                         <CalendarIcon className="w-4 h-4 mr-2 text-zinc-400" />
                         {dateRange?.to ? format(dateRange.to, "d MMM yyyy") : "Select Date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange?.to}
                        onSelect={(date) => setDateRange(prev => ({ from: prev?.from, to: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="h-4 w-px bg-zinc-200"></div>
                   <select 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-sm font-medium text-zinc-600 outline-none bg-transparent cursor-pointer"
                  >
                     <option>04:30 PM</option>
                     <option>05:00 PM</option>
                  </select>
               </div>
            </div>
         </div>

         {/* Bottom Row: Filter & Button */}
         <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-4 border-t border-zinc-100">
            <Button 
                onClick={handleSearch}
                className="bg-black hover:bg-zinc-800 text-white rounded-xl px-8 h-12 font-bold w-full md:w-auto"
            >
                Search <ArrowRightLeft className="w-4 h-4 ml-2" />
            </Button>
         </div>
      </div>
    </div>
  )
}
