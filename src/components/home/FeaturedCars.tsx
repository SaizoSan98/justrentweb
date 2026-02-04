
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight, Gauge, Fuel, Zap, Settings } from "lucide-react"
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
  category: string
}

interface FeaturedCarsProps {
  cars: Car[]
}

export function FeaturedCars({ cars }: FeaturedCarsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % cars.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + cars.length) % cars.length)
  }

  const activeCar = cars[activeIndex]

  if (!cars.length) return null

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-black to-black pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-red-600 font-bold tracking-widest uppercase text-sm mb-2">Our Collection</h2>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">POPULAR CARS</h3>
            </div>
            <div className="flex gap-4">
                <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-zinc-900 border-zinc-800 text-white hover:bg-white hover:text-black transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-zinc-900 border-zinc-800 text-white hover:bg-white hover:text-black transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>

        <div className="relative min-h-[600px] flex items-center">
            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeCar.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="w-full grid lg:grid-cols-2 gap-12 items-center"
                >
                    {/* Car Info & Image */}
                    <div className="relative group">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="relative z-10 aspect-[16/9] w-full"
                        >
                             <Image 
                                src={activeCar.imageUrl || "/placeholder-car.png"}
                                alt={`${activeCar.make} ${activeCar.model}`}
                                fill
                                className="object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                             />
                        </motion.div>
                        {/* Big Title Behind */}
                        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10vw] font-black text-zinc-900/50 whitespace-nowrap -z-10 select-none">
                            {activeCar.make}
                        </h1>
                        
                        <div className="flex flex-col gap-6 mt-8">
                            <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-none">
                                {activeCar.make} <br/> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                                    {activeCar.model}
                                </span>
                            </h2>
                            
                            <div className="flex gap-8 border-t border-zinc-800 pt-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Gauge className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">0-100 km/h</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">3.4 s</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Top Speed</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">290 km/h</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <Fuel className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Economy</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">9.8 l/100km</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Cards (Simulating the "Diagonal Split" style list) */}
                    <div className="hidden lg:flex flex-col gap-4 relative">
                        <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-transparent z-10 pointer-events-none" />
                        
                        {/* Next 3 cars preview */}
                        {[1, 2, 3].map((offset) => {
                            const carIndex = (activeIndex + offset) % cars.length
                            const car = cars[carIndex]
                            return (
                                <motion.div
                                    key={car.id}
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 0.5 }}
                                    whileHover={{ x: -20, opacity: 1, scale: 1.05 }}
                                    transition={{ delay: offset * 0.1 }}
                                    onClick={() => setActiveIndex(carIndex)}
                                    className="cursor-pointer bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-6 backdrop-blur-sm hover:bg-zinc-800 transition-all group"
                                >
                                    <div className="relative w-32 h-20 shrink-0">
                                        <Image 
                                            src={car.imageUrl || "/placeholder-car.png"}
                                            alt={car.model}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{car.category}</p>
                                        <h4 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors">{car.make} {car.model}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-sm text-zinc-400">{car.transmission}</span>
                                            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                            <span className="text-sm text-zinc-400">{car.fuelType}</span>
                                        </div>
                                    </div>
                                    <div className="ml-auto pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-6 h-6 text-white" />
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
