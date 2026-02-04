"use client"

import * as React from "react"
import Image from "next/image"

export function BrandStrip() {
  const brands = [
    { name: "Skoda", slug: "skoda" },
    { name: "BMW", slug: "bmw" },
    { name: "Audi", slug: "audi" },
    { name: "Seat", slug: "seat" },
    { name: "Mercedes", slug: "mercedes" },
    { name: "Mini", slug: "mini" },
    { name: "KIA", slug: "kia" },
    { name: "Hyundai", slug: "hyundai" },
    { name: "CUPRA", slug: "cupra" } // Cupra might not be in simple icons, checking fallbacks
  ]

  return (
    <div className="w-full py-8 bg-white border-b border-zinc-100 overflow-hidden">
      <div className="relative w-full">
        <div className="flex w-[200%] animate-marquee items-center gap-16">
          {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
            <div key={`${brand.name}-${i}`} className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 shrink-0">
               <div className="w-8 h-8 relative">
                 <Image 
                    src={`https://cdn.simpleicons.org/${brand.slug}/000000`} 
                    alt={brand.name}
                    fill
                    className="object-contain"
                    unoptimized
                 />
               </div>
               <span className="text-lg font-black text-zinc-900 uppercase tracking-tighter hidden md:block">
                 {brand.name}
               </span>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  )
}
