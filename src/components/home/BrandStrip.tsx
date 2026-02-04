
import * as React from "react"

export function BrandStrip() {
  const brands = [
    "Skoda", "BMW", "Audi", "Seat", "Mercedes", "Mini", "KIA", "Hyundai", "CUPRA"
  ]

  return (
    <div className="w-full py-12 bg-white border-b border-zinc-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
           {brands.map((brand) => (
             <span key={brand} className="text-2xl font-black text-zinc-900 uppercase tracking-tighter hover:text-black hover:scale-110 transition-transform cursor-default">
               {brand}
             </span>
           ))}
        </div>
      </div>
    </div>
  )
}
