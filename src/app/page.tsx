
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
import * as motion from "framer-motion/client"
import { Shield, Clock, Star, ArrowRight, Phone, Mail, MapPin } from "lucide-react"

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

  // Serialize complex objects for client component
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
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-500/30">
      {/* Navbar */}
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section */}
      <Hero dictionary={dictionary} />

      {/* Booking Engine - Floating */}
      <div className="container mx-auto px-6 relative z-30 -mt-24 lg:-mt-32 mb-24">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl">
          <BookingEngine dictionary={dictionary} />
        </div>
      </div>

      {/* Why Us Section - Seamless Transition */}
      <section id="about" className="py-24 relative overflow-hidden bg-white">
        {/* Background Elements - Fade from Hero */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-transparent to-white pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-zinc-900">
              WHY <span className="text-red-600">US?</span>
            </h2>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed">
              We redefine the car rental experience with premium service, transparent pricing, and a fleet that speaks for itself.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-red-600" />,
                title: "Premium Insurance",
                desc: "Full coverage for your peace of mind. Drive without worries."
              },
              {
                icon: <Clock className="w-8 h-8 text-red-600" />,
                title: "24/7 Concierge",
                desc: "We are here for you, anytime, anywhere. Roadside assistance included."
              },
              {
                icon: <Star className="w-8 h-8 text-red-600" />,
                title: "Top Condition",
                desc: "Our fleet is meticulously maintained and detailed before every rental."
              }
            ].map((item, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-red-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center border border-zinc-100 group-hover:border-red-100 group-hover:bg-red-50 transition-colors shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">{item.title}</h3>
                <p className="text-zinc-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section id="fleet" className="py-24 bg-zinc-50 relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-zinc-900">POPULAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">CARS</span></h2>
              <p className="text-zinc-500 text-lg">Choose from our most requested models.</p>
            </div>
            <Link href="/fleet">
              <Button variant="outline" className="border-zinc-200 text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all rounded-full px-8">
                VIEW ALL CARS <ArrowRight className="w-4 h-4 ml-2" />
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
              <Button variant="outline" className="w-full border-zinc-200 text-zinc-900">VIEW ALL CARS</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section id="contact" className="py-32 relative overflow-hidden bg-white text-zinc-900">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            READY TO <span className="text-red-600">DRIVE?</span>
          </h2>
          <p className="text-zinc-500 text-xl mb-12 max-w-2xl mx-auto font-light">
            Book your car in minutes or contact our premium support team for special requirements.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white rounded-full px-10 py-8 text-lg font-bold shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all">
              {t('call_us')}
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-200 text-zinc-900 bg-white hover:bg-zinc-50 hover:text-black rounded-full px-10 py-8 text-lg font-bold">
              {t('send_email')}
            </Button>
          </div>
        </div>
      </section>

      {/* Extreme Modern Footer */}
      <footer className="bg-zinc-50 py-20 border-t border-zinc-200">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
               <Logo variant="light" className="scale-125 origin-left mb-8" />
               <p className="text-zinc-500 max-w-sm leading-relaxed mb-8">
                 JustRent provides a seamless car rental experience in Budapest. 
                 Premium service, transparent pricing, and unforgettable journeys.
               </p>
               <div className="flex gap-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer shadow-sm">
                     <div className="w-4 h-4 bg-current rounded-full" />
                   </div>
                 ))}
               </div>
            </div>
            
            <div>
              <h4 className="font-bold text-zinc-900 mb-6 tracking-widest uppercase text-sm">Navigation</h4>
              <ul className="space-y-4 text-zinc-500">
                <li><Link href="/" className="hover:text-red-600 transition-colors">Home</Link></li>
                <li><Link href="/fleet" className="hover:text-red-600 transition-colors">Fleet</Link></li>
                <li><Link href="#contact" className="hover:text-red-600 transition-colors">Contact</Link></li>
                <li><Link href="/login" className="hover:text-red-600 transition-colors">Client Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-zinc-900 mb-6 tracking-widest uppercase text-sm">Contact</h4>
              <ul className="space-y-4 text-zinc-500">
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-red-600" /> Budapest, Hungary
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-red-600" /> +36 1 234 5678
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-red-600" /> hello@justrent.hu
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-sm">
             <div>© 2024 JustRent. All rights reserved.</div>
             <div className="flex gap-8">
                <Link href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-zinc-900 transition-colors">Terms of Service</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
