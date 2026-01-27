"use client"

import * as React from "react"
import { Calendar as CalendarIcon, MapPin, Car } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function BookingEngine() {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="w-full max-w-5xl mx-auto -mt-24 relative z-20">
      <Card className="border-0 shadow-2xl bg-zinc-900/95 backdrop-blur-md text-zinc-50 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            
            {/* Location */}
            <div className="md:col-span-3 p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block group-hover:text-orange-500">
                Pick-up & Return
              </label>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                <div>
                   <div className="font-bold text-lg">Budapest</div>
                   <div className="text-xs text-zinc-500">All Locations</div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="md:col-span-4 p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block group-hover:text-orange-500">
                Rental Period
              </label>
               <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                <div className="flex flex-col">
                   <div className="font-bold text-lg">
                     {format(new Date(), "MMM d, HH:mm")} <span className="text-zinc-600 mx-1">→</span> {format(new Date(Date.now() + 86400000 * 3), "MMM d, HH:mm")}
                   </div>
                </div>
              </div>
            </div>

            {/* Car Type */}
             <div className="md:col-span-3 p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block group-hover:text-orange-500">
                Vehicle Type
              </label>
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                <div>
                   <div className="font-bold text-lg">All Categories</div>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="md:col-span-2 p-4 flex items-center justify-center bg-orange-600 hover:bg-orange-700 transition-colors cursor-pointer">
               <span className="font-bold text-xl text-white uppercase tracking-wide">Search</span>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
