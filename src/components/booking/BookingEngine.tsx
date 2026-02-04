"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRightLeft, ChevronDown, Search } from "lucide-react"
import { format } from "date-fns"
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
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => ({
    from: initialStartDate || new Date(),
    to: initialEndDate,
  }))
  
  const [startTime, setStartTime] = React.useState("10:30 AM")
  const [endTime, setEndTime] = React.useState("04:30 PM")
  const [departure, setDeparture] = React.useState("Budapest Liszt Ferenc Airport (BUD)")
  const [returnLocation, setReturnLocation] = React.useState("Budapest Liszt Ferenc Airport (BUD)")
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

  // New Slim Design
  return (
    <div className={cn("w-full relative z-20 max-w-5xl mx-auto", className)}>
      <div className="bg-white rounded-full shadow-2xl p-2 border border-zinc-100 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-zinc-100">
         
         {/* Location */}
         <div className="flex-1 w-full px-6 py-3 md:py-2 relative group cursor-pointer hover:bg-zinc-50 rounded-full transition-colors">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Pick-up & Return</label>
            <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-red-600 transition-colors" />
                <input 
                  type="text" 
                  value="Budapest Airport" 
                  className="w-full text-sm font-bold text-zinc-900 bg-transparent outline-none truncate cursor-pointer"
                  readOnly
                />
            </div>
         </div>

         {/* Pick Up Date */}
         <div className="flex-1 w-full px-6 py-3 md:py-2 relative group hover:bg-zinc-50 rounded-full transition-colors">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Pick Up</label>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-bold text-zinc-900 outline-none truncate w-full text-left">
                         {dateRange?.from ? format(dateRange.from, "d MMM, HH:mm") : "Select Date"}
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
            </div>
         </div>

         {/* Return Date */}
         <div className="flex-1 w-full px-6 py-3 md:py-2 relative group hover:bg-zinc-50 rounded-full transition-colors">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Return</label>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-bold text-zinc-900 outline-none truncate w-full text-left">
                         {dateRange?.to ? format(dateRange.to, "d MMM, HH:mm") : "Select Date"}
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
            </div>
         </div>

         {/* Search Button */}
         <div className="p-1 pl-2 w-full md:w-auto">
            <Button 
                onClick={handleSearch}
                className="w-full md:w-12 md:h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center p-0 shadow-lg hover:shadow-red-600/30 transition-all"
            >
                <Search className="w-5 h-5" />
            </Button>
         </div>

      </div>
    </div>
  )
}
