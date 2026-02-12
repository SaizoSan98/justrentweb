"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Clock, ArrowRightLeft, ChevronDown, Search } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { FleetDatePicker } from "@/components/fleet/FleetDatePicker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  
  const [date, setDate] = React.useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    // Default Logic: Start Now + 24h, Duration 3 days
    const start = initialStartDate ? new Date(initialStartDate) : new Date()
    if (!initialStartDate) {
        start.setDate(start.getDate() + 1)
        start.setHours(10, 0, 0, 0)
    }

    const end = initialEndDate ? new Date(initialEndDate) : new Date(start)
    if (!initialEndDate) {
        end.setDate(end.getDate() + 3)
        end.setHours(10, 0, 0, 0)
    }
    
    return { from: start, to: end }
  })

  // Ensure type compatibility for the state setter
  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
        setDate(range)
    }
  }

  const [departure, setDeparture] = React.useState("Budapest Liszt Ferenc Airport (BUD)")
  const [error, setError] = React.useState<string | null>(null)

  const handleSearch = () => {
    setError(null)

    if (!date.from || !date.to) {
      setError("Please select a valid date range.")
      return
    }

    const params = new URLSearchParams()
    
    params.set("startDate", date.from.toISOString())
    params.set("endDate", date.to.toISOString())
    
    router.push(`/fleet?${params.toString()}`)
  }

  // New Slim Design
  return (
    <div className={cn("w-full relative z-20 max-w-4xl mx-auto", className)}>
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

         {/* Unified Date Picker */}
         <div className="flex-[1.5] w-full px-6 py-3 md:py-2 relative group hover:bg-zinc-50 rounded-full transition-colors">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Rental Dates</label>
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-zinc-400 group-hover:text-red-600 transition-colors" />
                <FleetDatePicker 
                    date={date} 
                    setDate={handleDateChange} 
                    triggerClassName="text-zinc-900 font-bold p-0 h-auto hover:text-zinc-700 justify-start w-full"
                />
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
