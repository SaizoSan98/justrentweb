
"use client"

import * as React from "react"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, MapPin, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

  const handleDateSelect = (range: any) => {
    setDate(range)
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
            
            {/* Location (Static for now as per usual requests, but can be made dynamic) */}
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
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"ghost"}
                            className={cn(
                                "w-full justify-start text-left font-bold text-white p-0 hover:bg-transparent hover:text-red-500 h-auto",
                                !date && "text-muted-foreground"
                            )}
                        >
                            {date?.from ? (
                                date.to ? (
                                    <span className="flex items-center gap-2">
                                        {format(date.from, "LLL dd, HH:mm")} 
                                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                                        {format(date.to, "LLL dd, HH:mm")}
                                    </span>
                                ) : (
                                    format(date.from, "LLL dd, HH:mm")
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800 text-white" align="start">
                        <Calendar
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={handleDateSelect}
                            numberOfMonths={2}
                            className="bg-zinc-950 text-white"
                        />
                    </PopoverContent>
                </Popover>
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
