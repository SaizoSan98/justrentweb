"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Car, Search } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function BookingEngine() {
  const router = useRouter()
  const [startDate, setStartDate] = React.useState<Date>(new Date())
  const [endDate, setEndDate] = React.useState<Date>(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  const [location, setLocation] = React.useState("Budapest")
  const [category, setCategory] = React.useState("All Categories")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (category && category !== "All Categories") params.set("category", category)
    // In a real app, we would pass dates too
    router.push(`/fleet?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto -mt-24 relative z-20 px-4 md:px-0">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md text-zinc-900 overflow-hidden rounded-2xl ring-1 ring-zinc-100">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            
            {/* Location */}
            <div className="md:col-span-3 p-6 hover:bg-zinc-50 transition-colors cursor-pointer group">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block group-hover:text-orange-600 transition-colors">
                Pick-up & Return
              </label>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-zinc-400 group-hover:text-orange-600 transition-colors" />
                <div>
                   <div className="font-bold text-lg text-zinc-900">Budapest</div>
                   <div className="text-xs text-zinc-500">All Locations</div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="md:col-span-4 p-6 hover:bg-zinc-50 transition-colors cursor-pointer group">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block group-hover:text-orange-600 transition-colors">
                Rental Period
              </label>
               <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-zinc-400 group-hover:text-orange-600 transition-colors" />
                <div className="flex flex-col">
                   <div className="font-bold text-lg text-zinc-900">
                     {format(startDate, "MMM d")} <span className="text-zinc-300 mx-1">→</span> {format(endDate, "MMM d")}
                   </div>
                   <div className="text-xs text-zinc-500">3 days rental</div>
                </div>
              </div>
            </div>

            {/* Car Type */}
             <div className="md:col-span-3 p-6 hover:bg-zinc-50 transition-colors cursor-pointer group">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block group-hover:text-orange-600 transition-colors">
                Vehicle Type
              </label>
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-zinc-400 group-hover:text-orange-600 transition-colors" />
                <select 
                  className="bg-transparent font-bold text-lg text-zinc-900 outline-none w-full cursor-pointer appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>All Categories</option>
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Sports</option>
                  <option>Luxury</option>
                </select>
              </div>
            </div>

            {/* Button */}
            <div className="md:col-span-2 p-4 flex items-center justify-center">
              <Button 
                onClick={handleSearch}
                className="w-full h-full min-h-[60px] bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg uppercase tracking-wide rounded-xl shadow-lg shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Search
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
