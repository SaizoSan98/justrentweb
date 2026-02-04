
"use client"

import * as React from "react"
import { getAvailableCarCount } from "@/app/actions/cars"
import { cn } from "@/lib/utils"

interface VehicleCounterProps {
  initialCount: number
  className?: string
}

import Image from "next/image"

export function VehicleCounter({ initialCount, className }: VehicleCounterProps) {
  const [count, setCount] = React.useState(initialCount)

  React.useEffect(() => {
    // Update every minute (60000 ms)
    const interval = setInterval(async () => {
      const newCount = await getAvailableCarCount()
      setCount(newCount)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-black text-white p-8 h-full flex flex-col justify-end group", className)}>
       <Image 
         src="/audi2.jpeg" 
         alt="Vehicle Counter Background" 
         fill 
         sizes="(max-width: 768px) 100vw, 50vw"
         className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
       />
       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
       
       <div className="relative z-10">
          <h3 className="text-lg font-medium text-zinc-300 mb-1">Vehicle Available</h3>
          <div className="text-5xl font-bold tracking-tight">
            {count.toLocaleString()}
          </div>
       </div>
    </div>
  )
}
