"use client"

import Image from "next/image"

interface PartnersStripProps {
    dictionary?: any
}

export function PartnersStrip({ dictionary = {} }: PartnersStripProps) {
    const t = (key: string) => dictionary?.hero?.[key] || key;

    const partners = [
        { name: "DiscoverCars", src: "/discovercars.png", width: 180, height: 50 },
        { name: "CarFlexi", src: "/carflexi.png", width: 150, height: 45 },
        { name: "Localrent", src: "/localrent.svg", width: 160, height: 45 },
        { name: "EconomyBookings", src: "/economybookings.jpeg", width: 170, height: 50 },
    ];

    return (
        <div className="w-full py-10 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-8">
                    <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-[0.25em]">{t('our_partners')}</p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 lg:gap-20">
                    {partners.map((partner, i) => (
                        <div
                            key={`${partner.name}-${i}`}
                            className="relative grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-105 cursor-pointer flex items-center justify-center shrink-0"
                            style={{ width: partner.width, height: partner.height }}
                        >
                            <Image
                                src={partner.src}
                                alt={`${partner.name} logo`}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 120px, 200px"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
