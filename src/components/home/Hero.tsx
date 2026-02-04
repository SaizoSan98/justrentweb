"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Dictionary } from "@/lib/dictionary"

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
    <section className="relative h-[90vh] min-h-[800px] flex flex-col justify-center items-center overflow-hidden">
      
      {/* Background Image with Parallax-like feel */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/budapest.jpg"
          alt="Car Rental Budapest"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
        
        {/* Bottom Fade to White - Crucial for seamless transition */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-20 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-white/90 text-xs font-bold tracking-widest uppercase">Premium Car Rental Service</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl">
            RENT A CAR <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">BUDAPEST</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg">
            Discover the city with freedom. No hidden fees, just pure driving pleasure.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
