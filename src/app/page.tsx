
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

      {/* Why Us - Animated & Rich */}
      <section className="py-32 container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Values</span>
          <h2 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-6">WHY CHOOSE US?</h2>
          <p className="text-xl text-zinc-500 max-w-3xl mx-auto leading-relaxed">
            We don't just rent cars. We provide a seamless mobility experience tailored to your needs, with transparent terms and premium service.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {[
            {
              title: "Transparent Pricing",
              desc: "No hidden fees, no surprises. Our pricing model is straightforward: what you see is what you pay. We offer comprehensive insurance packages so you can drive with zero worries.",
              icon: <Shield className="w-8 h-8 text-white" />,
              color: "bg-blue-600"
            },
            {
              title: "Instant Digital Booking",
              desc: "Forget paperwork. Our fully digital booking process takes less than 2 minutes. Sign contracts on your phone, pick up your car, and go. Efficiency at its finest.",
              icon: <Clock className="w-8 h-8 text-white" />,
              color: "bg-red-600"
            },
            {
              title: "Premium Fleet Guarantee",
              desc: "We strictly maintain a fleet of vehicles under 2 years old. From compact city cruisers to executive sedans, every car is detailed and inspected before you turn the key.",
              icon: <Star className="w-8 h-8 text-white" />,
              color: "bg-black"
            }
          ].map((item, i) => (
            <div key={i} className="group relative p-8 rounded-[2.5rem] bg-zinc-50 hover:bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-zinc-900 tracking-tight">{item.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-lg mb-8">
                {item.desc}
              </p>
              <div className="w-12 h-1 bg-zinc-200 group-hover:w-full group-hover:bg-current transition-all duration-500 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Fleet Section - Wide & Immersive */}
      <section className="py-32 bg-zinc-50/50 border-t border-zinc-100">
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

      {/* Robust Modern Footer */}
      <footer className="bg-zinc-950 text-white pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
            
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-8">
              <Logo variant="dark" className="scale-125 origin-left" />
              <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                Experience the freedom of Budapest with our premium car rental service. Transparent pricing, instant booking, and a fleet that defines excellence.
              </p>
              <div className="flex gap-4">
                {['Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                  <div key={social} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer group">
                    <span className="sr-only">{social}</span>
                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:text-white text-zinc-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-2 space-y-6">
              <h4 className="font-bold text-white text-lg">Explore</h4>
              <ul className="space-y-4 text-zinc-400">
                <li><Link href="/fleet" className="hover:text-red-500 transition-colors">Popular Cars</Link></li>
                <li><Link href="/about" className="hover:text-red-500 transition-colors">Why Choose Us</Link></li>
                <li><Link href="/locations" className="hover:text-red-500 transition-colors">Locations</Link></li>
                <li><Link href="/blog" className="hover:text-red-500 transition-colors">Travel Blog</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <h4 className="font-bold text-white text-lg">Support</h4>
              <ul className="space-y-4 text-zinc-400">
                <li><Link href="/help" className="hover:text-red-500 transition-colors">Help Center</Link></li>
                <li><Link href="/terms" className="hover:text-red-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-red-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/contact" className="hover:text-red-500 transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="lg:col-span-4 space-y-6">
              <h4 className="font-bold text-white text-lg">Visit Us</h4>
              <ul className="space-y-6 text-zinc-400">
                <li className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                  <span>Budapest Liszt Ferenc Airport<br/>Terminal 2B, Arrivals Level</span>
                </li>
                <li className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-red-600 shrink-0" />
                  <a href="tel:+3612345678" className="hover:text-white transition-colors">+36 1 234 5678</a>
                </li>
                <li className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-red-600 shrink-0" />
                  <a href="mailto:hello@justrent.hu" className="hover:text-white transition-colors">hello@justrent.hu</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
            <p className="text-zinc-500 text-sm">© 2024 JustRent Budapest. All rights reserved.</p>
            <div className="flex gap-8 text-sm text-zinc-500">
               <span>Made with ❤️ in Budapest</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
