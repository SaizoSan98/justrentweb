
"use client"

import Image from "next/image"
import { Users, Gauge, Fuel, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface LongTermCar {
  id: string
  make: string
  model: string
  year: number
  imageUrl: string | null
  monthlyPrice: any
  deposit: any
  transmission: string
  fuelType: string
  seats: number
  features: string[]
  description: string | null
}

export function LongTermCarCard({ car }: { car: LongTermCar }) {
  return (
    <div className="group relative bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Image */}
      <div className="relative h-56 bg-zinc-100 flex items-center justify-center p-4">
        {car.imageUrl ? (
          <Image 
            src={car.imageUrl} 
            alt={`${car.make} ${car.model}`}
            fill
            className="object-contain object-center transition-transform duration-500 group-hover:scale-105 p-4"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
             No Image
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
           <Badge className="bg-black text-white hover:bg-black uppercase tracking-wider font-bold">
              Long Term
           </Badge>
        </div>
      </div>

      <div className="p-6 flex flex-col h-[calc(100%-14rem)]">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">
            {car.make} {car.model}
          </h3>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">
            {car.year} • {car.transmission}
          </p>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 mb-6">
           <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
              <Users className="w-3.5 h-3.5" />
              {car.seats} Seats
           </div>
           <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
              <Fuel className="w-3.5 h-3.5" />
              {car.fuelType}
           </div>
           <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 bg-zinc-100 px-3 py-1.5 rounded-full">
              <Gauge className="w-3.5 h-3.5" />
              {car.transmission}
           </div>
        </div>
        
        {/* Features Preview */}
        {car.features.length > 0 && (
            <div className="mb-6 space-y-1">
                {car.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-500">
                        <Check className="w-3 h-3 text-green-500" />
                        {feature}
                    </div>
                ))}
                {car.features.length > 3 && (
                    <div className="text-xs text-zinc-400 pl-5">+{car.features.length - 3} more features</div>
                )}
            </div>
        )}

        <div className="mt-auto pt-6 border-t border-zinc-100 flex items-end justify-between">
           <div>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-red-600 tracking-tighter">€{Number(car.monthlyPrice)}</span>
                 <span className="text-sm text-zinc-500 font-bold">/ month</span>
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-1">
                 Deposit: €{Number(car.deposit)}
              </div>
           </div>
           
           <Link href="/contact">
             <Button className="bg-black hover:bg-zinc-800 text-white font-bold rounded-xl px-6">
                Inquire
             </Button>
           </Link>
        </div>
      </div>
    </div>
  )
}
