"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Car, ChevronRight, Clock } from "lucide-react"
import { addDays, format } from "date-fns"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { hu } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function BookingEngine() {
  const router = useRouter()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  })
  
  const [startTime, setStartTime] = React.useState("10:00")
  const [endTime, setEndTime] = React.useState("10:00")
  const [location, setLocation] = React.useState("Budapest Repülőtér Terminal 2B")
  
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString())
    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString())
    router.push(`/fleet?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-6xl mx-auto -mt-24 relative z-20 px-4">
      {/* Tab selection */}
      <div className="flex gap-2 mb-4">
        <Button variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6 gap-2">
          <Car className="w-4 h-4" /> Autóbérlés
        </Button>
      </div>

      <Card className="border-0 shadow-2xl bg-white rounded-3xl p-6">
        <CardContent className="p-0 space-y-6">
          
          {/* Location Input */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
              Felvétel és leadás
            </label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
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
                    Felvételi dátum
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-bold text-lg h-14 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-orange-500 rounded-xl",
                          !dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-zinc-400" />
                        {dateRange?.from ? format(dateRange.from, "MMM d.", { locale: hu }) : <span>Dátum</span>}
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
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-24">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
                    Idő
                  </label>
                  <div className="relative">
                    <select 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full h-14 pl-3 pr-8 bg-white border border-zinc-200 rounded-xl text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none hover:bg-zinc-50 hover:border-orange-500 transition-all cursor-pointer"
                    >
                      {Array.from({ length: 24 * 2 }).map((_, i) => {
                        const h = Math.floor(i / 2)
                        const m = i % 2 === 0 ? "00" : "30"
                        const time = `${h.toString().padStart(2, '0')}:${m}`
                        return <option key={time} value={time}>{time}</option>
                      })}
                    </select>
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Drop-off */}
              <div className="flex gap-2">
                <div className="flex-grow relative">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
                    Leadás dátuma
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-bold text-lg h-14 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-orange-500 rounded-xl",
                          !dateRange?.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5 text-zinc-400" />
                        {dateRange?.to ? format(dateRange.to, "MMM d.", { locale: hu }) : <span>Dátum</span>}
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
                <div className="w-24">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
                    Idő
                  </label>
                  <div className="relative">
                    <select 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full h-14 pl-3 pr-8 bg-white border border-zinc-200 rounded-xl text-lg font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none hover:bg-zinc-50 hover:border-orange-500 transition-all cursor-pointer"
                    >
                      {Array.from({ length: 24 * 2 }).map((_, i) => {
                        const h = Math.floor(i / 2)
                        const m = i % 2 === 0 ? "00" : "30"
                        const time = `${h.toString().padStart(2, '0')}:${m}`
                        return <option key={time} value={time}>{time}</option>
                      })}
                    </select>
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>

            </div>

            {/* Search Button */}
            <div className="w-full lg:w-48 pb-0.5">
              <Button 
                onClick={handleSearch}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Autók mutatása
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
