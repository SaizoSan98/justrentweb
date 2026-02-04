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
import NextImage from "next/image"

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
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans">
      {/* Navbar */}
      <Header transparent={true} user={session?.user} dictionary={dictionary} lang={lang} />

      {/* Hero Section */}
      <Hero dictionary={dictionary} />

      {/* Booking Engine */}
      <div className="container mx-auto px-6">
        <BookingEngine className="-mt-48" dictionary={dictionary} />
      </div>

      {/* About Section */}
      <section id="about" className="pt-32 pb-24 bg-white">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900">{t('why_choose')}</h2>
            <p className="text-zinc-600 text-lg leading-relaxed mb-8">
              {t('why_choose_subtitle')}
            </p>
            <ul className="space-y-6">
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">{t('concierge')}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{t('concierge_desc')}</p>
                 </div>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">{t('insurance')}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{t('insurance_desc')}</p>
                 </div>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">{t('airport')}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{t('airport_desc')}</p>
                 </div>
               </li>
            </ul>
          </div>
          <div className="relative h-[500px] bg-zinc-100 rounded-2xl overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center"></div>
          </div>
        </div>
      </section>

      {/* Featured Fleet Section */}
      <section id="fleet" className="py-24 bg-zinc-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">{t('premium_fleet')}</h2>
              <p className="text-zinc-600">{t('premium_fleet_subtitle')}</p>
            </div>
            <Link href="/fleet">
              <Button variant="outline" className="hidden md:flex">{t('view_all')}</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serializedFeaturedCars.map((car: any) => (
              <FleetCard key={car.id} car={car} redirectToFleet={true} dictionary={dictionary} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/fleet">
              <Button variant="outline" className="w-full">{t('view_all')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-zinc-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('ready_title')}</h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
            {t('ready_subtitle')}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
              {t('call_us')}
            </Button>
            <Button size="lg" variant="outline" className="text-white border-zinc-700 bg-transparent hover:bg-zinc-800 hover:text-white">
              {t('send_email')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-zinc-900 text-sm text-zinc-500">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <NextImage 
               src="/jrlogo.PNG" 
               alt="JustRent Logo" 
               width={140} 
               height={50} 
               className="h-10 w-auto object-contain brightness-0 invert" 
             />
             <span className="ml-2">© 2024</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">{t('privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('cookies')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
