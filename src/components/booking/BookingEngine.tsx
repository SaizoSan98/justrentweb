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
  noShadow?: boolean
}

export function BookingEngine({ 
  initialStartDate, 
  initialEndDate,
  className,
  compact = false,
  dictionary = {},
  noShadow = false
}: BookingEngineProps) {
  const router = useRouter()
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => ({
    from: initialStartDate || new Date(),
    to: initialEndDate,
  }))
  
  const [startTime, setStartTime] = React.useState("10:00")
  const [endTime, setEndTime] = React.useState("10:00")
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
    
    // Combine date and time
    const start = new Date(dateRange.from)
    const [startH, startM] = startTime.split(':')
    start.setHours(parseInt(startH), parseInt(startM))
    
    const end = new Date(dateRange.to)
    const [endH, endM] = endTime.split(':')
    end.setHours(parseInt(endH), parseInt(endM))

    params.set("startDate", start.toISOString())
    params.set("endDate", end.toISOString())
    
    router.push(`/fleet?${params.toString()}`)
  }

  const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
    const h = Math.floor(i / 2)
    const m = i % 2 === 0 ? "00" : "30"
    return `${h.toString().padStart(2, '0')}:${m}`
  })

  // New Slim Design
  return (
    <div className={cn("w-full relative z-20 max-w-5xl mx-auto", className)}>
      <div className={cn(
          "bg-white rounded-3xl md:rounded-full p-2 flex flex-col md:flex-row items-center border-none ring-0 outline-none",
          !noShadow && "shadow-2xl"
      )}>
         
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

         {/* Separator */}
         <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-zinc-200 to-transparent mx-2" />

         {/* Pick Up Date */}
         <div className="flex-1 w-full px-6 py-3 md:py-2 relative group hover:bg-zinc-50 rounded-full transition-colors">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Pick Up</label>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-bold text-zinc-900 outline-none truncate w-full text-left">
                         {dateRange?.from ? format(dateRange.from, "d MMM") : "Select Date"}
                         <span className="mx-2 text-zinc-300">|</span>
                         {startTime}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[85vw] max-w-[320px] md:w-auto p-0 md:p-4 flex flex-col md:flex-row gap-0 md:gap-4 overflow-hidden md:overflow-visible rounded-xl" align="center">
                      <div className="p-2 md:p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange?.from}
                          onSelect={(date) => setDateRange(prev => ({ from: date, to: prev?.to }))}
                          className="w-full border-none shadow-none"
                        />
                      </div>
                      <div className="hidden md:block h-[300px] w-px bg-zinc-100" />
                      <div className="border-t border-zinc-100 md:border-0 p-3 md:p-0 bg-zinc-50 md:bg-white">
                        <div className="text-xs font-bold text-zinc-400 mb-2 md:hidden uppercase tracking-wider text-center">Pickup Time</div>
                        <div className="grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-1 max-h-[160px] md:h-[300px] overflow-y-auto w-full md:w-24 pb-0 md:pb-0 scrollbar-hide">
                        {TIME_OPTIONS.map(time => (
                            <button
                                key={time}
                                onClick={() => setStartTime(time)}
                                className={cn(
                                    "flex-shrink-0 w-full text-xs font-bold py-2 px-1 md:px-0 rounded-md hover:bg-zinc-200 md:hover:bg-zinc-100 transition-colors border border-zinc-200 md:border-0 bg-white md:bg-transparent",
                                    startTime === time ? "bg-black text-white hover:bg-black border-black" : "text-zinc-600"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
            </div>
         </div>

         {/* Separator */}
         <div className="hidden md:block w-px h-8 bg-gradient-to-b from-transparent via-zinc-200 to-transparent mx-2" />

         {/* Return Date */}
         <div className="flex-1 w-full px-6 py-3 md:py-2 relative group hover:bg-zinc-50 rounded-full transition-colors">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Return</label>
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex items-center text-sm font-bold text-zinc-900 outline-none truncate w-full text-left">
                         {dateRange?.to ? format(dateRange.to, "d MMM") : "Select Date"}
                         <span className="mx-2 text-zinc-300">|</span>
                         {endTime}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[85vw] max-w-[320px] md:w-auto p-0 md:p-4 flex flex-col md:flex-row gap-0 md:gap-4 overflow-hidden md:overflow-visible rounded-xl" align="center">
                      <div className="p-2 md:p-0">
                        <Calendar
                          mode="single"
                          selected={dateRange?.to}
                          onSelect={(date) => setDateRange(prev => ({ from: prev?.from, to: date }))}
                          className="w-full border-none shadow-none"
                        />
                      </div>
                      <div className="hidden md:block h-[300px] w-px bg-zinc-100" />
                      <div className="border-t border-zinc-100 md:border-0 p-3 md:p-0 bg-zinc-50 md:bg-white">
                        <div className="text-xs font-bold text-zinc-400 mb-2 md:hidden uppercase tracking-wider text-center">Return Time</div>
                        <div className="grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-1 max-h-[160px] md:h-[300px] overflow-y-auto w-full md:w-24 pb-0 md:pb-0 scrollbar-hide">
                        {TIME_OPTIONS.map(time => (
                            <button
                                key={time}
                                onClick={() => setEndTime(time)}
                                className={cn(
                                    "flex-shrink-0 w-full text-xs font-bold py-2 px-1 md:px-0 rounded-md hover:bg-zinc-200 md:hover:bg-zinc-100 transition-colors border border-zinc-200 md:border-0 bg-white md:bg-transparent",
                                    endTime === time ? "bg-black text-white hover:bg-black border-black" : "text-zinc-600"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                        </div>
                      </div>
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
