
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Gauge, Fuel, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Car {
  id: string
  make: string
  model: string
  year: number
  imageUrl: string | null
  pricePerDay: number
  transmission: string
  fuelType: string
  seats: number
  categories: { name: string }[]
}

interface FeaturedCarsProps {
  cars: Car[]
}

export function FeaturedCars({ cars }: FeaturedCarsProps) {
  if (!cars.length) return null

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">Top picks vehicle this month</h2>
        <p className="text-zinc-500">Experience the epitome of amazing journey with our top picks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cars.map((car) => (
          <div key={car.id} className="group relative bg-white rounded-[2rem] p-6 transition-all duration-300 hover:shadow-2xl border-2 border-transparent hover:border-black/5 hover:-translate-y-1">
             {/* Badge */}
             <div className="absolute top-6 left-6 z-10">
                <span className="px-3 py-1.5 rounded-full bg-zinc-100 text-xs font-bold text-zinc-600 uppercase tracking-wide">
                    {car.categories?.[0]?.name || "Car"}
                </span>
             </div>

             {/* Image */}
             <div className="relative aspect-[4/3] w-full mb-4">
                <Image 
                    src={car.imageUrl || "/placeholder-car.png"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
             </div>
             
             {/* Content */}
             <div className="px-2">
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{car.make} {car.model}</h3>
                
                {/* Specs */}
                <div className="flex flex-wrap gap-4 text-zinc-500 text-sm font-medium mb-6">
                    <span className="flex items-center gap-1.5">
                        <Gauge className="w-4 h-4" /> 
                        {car.transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> 
                        {car.seats}
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-900 font-bold">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 
                        4.8
                    </span>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div>
                        <p className="text-xs text-zinc-400 font-medium mb-0.5">Start from</p>
                        <p className="text-xl font-bold text-zinc-900">
                            ${Number(car.pricePerDay).toLocaleString()} 
                            <span className="text-sm font-normal text-zinc-400 ml-1">/ day</span>
                        </p>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="font-bold text-zinc-900 hover:bg-zinc-50 rounded-full" asChild>
                         <Link href={`/fleet?guaranteedModel=true&category=${car.categories?.[0]?.name}`}>
                            See All <ArrowRight className="w-4 h-4 ml-2" />
                         </Link>
                    </Button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}
