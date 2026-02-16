"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Dictionary } from "@/lib/dictionary"
import { BookingEngine } from "@/components/booking/BookingEngine"
import { MapPin, Car, Gauge } from "lucide-react"

export function Hero({ dictionary, carCount }: { dictionary?: Dictionary; carCount?: number }) {
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
    <div className="md:pb-6 bg-zinc-50 relative">
      <section className="relative h-[80vh] md:h-[900px] flex flex-col justify-start pt-28 md:pt-48 items-center overflow-hidden rounded-b-[2.5rem] md:rounded-b-[3rem] shadow-2xl">
        
        {/* Background Image with Parallax-like feel */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/rs6.avif"
            alt="Car Rental Budapest"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60" />
        </div>

        {/* Tech Pins / Bubbles */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute top-[35%] left-[10%] hidden lg:flex flex-col items-center gap-2 group cursor-pointer z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
           <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-white/30 animate-ping" />
              <div className="w-4 h-4 bg-white rounded-full relative z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <div className="h-16 w-px bg-gradient-to-b from-white via-white/50 to-transparent absolute top-4 left-1/2 -translate-x-1/2" />
           </div>
           <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-4 rounded-2xl transform translate-y-4 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <Car className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <div className="text-white font-bold text-base">{carCount || 50}+ Cars</div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Available Now</div>
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute top-[45%] right-[15%] hidden lg:flex flex-col items-center gap-2 group cursor-pointer z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
           <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-white/30 animate-ping delay-300" />
              <div className="w-4 h-4 bg-white rounded-full relative z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <div className="h-16 w-px bg-gradient-to-b from-white via-white/50 to-transparent absolute top-4 left-1/2 -translate-x-1/2" />
           </div>
           <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-4 rounded-2xl transform translate-y-4 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <Gauge className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <div className="text-white font-bold text-base">20k+ km</div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Total Distance</div>
                 </div>
              </div>
           </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="absolute bottom-[25%] left-[20%] hidden lg:flex flex-col items-center gap-2 group cursor-pointer z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
           <div className="relative">
              <span className="absolute -inset-2 rounded-full bg-white/30 animate-ping delay-700" />
              <div className="w-4 h-4 bg-white rounded-full relative z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              <div className="h-16 w-px bg-gradient-to-t from-white via-white/50 to-transparent absolute bottom-4 left-1/2 -translate-x-1/2" />
           </div>
           <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-4 rounded-2xl transform -translate-y-24 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <MapPin className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <div className="text-white font-bold text-base">Budapest</div>
                    <div className="text-white/60 text-[10px] uppercase tracking-wider font-medium">Free Delivery</div>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Original Floating Elements (kept as requested or replaced? User said "pin them on random places". I'll keep the new pins primarily but maybe keep one floating element if it looks good. Actually the new pins are better. I'll remove the old ones to avoid clutter.) */}

        <div className="container mx-auto px-4 md:px-6 relative z-20 text-center h-full flex flex-col items-center">
            
            {/* Search Widget - Top Positioned */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full mb-8 md:mb-24"
            >
               <BookingEngine dictionary={dictionary} />
            </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="max-w-5xl mx-auto px-4"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-6 md:mb-8 drop-shadow-2xl text-center">
                JUST RENT <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">RENT A CAR</span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-white/90 max-w-xl mx-auto leading-relaxed font-medium drop-shadow-lg text-center mb-12 md:mb-0">
              Unlock the city with our elite fleet. Seamless digital booking, delivered to your door.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
