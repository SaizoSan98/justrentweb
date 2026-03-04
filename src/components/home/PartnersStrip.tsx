"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface PartnersStripProps {
    dictionary?: any
}

export function PartnersStrip({ dictionary = {} }: PartnersStripProps) {
    const t = (key: string) => dictionary?.hero?.[key] || key;

    const partners = [
        { name: "DiscoverCars", src: "/discovercars.png", width: 220, height: 65 },
        { name: "CarJet", src: "/carjet.svg", width: 140, height: 50 },
        { name: "EconomyCarRentals", src: "/economycar.png", width: 240, height: 75 }
    ];

    return (
        <div className="w-full py-16 bg-zinc-50 border-y border-zinc-100/80 mt-16 md:mt-0 relative overflow-hidden">
            {/* Premium Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-10">
                    <p className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{t('our_partners')}</p>
                    <div className="w-12 h-0.5 bg-red-600 mx-auto rounded-full" />
                </div>

                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-80">
                    {partners.map((partner, i) => (
                        <div
                            key={`${partner.name}-${i}`}
                            className="relative grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-105 cursor-pointer filter mix-blend-multiply flex items-center justify-center shrink-0"
                            style={{ width: partner.width, height: partner.height }}
                        >
                            <Image
                                src={partner.src}
                                alt={`${partner.name} logo`}
                                fill
                                className="object-contain drop-shadow-sm"
                                sizes="(max-width: 768px) 150px, 250px"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
