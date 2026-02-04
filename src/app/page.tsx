
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
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans selection:bg-black selection:text-white">
      {/* Navbar - Now floating inside/above the hero via CSS */}
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section - The Card */}
      <Hero dictionary={dictionary} />

      {/* Floating Booking Engine - Bridging Hero & Content */}
      <div className="container mx-auto px-6 relative z-30 -mt-24 mb-32">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-1 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]">
          <div className="bg-white rounded-[2rem] p-6 border border-zinc-100/50">
             <BookingEngine dictionary={dictionary} />
          </div>
        </div>
      </div>

      {/* Why Us - Floating Card */}
      <div className="px-4 pb-4 md:px-6 md:pb-6">
        <section className="py-32 bg-white rounded-[2.5rem] shadow-xl">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Values</span>
              <h2 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-6">WHY CHOOSE US?</h2>
              <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed">
                We don't just rent cars. We provide a seamless mobility experience tailored to your needs, with transparent terms and premium service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
              {/* Left Column: Stacked Cards */}
              <div className="flex flex-col gap-8 justify-center">
                <div className="group relative p-8 rounded-[2rem] bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-xl transition-all duration-500 overflow-hidden text-left">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 max-w-[80%] leading-none">
                      INSTANT <br/> CAR SEARCH
                    </h3>
                    <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-zinc-900 -rotate-45 transition-colors" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-wide max-w-xs">
                    Find your perfect ride with just a few clicks
                  </p>
                </div>

                <div className="group relative p-8 rounded-[2rem] bg-black text-white border border-zinc-900 hover:shadow-2xl transition-all duration-500 overflow-hidden text-left">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white max-w-[80%] leading-none">
                      VERIFIED <br/> PRO LISTINGS
                    </h3>
                    <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-white -rotate-45 transition-colors" />
                  </div>
                  <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide max-w-xs">
                    100% verified and updated vehicle details
                  </p>
                </div>

                <div className="group relative p-8 rounded-[2rem] bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-xl transition-all duration-500 overflow-hidden text-left">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 max-w-[80%] leading-none">
                      SMART <br/> RENTAL INSIGHTS
                    </h3>
                    <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-zinc-900 -rotate-45 transition-colors" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-wide max-w-xs">
                    Personalized recommendations for your journey
                  </p>
                </div>
                
                <div className="group relative p-8 rounded-[2rem] bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-xl transition-all duration-500 overflow-hidden text-left">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900 max-w-[80%] leading-none">
                      REAL TIME <br/> FLEET UPDATES
                    </h3>
                    <ArrowRight className="w-6 h-6 text-zinc-300 group-hover:text-zinc-900 -rotate-45 transition-colors" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium uppercase tracking-wide max-w-xs">
                    Get instant alerts on new arrivals and price drops
                  </p>
                </div>
              </div>

              {/* Right Column: Large Image Card */}
              <div className="relative rounded-[2.5rem] overflow-hidden min-h-[500px] group shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-10 text-white">
                   <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Premium <br/> Experience</h3>
                   <p className="text-white/80 max-w-sm">Discover a new level of luxury with our exclusive fleet of high-end vehicles.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fleet Section - Floating Card */}
      <div className="px-4 pb-4 md:px-6 md:pb-6">
        <section className="py-32 bg-white rounded-[2.5rem] shadow-xl">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20">
              <div className="max-w-xl">
                <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">Popular Cars</span>
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
      </div>

      {/* CTA - Floating Card */}
      <div className="px-4 pb-4 md:px-6 md:pb-6">
        <section className="py-40 bg-black text-white relative overflow-hidden rounded-[2.5rem] shadow-2xl">
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
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full h-14 px-8 text-lg font-bold" asChild>
                <Link href="/fleet">Book Your Car Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full h-14 px-8 text-lg" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer moved to layout */}
    </div>
  );
}
