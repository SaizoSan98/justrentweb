
"use client"

import * as React from "react"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, MapPin, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FleetDatePicker } from "./FleetDatePicker"
import { useRouter, useSearchParams } from "next/navigation"

interface FleetTopBarProps {
  searchParams?: {
    startDate?: string
    endDate?: string
    location?: string
    returnLocation?: string
  }
}

export function FleetTopBar({ searchParams }: FleetTopBarProps) {
  const router = useRouter()
  const params = useSearchParams()
  
  const [date, setDate] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
    from: searchParams?.startDate ? new Date(searchParams.startDate) : new Date(),
    to: searchParams?.endDate ? new Date(searchParams.endDate) : addDays(new Date(), 3),
  })

  // Ensure type compatibility for the state setter
  const handleDateChange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
        setDate(range)
    }
  }

  const handleSearch = () => {
    const newParams = new URLSearchParams(params.toString())
    
    if (date.from) {
      newParams.set("startDate", date.from.toISOString())
    }
    
    if (date.to) {
      newParams.set("endDate", date.to.toISOString())
    }

    router.push(`/fleet?${newParams.toString()}`)
  }

  return (
    <div className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-40">
      <div className="container mx-auto py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center bg-zinc-900 p-2 rounded-xl border border-zinc-800">
            
            {/* Location (Static for now) */}
            <div className="flex-1 w-full lg:w-auto px-4 py-2 border-r border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-3 h-3" /> Pick Up & Return
                </div>
                <div className="font-bold text-white truncate">
                    Budapest Liszt Ferenc Airport
                </div>
            </div>

            {/* Date Picker */}
            <div className="flex-[2] w-full lg:w-auto px-4 py-2">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">
                    <CalendarIcon className="w-3 h-3" /> Rental Dates
                </div>
                <FleetDatePicker date={date} setDate={handleDateChange} />
            </div>

            {/* Search Button */}
            <Button 
                onClick={handleSearch}
                className="w-full lg:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-12 rounded-lg"
            >
                Update Search
            </Button>
        </div>
      </div>
    </div>
  )
}
