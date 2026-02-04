
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Gauge, Fuel, Users, Settings } from "lucide-react"
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
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-black to-black pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-red-600 font-bold tracking-widest uppercase text-sm mb-2">Our Collection</h2>
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">POPULAR CARS</h3>
            </div>
            <Button variant="outline" className="hidden md:flex bg-zinc-900 border-zinc-800 text-white hover:bg-white hover:text-black transition-colors" asChild>
                <Link href="/fleet">View All Cars <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
                <div key={car.id} className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="relative aspect-[16/10] w-full bg-zinc-900/50">
                        <Image 
                            src={car.imageUrl || "/placeholder-car.png"}
                            alt={`${car.make} ${car.model}`}
                            fill
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                            <span className="px-2 py-1 rounded bg-zinc-950/50 backdrop-blur text-[10px] font-bold text-white border border-zinc-800 uppercase tracking-wider">
                                {car.categories?.[0]?.name || "Car"}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-500 transition-colors">{car.make} {car.model}</h3>
                                <div className="flex gap-3 text-zinc-500 text-xs font-medium">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {car.seats}</span>
                                    <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {car.transmission}</span>
                                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {car.fuelType}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white">{Number(car.pricePerDay).toLocaleString()} €</p>
                                <p className="text-xs text-zinc-500">/ day</p>
                            </div>
                        </div>
                        
                        <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold" asChild>
                            <Link href={`/fleet?guaranteedModel=true&category=${car.categories?.[0]?.name}`}>Book Now</Link>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
            <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-white hover:bg-white hover:text-black transition-colors w-full" asChild>
                <Link href="/fleet">View All Cars <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
        </div>
      </div>
    </section>
  )
}
