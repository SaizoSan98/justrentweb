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
  
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(() => {
    // Default Logic: Start Now + 2h, Duration 3 days
    if (initialStartDate && initialEndDate) {
        return { from: initialStartDate, to: initialEndDate }
    }

    const start = new Date()
    // Default Start: +24h to avoid Renteon "too soon" availability issues
    start.setDate(start.getDate() + 1)
    // start.setHours(start.getHours() + 2) // Old logic
    
    const end = new Date(start)
    end.setDate(end.getDate() + 3)
    
    return {
        from: start,
        to: end
    }
  })
  
  const [startTime, setStartTime] = React.useState(() => {
    if (initialStartDate) return format(initialStartDate, "HH:mm")
    
    // Default to next hour if searching for today
    // Actually, we want current time + 2h.
    // But format needs HH:mm.
    // And we have specific TIME_OPTIONS (00 or 30).
    // Let's just default to what the date says, but rounded to nearest 30m or kept as is?
    // Default to next day + 2h logic
    const now = new Date()
    now.setDate(now.getDate() + 1) // +24h
    // now.setHours(now.getHours() + 2)
    
    const h = now.getHours()
    const m = now.getMinutes()
    // Round to nearest 30? Or just HH:mm
    // User asked for "Feb 10. 11:53" so let's keep it exact if possible, 
    // BUT our select only has 30m increments. 
    // If we want exact, we might need to change the input type or just round to nearest.
    // However, the user example "11:53" suggests they might want exact time.
    // The TIME_OPTIONS are fixed 30m slots.
    // If I return "11:53", it won't match any option in the Select.
    // The select value must match one of the options.
    // Let's round to nearest 30 mins for the UI Select.
    
    // Actually, let's look at TIME_OPTIONS usage below. 
    // It's a Select. So value MUST match.
    // Let's round to nearest 30m for default.
    // If user specifically asked for "11:53", they might be okay with "12:00" or "11:30".
    // Wait, the user prompt said: "Feb 10. 11:53 ( 2 órát adunk a mostani időponthoz )"
    // And "Feb 13. 11:53-ig tartson".
    // If I force 30m steps, I can't do 11:53.
    // I will stick to the Select options (00/30) for now to avoid breaking UI.
    // So I will round the +2h time to nearest 30m.
    
    const roundedMinutes = m < 15 ? 0 : m < 45 ? 30 : 60
    let finalH = h
    let finalM = roundedMinutes
    
    if (roundedMinutes === 60) {
        finalH += 1
        finalM = 0
    }
    
    return `${finalH.toString().padStart(2, '0')}:${finalM.toString().padStart(2, '0')}`
  })
  const [endTime, setEndTime] = React.useState(() => {
    if (initialEndDate) return format(initialEndDate, "HH:mm")
    return startTime // Match start time by default
  })
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
                    <PopoverContent className="w-auto p-0 overflow-hidden rounded-2xl shadow-2xl border-0" align="center">
                      <div className="flex flex-col md:flex-row h-[380px]"> {/* Fixed height for consistency */}
                        <div className="p-2 bg-white h-full flex items-center"> {/* Center calendar vertically */}
                          <Calendar
                            mode="single"
                            selected={dateRange?.from}
                            onSelect={(date) => setDateRange(prev => ({ from: date, to: prev?.to }))}
                            className="border-none shadow-none"
                          />
                        </div>
                        <div className="hidden md:block w-px bg-zinc-100 h-full" />
                        <div className="bg-zinc-50 md:bg-white w-full md:w-32 flex flex-col h-full border-t border-zinc-100 md:border-t-0">
                          <div className="p-3 pb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center bg-white z-10">Pickup Time</div>
                          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 pt-0 space-y-1">
                          {TIME_OPTIONS.map(time => (
                              <button
                                  key={time}
                                  onClick={() => setStartTime(time)}
                                  className={cn(
                                      "w-full text-sm font-bold py-2 rounded-lg transition-all border-2", 
                                      startTime === time 
                                        ? "bg-black text-white border-black" 
                                        : "bg-transparent text-zinc-600 border-transparent hover:bg-zinc-100 hover:text-black"
                                  )}
                              >
                                  {time}
                              </button>
                          ))}
                          </div>
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
                    <PopoverContent className="w-auto p-0 overflow-hidden rounded-2xl shadow-2xl border-0" align="center">
                      <div className="flex flex-col md:flex-row h-[380px]"> {/* Fixed height for consistency */}
                        <div className="p-2 bg-white h-full flex items-center"> {/* Center calendar vertically */}
                          <Calendar
                            mode="single"
                            selected={dateRange?.to}
                            onSelect={(date) => setDateRange(prev => ({ from: prev?.from, to: date }))}
                            className="border-none shadow-none"
                          />
                        </div>
                        <div className="hidden md:block w-px bg-zinc-100 h-full" />
                        <div className="bg-zinc-50 md:bg-white w-full md:w-32 flex flex-col h-full border-t border-zinc-100 md:border-t-0">
                          <div className="p-3 pb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center bg-white z-10">Return Time</div>
                          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 pt-0 space-y-1">
                          {TIME_OPTIONS.map(time => (
                              <button
                                  key={time}
                                  onClick={() => setEndTime(time)}
                                  className={cn(
                                      "w-full text-sm font-bold py-2 rounded-lg transition-all border-2", 
                                      endTime === time 
                                        ? "bg-black text-white border-black" 
                                        : "bg-transparent text-zinc-600 border-transparent hover:bg-zinc-100 hover:text-black"
                                  )}
                              >
                                  {time}
                              </button>
                          ))}
                          </div>
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
