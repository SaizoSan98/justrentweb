"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Gauge, Fuel, Users, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (!cars.length) return null

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
           <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight mb-4">
              FEATURED <span className="text-red-600">FLEET</span>
           </h2>
           <p className="text-zinc-500 text-lg md:text-xl max-w-lg">
              Hand-picked selection of our most exclusive vehicles.
           </p>
        </div>
        
        <div className="flex gap-4">
            <Button 
                onClick={() => scroll('left')}
                variant="outline" 
                size="icon"
                className="w-14 h-14 rounded-full border-zinc-200 hover:bg-black hover:text-white hover:border-black transition-all"
            >
                <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button 
                onClick={() => scroll('right')}
                variant="outline" 
                size="icon"
                className="w-14 h-14 rounded-full border-zinc-200 hover:bg-black hover:text-white hover:border-black transition-all"
            >
                <ChevronRight className="w-6 h-6" />
            </Button>
        </div>
      </div>

      {/* Full Width Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-[10vw] pb-12 -mx-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cars.map((car) => (
          <div 
            key={car.id} 
            className="snap-center shrink-0 w-[85vw] md:w-[60vw] lg:w-[40vw] xl:w-[30vw] relative group"
          >
             <Link href={`/fleet?guaranteedModel=true&category=${car.categories?.[0]?.name}`} className="block h-full">
                <div className="bg-zinc-50 rounded-[2.5rem] p-8 h-full border border-zinc-100 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 relative overflow-hidden">
                    
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
                    
                    {/* Badge */}
                    <div className="relative z-10 mb-8">
                         <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-black/20">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            Top Pick
                         </span>
                    </div>

                    {/* Car Image */}
                    <div className="relative z-10 aspect-[16/10] mb-8">
                        <Image 
                            src={car.imageUrl || "/placeholder-car.png"}
                            alt={`${car.make} ${car.model}`}
                            fill
                            className="object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                        />
                    </div>

                    {/* Info */}
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-3xl font-black text-zinc-900 mb-2 uppercase italic tracking-tighter">
                                    {car.make} {car.model}
                                </h3>
                                <div className="flex flex-wrap gap-3 text-sm font-bold text-zinc-500">
                                    <span className="px-3 py-1 bg-white border border-zinc-100 rounded-lg shadow-sm">{car.categories?.[0]?.name || "Car"}</span>
                                    <span className="px-3 py-1 bg-white border border-zinc-100 rounded-lg shadow-sm flex items-center gap-1">
                                        <Gauge className="w-3 h-3" /> {car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}
                                    </span>
                                    <span className="px-3 py-1 bg-white border border-zinc-100 rounded-lg shadow-sm flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {car.seats} Seats
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between pt-6 border-t border-zinc-200">
                             <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Daily Rate</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-red-600">€{Number(car.pricePerDay).toLocaleString()}</span>
                                    <span className="text-zinc-400 font-medium">/ day</span>
                                </div>
                             </div>
                             
                             <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300 shadow-lg group-hover:shadow-red-600/30">
                                <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                             </div>
                        </div>
                    </div>
                </div>
             </Link>
          </div>
        ))}
        {/* Spacer for right padding */}
        <div className="w-[5vw] shrink-0" />
      </div>
    </section>
  )
}
