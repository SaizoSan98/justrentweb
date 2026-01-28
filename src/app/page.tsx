import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { Header } from "@/components/layout/Header";
import { prisma } from "@/lib/prisma";
import { FleetCard } from "@/components/fleet/FleetCard"

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
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
      <Header transparent={true} />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-zinc-900">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1736310305983-5efe64f5bb23?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-70"></div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        
        <div className="relative container mx-auto px-6 flex flex-col items-center text-center z-10 pt-20 pb-32">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg">
            JUST <span className="text-red-600">RENT</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-200 max-w-2xl mb-12 font-light leading-relaxed drop-shadow-md">
            Experience the thrill of driving the world&#39;s finest automobiles.
            Seamless booking, exceptional service.
          </p>
        </div>
      </section>

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
             <img 
               src="https://images.unsplash.com/photo-1550355291-6438b9008f31?q=80&w=2574&auto=format&fit=crop" 
               alt="Luxury Car Interior" 
               className="absolute inset-0 w-full h-full object-cover"
             />
          </div>
        </div>
      </section>

      {/* Fleet Teaser */}
      <section id="fleet" className="py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-red-600 font-bold uppercase tracking-wider text-sm mb-2 block">Our Collection</span>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">Featured Vehicles</h2>
            </div>
            <Link href="/fleet" className="text-zinc-900 hover:text-red-600 font-medium hidden md:flex items-center gap-2 transition-colors">
              View All Cars <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serializedFeaturedCars.map((car: any) => (
              <div key={car.id} className="h-full">
                <FleetCard 
                  car={car}
                  diffDays={1} // Default to 1 day for display
                  imageUrl={car.imageUrl}
                />
              </div>
            ))}
          </div>
          
           <div className="mt-8 text-center md:hidden">
            <Link href="/fleet" className="text-red-600 font-bold">
              View All Cars &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-300 py-16">
        <div className="container mx-auto px-6 text-center md:text-left">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
             <div>
               <h3 className="text-2xl font-bold text-white mb-6">JustRent</h3>
               <p className="text-zinc-400 text-sm leading-relaxed">
                 Premium car rental service for the modern traveler. 
                 Experience the difference with our top-tier fleet and exceptional service.
               </p>
             </div>
             <div>
               <h4 className="font-bold text-white mb-6">Quick Links</h4>
               <ul className="space-y-3 text-sm text-zinc-400">
                 <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                 <li><Link href="/fleet" className="hover:text-white transition-colors">Our Fleet</Link></li>
                 <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
                 <li><Link href="#services" className="hover:text-white transition-colors">Services</Link></li>
               </ul>
             </div>
             <div>
               <h4 className="font-bold text-white mb-6">Legal</h4>
               <ul className="space-y-3 text-sm text-zinc-400">
                 <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                 <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                 <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
               </ul>
             </div>
             <div>
               <h4 className="font-bold text-white mb-6">Contact Us</h4>
               <p className="text-sm text-zinc-400 leading-relaxed">
                 hello@justrent.com<br/>
                 +36 1 234 5678<br/>
                 Budapest Airport, Terminal 2B
               </p>
             </div>
           </div>
           <div className="mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm flex flex-col md:flex-row justify-between items-center">
             <p>&copy; {new Date().getFullYear()} JustRent. All rights reserved.</p>
             <div className="flex gap-4 mt-4 md:mt-0">
               {/* Social Icons placeholders */}
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white">FB</div>
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white">IG</div>
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer text-white">TW</div>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
