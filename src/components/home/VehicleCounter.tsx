
"use client"

import * as React from "react"
import { getAvailableCarCount } from "@/app/actions/cars"
import { cn } from "@/lib/utils"

interface VehicleCounterProps {
  initialCount: number
  className?: string
}

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
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571221791244-6720d23c2805?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-60 transition-transform duration-700 group-hover:scale-105" />
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
