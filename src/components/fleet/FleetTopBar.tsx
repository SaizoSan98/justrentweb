
"use client"

import { format } from "date-fns"
import { Calendar, MapPin, ChevronRight, Car, Package, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface FleetTopBarProps {
  searchParams?: {
    startDate?: string
    endDate?: string
    location?: string
    returnLocation?: string
  }
}

export function FleetTopBar({ searchParams }: FleetTopBarProps) {
  const startDate = searchParams?.startDate ? new Date(searchParams.startDate) : new Date()
  const endDate = searchParams?.endDate ? new Date(searchParams.endDate) : new Date(new Date().setDate(new Date().getDate() + 3))
  
  return (
    <div className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center text-xs md:text-sm divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
          
          {/* Rental Information */}
          <div className="flex-1 py-4 lg:px-6 relative group cursor-pointer hover:bg-zinc-900 transition-colors">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
              <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[8px]">1</span>
              Rental Information
            </div>
            <div className="font-bold text-white flex items-center gap-2">
               <Calendar className="w-4 h-4 text-red-600" />
               {format(startDate, "EEE, MMM dd, HH:mm")} 
               <ChevronRight className="w-3 h-3 text-zinc-600" />
               {format(endDate, "EEE, MMM dd, HH:mm")}
            </div>
          </div>

          {/* Pick Up & Drop Off */}
          <div className="flex-1 py-4 lg:px-6 relative group cursor-pointer hover:bg-zinc-900 transition-colors">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
               <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[8px]">2</span>
               Pick Up & Drop Off
            </div>
            <div className="font-bold text-white flex items-center gap-2">
               <MapPin className="w-4 h-4 text-red-600" />
               {searchParams?.location || "Budapest Liszt Ferenc Airport"}
            </div>
          </div>

          {/* Return Station */}
          <div className="flex-1 py-4 lg:px-6 relative group cursor-pointer hover:bg-zinc-900 transition-colors">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
               <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[8px]">3</span>
               Return Station
            </div>
            <div className="font-bold text-white flex items-center gap-2">
               <MapPin className="w-4 h-4 text-zinc-600" />
               {searchParams?.returnLocation || searchParams?.location || "Same as Pick Up"}
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex-1 py-4 lg:px-6 bg-zinc-900 border-b-2 border-red-600">
            <div className="flex items-center gap-2 mb-1 text-white font-bold uppercase tracking-wider text-[10px]">
               <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[8px]">4</span>
               Vehicle
            </div>
            <div className="font-bold text-white flex items-center gap-2">
               <Car className="w-4 h-4 text-white" />
               Choose
            </div>
          </div>

          {/* Additional Products */}
          <div className="flex-1 py-4 lg:px-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
               <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[8px]">5</span>
               Additional Products
            </div>
            <div className="font-bold text-zinc-400 flex items-center gap-2">
               <Package className="w-4 h-4" />
               Choose
            </div>
          </div>

          {/* Total */}
          <div className="flex-1 py-4 lg:px-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-2 mb-1 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
               <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[8px]">6</span>
               Total
            </div>
            <div className="font-bold text-zinc-400 flex items-center gap-2">
               <CreditCard className="w-4 h-4" />
               0,00 €
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
