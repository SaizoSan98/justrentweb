import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { FleetCard } from "@/components/fleet/FleetCard"
import { getSession } from "@/lib/auth"
import { Hero } from "@/components/home/Hero"

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const session = await getSession()
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans">
      {/* Navbar */}
      <Header transparent={true} user={session?.user} />

      {/* Hero Section */}
      <Hero />

      {/* Booking Engine */}
      <BookingEngine className="-mt-48" />

      {/* About Section */}
      <section id="about" className="pt-32 pb-24 bg-white">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900">Why Choose JustRent?</h2>
            <p className="text-zinc-600 text-lg leading-relaxed mb-8">
              Founded with a passion for excellence, JustRent offers a curated selection of 
              premium vehicles for those who demand more from their journey. Whether it&#39;s 
              a business trip or a weekend getaway, our fleet is meticulously maintained 
              to ensure safety, comfort, and style.
            </p>
            <ul className="space-y-6">
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">24/7 Concierge Service</h3>
                    <p className="text-zinc-500 text-sm mt-1">We are here for you anytime, anywhere.</p>
                 </div>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">Premium Insurance Included</h3>
                    <p className="text-zinc-500 text-sm mt-1">Drive with peace of mind with our comprehensive coverage.</p>
                 </div>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">Door-to-door Delivery</h3>
                    <p className="text-zinc-500 text-sm mt-1">We bring your car directly to your doorstep.</p>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900">Our Premium Fleet</h2>
              <p className="text-zinc-600">Choose from our exclusive collection of high-end vehicles.</p>
            </div>
            <Link href="/fleet">
              <Button variant="outline" className="hidden md:flex">View All Cars</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serializedFeaturedCars.map((car: any) => (
              <FleetCard key={car.id} car={car} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/fleet">
              <Button variant="outline" className="w-full">View All Cars</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-zinc-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Excellence?</h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
            Contact our concierge team to arrange your booking or discuss your specific requirements.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
              Call Us Now
            </Button>
            <Button size="lg" variant="outline" className="text-white border-zinc-700 bg-transparent hover:bg-zinc-800 hover:text-white">
              Send an Email
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-zinc-900 text-sm text-zinc-500">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <span className="text-zinc-100 font-bold uppercase tracking-wider">Just<span className="text-red-600">Rent</span></span>
             <span>© 2024</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
