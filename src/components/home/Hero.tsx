"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Logo } from "@/components/ui/logo"
import { Dictionary } from "@/lib/dictionary"
import { BookingEngine } from "@/components/booking/BookingEngine"

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
    <section className="relative min-h-screen flex flex-col justify-end pb-32 overflow-hidden bg-zinc-950">
      
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2940&auto=format&fit=crop"
          alt="Premium Car Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-end">
        
        {/* Left Content */}
        <div className="space-y-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6 flex items-center gap-3">
               <div className="h-[1px] w-12 bg-red-600"></div>
               <span className="text-red-500 font-bold tracking-widest uppercase text-sm">Premium Car Rental</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
              DRIVE THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">EXTRAORDINARY.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-300 max-w-lg leading-relaxed font-light border-l-2 border-zinc-800 pl-6">
              {t.subtitle}
            </p>
          </motion.div>
        </div>

        {/* Right Content - Booking Engine - REMOVED AS PER REQUEST
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span className="bg-red-600 w-2 h-2 rounded-full block"></span>
              Find your perfect ride
            </h3>
            <BookingEngine dictionary={dictionary} showLabel={true} compact={false} />
          </div>
        </motion.div>
        */}

      </div>
    </section>
  )
}
