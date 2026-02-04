
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { FleetCard } from "@/components/fleet/FleetCard"
import { getSession } from "@/lib/auth"
import { Hero } from "@/components/home/Hero"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { Logo } from "@/components/ui/logo"
import { Shield, Clock, Star, ArrowRight, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react"

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
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { pricingTiers: true }
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
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section */}
      <Hero dictionary={dictionary} />

      {/* Floating Booking Engine - Bridging Hero & Content */}
      <div className="container mx-auto px-6 relative z-30 -mt-32 mb-32">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-1 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
          <div className="bg-white rounded-[2rem] p-6 border border-zinc-100/50">
             <BookingEngine dictionary={dictionary} />
          </div>
        </div>
      </div>

      {/* Why Us - Clean Minimalist Grid */}
      <section className="pb-32 container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {[
            {
              title: "Transparent Pricing",
              desc: "No hidden fees. What you see is what you pay. Full insurance included options available.",
              icon: <Shield className="w-6 h-6" />
            },
            {
              title: "Instant Booking",
              desc: "Book your car in less than 2 minutes. Digital contract signing and quick pickup.",
              icon: <Clock className="w-6 h-6" />
            },
            {
              title: "Premium Fleet",
              desc: "From compact city cars to luxury sedans. All vehicles are under 2 years old.",
              icon: <Star className="w-6 h-6" />
            }
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-900 tracking-tight">{item.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-lg">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fleet Section - Wide & Immersive */}
      <section className="py-32 bg-zinc-50/50 border-t border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div className="max-w-xl">
              <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Collection</span>
              <h2 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter leading-[0.9]">
                DRIVE <br/> THE BEST.
              </h2>
            </div>
            <Link href="/fleet" className="hidden md:block">
              <Button variant="ghost" className="text-lg hover:bg-transparent hover:text-red-600 p-0 flex items-center gap-4 group">
                View Full Fleet 
                <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serializedFeaturedCars.map((car: any) => (
              <FleetCard key={car.id} car={car} redirectToFleet={true} dictionary={dictionary} variant="light" />
            ))}
          </div>

          <div className="mt-16 text-center md:hidden">
            <Link href="/fleet">
              <Button size="lg" className="w-full bg-black text-white rounded-full">View Full Fleet</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA - Big Typography */}
      <section className="py-40 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/budapest.jpg')] bg-cover bg-fixed opacity-20 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-[12vw] leading-none font-black tracking-tighter opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none">
            JUSTRENT
          </h2>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight relative">
            Ready to start your journey?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Experience Budapest with the ultimate freedom. Premium service, 24/7 support, and unforgettable memories await.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full h-14 px-8 text-lg font-bold">
              Book Your Car Now
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full h-14 px-8 text-lg">
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
            <div className="max-w-sm">
              <Logo variant="light" className="scale-125 origin-left mb-8" />
              <p className="text-zinc-500 text-lg leading-relaxed">
                Redefining car rental in Budapest. Simple, transparent, and premium.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12 md:gap-24">
              <div>
                <h4 className="font-bold text-black mb-6">Explore</h4>
                <ul className="space-y-4 text-zinc-500">
                  <li><Link href="/fleet" className="hover:text-black transition-colors">Our Fleet</Link></li>
                  <li><Link href="/about" className="hover:text-black transition-colors">About Us</Link></li>
                  <li><Link href="/locations" className="hover:text-black transition-colors">Locations</Link></li>
                  <li><Link href="/blog" className="hover:text-black transition-colors">Journal</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-black mb-6">Support</h4>
                <ul className="space-y-4 text-zinc-500">
                  <li><Link href="/help" className="hover:text-black transition-colors">Help Center</Link></li>
                  <li><Link href="/terms" className="hover:text-black transition-colors">Terms & Conditions</Link></li>
                  <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/contact" className="hover:text-black transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-100 gap-6">
            <p className="text-zinc-400 text-sm">© 2024 JustRent Budapest. All rights reserved.</p>
            <div className="flex gap-6">
               {/* Social Icons Placeholder */}
               <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all cursor-pointer">
                 <ArrowRight className="w-4 h-4 -rotate-45" />
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
