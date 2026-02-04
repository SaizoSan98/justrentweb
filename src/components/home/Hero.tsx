"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Dictionary } from "@/lib/dictionary"
import { BookingEngine } from "@/components/booking/BookingEngine"
import { MapPin, Car, Gauge } from "lucide-react"

export function Hero({ dictionary }: { dictionary?: Dictionary }) {
  const t = dictionary?.hero || {
    title: "Premium Car Rental",
    subtitle: "Experience the thrill of driving the world's finest automobiles.",
    cta: "View Fleet",
    pickup_return: "Pick-up & Return",
    pickup_date: "Pick-up Date",
    return_date: "Return Date",
    time: "Time",
    show_cars: "Show Cars"
  }

  return (
    <div className="pt-24 px-4 pb-4 md:px-6 md:pb-6 bg-zinc-50">
      <section className="relative h-[800px] flex flex-col justify-start pt-32 items-center overflow-hidden rounded-[2.5rem] shadow-2xl">
        
        {/* Background Image with Parallax-like feel */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/rs6.avif"
            alt="Car Rental Budapest"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        </div>

        {/* Tech Pins / Bubbles */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute top-[20%] left-[10%] hidden lg:flex flex-col items-center gap-2 group cursor-pointer"
        >
           <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping" />
              <div className="w-3 h-3 bg-white rounded-full relative z-10" />
              <div className="h-12 w-px bg-gradient-to-b from-white to-transparent absolute top-3 left-1/2 -translate-x-1/2" />
           </div>
           <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl transform translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Car className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <div className="text-white font-bold text-sm">50+ Cars</div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider">Available Now</div>
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute top-[30%] right-[15%] hidden lg:flex flex-col items-center gap-2 group cursor-pointer"
        >
           <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping delay-300" />
              <div className="w-3 h-3 bg-white rounded-full relative z-10" />
              <div className="h-12 w-px bg-gradient-to-b from-white to-transparent absolute top-3 left-1/2 -translate-x-1/2" />
           </div>
           <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl transform translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Gauge className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <div className="text-white font-bold text-sm">20k+ km</div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider">Total Distance</div>
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="absolute bottom-[20%] left-[20%] hidden lg:flex flex-col items-center gap-2 group cursor-pointer"
        >
           <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping delay-700" />
              <div className="w-3 h-3 bg-white rounded-full relative z-10" />
              <div className="h-12 w-px bg-gradient-to-t from-white to-transparent absolute bottom-3 left-1/2 -translate-x-1/2" />
           </div>
           <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl transform -translate-y-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                 </div>
                 <div>
                    <div className="text-white font-bold text-sm">Budapest</div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider">Free Delivery</div>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Original Floating Elements (kept as requested or replaced? User said "pin them on random places". I'll keep the new pins primarily but maybe keep one floating element if it looks good. Actually the new pins are better. I'll remove the old ones to avoid clutter.) */}

        <div className="container mx-auto px-6 relative z-20 text-center h-full flex flex-col items-center">
            
            {/* Search Widget - Top Positioned */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full mb-12 md:mb-24"
            >
               <BookingEngine dictionary={dictionary} />
            </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-6 md:mb-8 drop-shadow-2xl text-center">
                RENT A CAR <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">BUDAPEST</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg text-center mb-12 md:mb-0">
              Unlock the city with our elite fleet. Seamless digital booking, delivered to your door.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
