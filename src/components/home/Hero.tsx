"use client"

import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-900">
      {/* Background Image */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.7 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1736310305983-5efe64f5bb23?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      
      <div className="relative container mx-auto px-6 flex flex-col items-center text-center z-10 pt-20 pb-32">
        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg"
        >
          JUST <span className="text-red-600">RENT</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="text-xl md:text-2xl text-zinc-200 max-w-2xl mb-12 font-light leading-relaxed drop-shadow-md"
        >
          Experience the thrill of driving the world&#39;s finest automobiles.
          Seamless booking, exceptional service.
        </motion.p>
      </div>
    </section>
  )
}
