"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Dictionary } from "@/lib/dictionary"

const BG_TEXT = "JUST RENT • RENT A CAR • BUDAPEST • FAIR PRICES • AIRPORT PICK UP • AIRPORT DROP OFF • NEW CARS • "

function MarqueeRow({ index }: { index: number }) {
  return (
    <motion.div 
      className="flex whitespace-nowrap text-7xl font-black text-zinc-700 uppercase tracking-tighter"
      initial={{ x: "-50%" }}
      animate={{ x: "0%" }}
      transition={{ 
        duration: 30, 
        repeat: Infinity, 
        ease: "linear",
        delay: -index * 2 // Offset to make it look less uniform if desired, or keep 0 for synced
      }}
    >
      {[...Array(8)].map((_, i) => (
        <span key={i} className="mx-4">{BG_TEXT}</span>
      ))}
    </motion.div>
  )
}

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
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Animated Text Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-[-100%] rotate-[-15deg] flex flex-col gap-4 justify-center items-center opacity-20 select-none">
          {[...Array(20)].map((_, i) => (
            <MarqueeRow key={i} index={i} />
          ))}
        </div>
      </div>
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
      
      <div className="relative container mx-auto px-6 flex flex-col items-center text-center z-10 pt-20 pb-32">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mb-6 drop-shadow-lg"
        >
           <Image 
            src="/jrlogo.PNG" 
            alt="JustRent Logo" 
            width={600} 
            height={225} 
            className="h-40 md:h-64 w-auto object-contain brightness-0 invert"
            priority
          />
        </motion.div>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="text-xl md:text-2xl text-zinc-200 max-w-2xl mb-12 font-light leading-relaxed drop-shadow-md"
        >
          {t.subtitle}
        </motion.p>
      </div>
    </section>
  )
}
