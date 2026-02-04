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
    <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-zinc-950">
      
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
        <Image
          src="/budapest1.jpg"
          alt="Car Rental Budapest"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto px-6 relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6 flex items-center justify-center gap-3">
             <div className="h-[1px] w-12 bg-red-600"></div>
             <span className="text-red-500 font-bold tracking-widest uppercase text-sm">BOOK NOW</span>
             <div className="h-[1px] w-12 bg-red-600"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-8">
            RENT A CAR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">BUDAPEST</span>
          </h1>
        </motion.div>
      </div>
    </section>
  )
}
