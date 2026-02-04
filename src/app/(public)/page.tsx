
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { FeaturedCars } from "@/components/home/FeaturedCars"
import { getSession } from "@/lib/auth"
import { Hero } from "@/components/home/Hero"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { ArrowRight, Shield, Globe, Zap, Heart } from "lucide-react"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const session = await getSession()
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

  const featuredCars = await prisma.car.findMany({
    where: { 
      status: 'AVAILABLE',
      isFeatured: true
    } as any,
    take: 4, // Screenshot shows 4 cars grid
    orderBy: { createdAt: 'desc' },
    include: { pricingTiers: true, categories: true }
  })

  const serializedFeaturedCars = featuredCars.map((car: any) => ({
    ...car,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    pricingTiers: car.pricingTiers.map((tier: any) => ({
      ...tier,
      pricePerDay: Number(tier.pricePerDay),
      deposit: Number(tier.deposit)
    }))
  }))

  const t = (key: string, section: string = "hero") => (dictionary as any)?.[section]?.[key] || key

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section - Full Width Image */}
      <div className="relative w-full h-[600px] md:h-[700px] bg-zinc-900">
        <Image 
          src="/budapest.jpg" 
          alt="Hero" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-end pb-32">
           <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 max-w-2xl leading-tight">
             Rent a Car for Every Journey
           </h1>
        </div>

        {/* Search Widget - Overlapping */}
        <div className="absolute -bottom-24 md:-bottom-16 left-0 right-0 z-20 px-4 md:px-6">
           <div className="container mx-auto">
              <BookingEngine dictionary={dictionary} />
           </div>
        </div>
      </div>

      {/* Spacer for Search Widget */}
      <div className="h-32 md:h-24 bg-white" />

      {/* Top Picks Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <FeaturedCars cars={serializedFeaturedCars} />
          
          <div className="mt-12 text-center">
             <Button variant="outline" size="lg" className="rounded-full px-8 border-zinc-200 text-zinc-900 hover:bg-zinc-50" asChild>
                <Link href="/fleet">See All <ArrowRight className="w-4 h-4 ml-2" /></Link>
             </Button>
          </div>
        </div>
      </section>

      {/* Popular Locations / Categories */}
      <section className="py-12 bg-zinc-50/50">
         <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Discover popular car rental in worldwide</h2>
            <p className="text-zinc-500 mb-8">Explore a diverse and extensive range of rental cars.</p>
            
            <div className="flex flex-wrap gap-3">
               {["Car Rental in Budapest", "Car Rental in Debrecen", "Car Rental in Vienna", "Car Rental in Prague", "Car Rental in Munich", "Car Rental in Zagreb", "Car Rental in Bratislava", "Car Rental in Warsaw"].map((loc) => (
                  <Button key={loc} variant="outline" className="rounded-full bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900">
                     {loc}
                  </Button>
               ))}
            </div>
         </div>
      </section>

      {/* Promo Section */}
      <section className="py-20 bg-white">
         <div className="container mx-auto px-6">
            <div className="flex justify-between items-end mb-8">
               <h2 className="text-2xl font-bold text-zinc-900">Enjoy extra miles with our best deal</h2>
               <Link href="/fleet" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 flex items-center">
                  See All <ArrowRight className="w-4 h-4 ml-2" />
               </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               {/* Promo Card 1 */}
               <div className="relative h-[300px] rounded-3xl overflow-hidden group">
                  <Image src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop" alt="Promo" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center text-white max-w-md">
                     <span className="text-yellow-400 font-bold mb-2">Valid until Dec 31</span>
                     <h3 className="text-3xl font-bold mb-4">Experience the Holidays with Our Festive Promotions</h3>
                     <div className="text-5xl font-black mb-6">40% <span className="text-lg font-medium align-top">OFF</span></div>
                     <p className="text-white/60 text-xs">*with Terms and Condition</p>
                  </div>
               </div>

               {/* Promo Card 2 */}
               <div className="relative h-[300px] rounded-3xl overflow-hidden group">
                  <Image src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop" alt="Promo" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center text-white max-w-md">
                     <span className="text-yellow-400 font-bold mb-2">Valid only on Weekdays</span>
                     <h3 className="text-3xl font-bold mb-4">Unlock Online-Only Discounts for a Seamless Booking Experience</h3>
                     <div className="text-5xl font-black mb-6">65% <span className="text-lg font-medium align-top">OFF</span></div>
                     <p className="text-white/60 text-xs">*with Terms and Condition</p>
                  </div>
               </div>
            </div>

            {/* Logos */}
            <div className="mt-16 flex flex-wrap justify-center gap-12 opacity-30 grayscale">
               {/* Simple text placeholders for logos as per design */}
               <span className="text-2xl font-black">HELLOSIGN</span>
               <span className="text-2xl font-black">DOORDASH</span>
               <span className="text-2xl font-black">coinbase</span>
               <span className="text-2xl font-black">Airtable</span>
               <span className="text-2xl font-black">pendo</span>
               <span className="text-2xl font-black">treehouse</span>
            </div>
         </div>
      </section>

      {/* Bottom Features */}
      <section className="py-4 bg-white pb-20">
         <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-6">
               <div className="relative h-[400px] rounded-3xl overflow-hidden bg-zinc-900 text-white p-10 flex flex-col justify-end">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
                   <div className="relative z-10">
                      <Globe className="w-10 h-10 mb-6 text-white" />
                      <h3 className="text-3xl font-bold mb-4">Explore more to get your comfort zone</h3>
                      <p className="text-zinc-300 mb-8">Book your perfect stay with us.</p>
                      <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 font-bold">Booking Now <ArrowRight className="w-4 h-4 ml-2" /></Button>
                   </div>
               </div>
               
               <div className="relative h-[400px] rounded-3xl overflow-hidden bg-zinc-900 text-white p-10 flex flex-col justify-end">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60" />
                   <div className="relative z-10 text-center">
                      <h3 className="text-3xl font-bold mb-2">Beyond accommodation, creating</h3>
                      <p className="text-xl">memories of a lifetime</p>
                   </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer is handled by layout, but we can add the specific footer style here if needed or modify the global footer */}
      <footer className="bg-black text-white py-20">
         <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
               <div className="col-span-1">
                  <h3 className="text-2xl font-bold mb-6">Horizone</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                     Our mission is to equip modern explorers with cutting-edge, functional, and stylish bags that elevate every adventure.
                  </p>
               </div>
               <div>
                  <h4 className="font-bold mb-6">About</h4>
                  <ul className="space-y-4 text-sm text-zinc-400">
                     <li>About Us</li>
                     <li>Blog</li>
                     <li>Career</li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold mb-6">Support</h4>
                  <ul className="space-y-4 text-sm text-zinc-400">
                     <li>Contact Us</li>
                     <li>Return</li>
                     <li>FAQ</li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold mb-6">Get Updates</h4>
                  <div className="flex gap-2 bg-zinc-900 p-2 rounded-full">
                     <input type="email" placeholder="Enter your email" className="bg-transparent border-0 focus:ring-0 text-sm text-white px-4 w-full" />
                     <Button className="rounded-full bg-white text-black hover:bg-zinc-200">Subscribe</Button>
                  </div>
               </div>
            </div>
            <div className="border-t border-zinc-800 mt-16 pt-8 flex justify-between text-xs text-zinc-500">
               <p>©2024 Horizone. All rights reserved.</p>
               <div className="flex gap-6">
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
