"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Gauge, Fuel, Users, Star, ChevronLeft, ChevronRight, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getBrandLogo } from "@/lib/brand-logos"

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
  suitcases?: number
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
             <Link href={`/fleet?category=${car.categories?.[0]?.name}`} className="block h-full">
                <div className="bg-[#f3f4f6] rounded-[2.5rem] p-8 h-full border border-zinc-100 shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 relative overflow-hidden flex flex-col">
                    
                    {/* Badge */}
                    <div className="relative z-10 mb-4">
                         <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-black/20">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            Popular Choice
                         </span>
                    </div>

                    {/* Header */}
                    <div className="relative z-10 mb-4">
                        <h3 className="text-3xl font-black text-zinc-900 tracking-tight leading-none mb-1">
                            {car.make} {car.model}
                        </h3>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            {car.categories?.[0]?.name && (
                                <>
                                    <span>{car.categories[0].name}</span>
                                    <span className="text-zinc-300">|</span>
                                </>
                            )}
                            <span>OR SIMILAR</span>
                        </p>
                    </div>

                    {/* Specs - Chips */}
                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                        <div className="bg-zinc-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-600">{car.fuelType} Vehicle</span>
                        </div>
                        <div className="bg-zinc-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-xs font-bold text-zinc-600">{car.seats}</span>
                        </div>
                        <div className="bg-zinc-200/80 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <Gauge className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-xs font-bold text-zinc-600">{car.transmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
                        </div>
                    </div>

                    {/* Car Image */}
                    <div className="relative z-10 w-full h-[240px] mb-6 flex-shrink-0">
                        
                        {/* Brand Logo Overlay - Top of Image */}
                        {getBrandLogo(car.make) && (
                            <div className="absolute top-0 w-full h-full flex items-start justify-center pt-4 opacity-[0.1] pointer-events-none select-none z-0">
                                <div className="relative w-32 h-32">
                                    <Image 
                                        src={getBrandLogo(car.make)}
                                        alt={car.make}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                            </div>
                        )}

                        <Image 
                            src={car.imageUrl || "/placeholder-car.png"}
                            alt={`${car.make} ${car.model}`}
                            fill
                            className="object-contain object-center drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 z-10"
                        />
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 pt-6 mt-4 border-t border-zinc-200 flex items-end justify-between">
                         <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-zinc-900 tracking-tighter">€{Math.round(Number(car.pricePerDay)).toLocaleString()}</span>
                                <span className="text-sm text-zinc-500 font-medium">/ day</span>
                            </div>
                         </div>
                         
                         <div className="bg-[#c92a2a] text-white px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-red-900/10 group-hover:bg-[#b02525] transition-colors">
                            Select
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
