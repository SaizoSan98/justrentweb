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
    <div className="pt-24 px-4 pb-4 md:px-6 md:pb-6 bg-zinc-50">
      <section className="relative h-[85vh] min-h-[700px] flex flex-col justify-center items-center overflow-hidden rounded-[2.5rem] shadow-2xl">
        
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/40" />
        </div>

        {/* Floating Glassmorphic Elements (Decorations) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute top-32 left-10 md:left-20 hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20"
        >
          <div className="flex -space-x-3">
             {[1,2,3].map(i => (
               <div key={i} className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white flex items-center justify-center text-xs font-bold text-zinc-600">
                 U{i}
               </div>
             ))}
          </div>
          <div className="text-white text-sm font-medium pr-2">
            <span className="block font-bold">20k+</span>
            Happy Clients
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="absolute bottom-32 right-10 md:right-20 hidden lg:flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20"
        >
          <div className="text-white text-right">
            <span className="block font-bold text-lg">4.9/5</span>
            <span className="text-sm text-white/80">Customer Rating</span>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-500">
             ★
          </div>
        </motion.div>

        <div className="container mx-auto px-6 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
               <span className="text-white/90 text-xs font-bold tracking-widest uppercase">Available Now in Budapest</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl">
              RENT A CAR <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">PREMIUM</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg">
              Unlock the city with our elite fleet. Seamless digital booking, delivered to your door.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
