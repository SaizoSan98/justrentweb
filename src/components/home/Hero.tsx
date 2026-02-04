"use client"

import { motion } from "framer-motion"
import Image from "next/image"
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
    <section className="relative min-h-[90vh] flex items-center bg-zinc-50 overflow-hidden">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 pt-20 pb-20">
        
        {/* Left Content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
             <Image 
              src="/jrlogo.PNG" 
              alt="JustRent Logo" 
              width={400} 
              height={150} 
              className="h-24 md:h-32 w-auto object-contain mb-8"
              priority
            />
            <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight leading-[0.9] mb-6">
              RENT THE <br/>
              <span className="text-red-600">EXCEPTIONAL.</span>
            </h1>
            <p className="text-xl text-zinc-600 max-w-lg leading-relaxed">
              {t.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-2 rounded-2xl shadow-xl border border-zinc-100 max-w-xl"
          >
            <BookingEngine dictionary={dictionary} showLabel={true} compact={false} />
          </motion.div>
        </div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative h-[50vh] lg:h-[80vh] w-full"
        >
           <div className="absolute inset-0 bg-gradient-to-l from-transparent to-zinc-50/20 z-10" />
           <Image
             src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop"
             alt="Luxury Car"
             fill
             className="object-cover rounded-3xl shadow-2xl"
             priority
           />
        </motion.div>

      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-zinc-100 -skew-x-12 translate-x-1/4 -z-0" />
    </section>
  )
}
