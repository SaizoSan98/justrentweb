
import * as React from "react"
import Link from "next/link"
import { ArrowRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VehicleCounter } from "@/components/home/VehicleCounter"
import { getAvailableCarCount } from "@/app/actions/cars"

import Image from "next/image"

export async function FeatureGrid() {
  const initialCount = await getAvailableCarCount()

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
           
           {/* Left Column */}
           <div className="lg:col-span-5 flex flex-col gap-6 h-full">
              
              {/* Top Left: Explore More */}
              <div className="relative flex-1 rounded-3xl overflow-hidden bg-zinc-900 text-white p-8 md:p-10 flex flex-col justify-between group min-h-[300px]">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105" />
                  <div className="relative z-10">
                      <Globe className="w-8 h-8 mb-4 text-white/80" />
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-3xl font-bold mb-2 leading-tight">Explore more to get your comfort zone</h3>
                      <p className="text-zinc-300 mb-6 text-sm">Book your perfect stay with us.</p>
                      <Button asChild variant="skewed" className="px-6">
                        <Link href="/fleet">Booking Now <ArrowRight className="w-4 h-4 ml-2" /></Link>
                      </Button>
                  </div>
              </div>

              {/* Bottom Left: Vehicle Counter */}
              <div className="flex-1 min-h-[250px]">
                 <VehicleCounter initialCount={initialCount} />
              </div>

           </div>

           {/* Right Column: Large Image */}
           <div className="lg:col-span-7 h-full min-h-[400px]">
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-zinc-900 text-white group">
                  <Image 
                    src="/audi1.jpeg" 
                    alt="Audi Feature" 
                    fill 
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 p-10 md:p-14 max-w-xl">
                      <h3 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                        Beyond accommodation, creating memories of a lifetime
                      </h3>
                  </div>
              </div>
           </div>

        </div>
      </div>
    </section>
  )
}
