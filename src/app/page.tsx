import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { prisma } from "@/lib/prisma";
import { Car } from "@prisma/client";

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const cars = await prisma.car.findMany({
    take: 3,
    where: { status: 'AVAILABLE' },
    orderBy: { pricePerDay: 'asc' }
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-zinc-900">
            Just<span className="text-orange-600">Rent</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/fleet" className="text-zinc-600 hover:text-orange-600 transition-colors">Fleet</Link>
            <Link href="#about" className="text-zinc-600 hover:text-orange-600 transition-colors">About</Link>
            <Link href="#services" className="text-zinc-600 hover:text-orange-600 transition-colors">Services</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium">
              Sign In
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 shadow-lg shadow-orange-600/20">
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center"></div>
        {/* Overlay - Lighter for this theme but still needed for white text */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-transparent to-transparent"></div>
        
        <div className="relative container mx-auto px-6 flex flex-col items-center text-center z-10 pt-20">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6">
            Premium Car Rental Service
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-sm">
            Drive the <span className="text-orange-500">Extraordinary.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-100 max-w-2xl mb-12 font-light leading-relaxed drop-shadow-sm">
            Experience the thrill of driving the world's finest automobiles.
            Seamless booking, exceptional service.
          </p>
          
          {/* Booking Engine */}
          <BookingEngine />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-zinc-900">Why Choose JustRent?</h2>
            <p className="text-zinc-600 text-lg leading-relaxed mb-8">
              Founded with a passion for excellence, JustRent offers a curated selection of 
              premium vehicles for those who demand more from their journey. Whether it's 
              a business trip or a weekend getaway, our fleet is meticulously maintained 
              to ensure safety, comfort, and style.
            </p>
            <ul className="space-y-6">
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">24/7 Concierge Service</h3>
                    <p className="text-zinc-500 text-sm mt-1">We are here for you anytime, anywhere.</p>
                 </div>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-900">Premium Insurance Included</h3>
                    <p className="text-zinc-500 text-sm mt-1">Drive with peace of mind with our comprehensive coverage.</p>
                 </div>
               </li>
               <li className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
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
              <span className="text-orange-600 font-bold uppercase tracking-wider text-sm mb-2 block">Our Collection</span>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900">Featured Vehicles</h2>
            </div>
            <Link href="/fleet" className="text-zinc-900 hover:text-orange-600 font-medium hidden md:flex items-center gap-2 transition-colors">
              View All Cars <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cars.map((car) => (
              <div key={car.id} className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300">
                <div className="h-56 bg-zinc-100 relative overflow-hidden">
                   {car.imageUrl ? (
                     <img 
                       src={car.imageUrl} 
                       alt={`${car.make} ${car.model}`} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                       No Image
                     </div>
                   )}
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-zinc-900 shadow-sm">
                     {car.category}
                   </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">{car.make} {car.model}</h3>
                      <p className="text-sm text-zinc-500">{car.year} • Automatic</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                    <p className="text-orange-600 font-bold text-lg">${Number(car.pricePerDay)} <span className="text-sm text-zinc-400 font-normal">/ day</span></p>
                    <Button size="sm" variant="outline" className="border-zinc-200 text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 rounded-lg">Details</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
           <div className="mt-8 text-center md:hidden">
            <Link href="/fleet" className="text-orange-600 font-bold">
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
                 1051 Budapest, Bajcsy-Zsilinszky út 12.
               </p>
             </div>
           </div>
           <div className="mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm flex flex-col md:flex-row justify-between items-center">
             <p>&copy; {new Date().getFullYear()} JustRent. All rights reserved.</p>
             <div className="flex gap-4 mt-4 md:mt-0">
               {/* Social Icons placeholders */}
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer text-white">FB</div>
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer text-white">IG</div>
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer text-white">TW</div>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
