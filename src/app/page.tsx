import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-orange-500">
            JustRent
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="#fleet" className="hover:text-orange-500 transition-colors">Fleet</Link>
            <Link href="#about" className="hover:text-orange-500 transition-colors">About</Link>
            <Link href="#services" className="hover:text-orange-500 transition-colors">Services</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800">
              Sign In
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white border-none">
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Image Placeholder */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2583&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
        
        <div className="relative container mx-auto px-6 flex flex-col items-center text-center z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Premium Car Rental <br />
            <span className="text-orange-500">Redefined.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mb-24">
            Experience the thrill of driving the world's finest automobiles.
            Seamless booking, exceptional service.
          </p>
          
          {/* Booking Engine */}
          <BookingEngine />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-zinc-950">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About JustRent</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-6">
              Founded with a passion for excellence, JustRent offers a curated selection of 
              premium vehicles for those who demand more from their journey. Whether it's 
              a business trip or a weekend getaway, our fleet is meticulously maintained 
              to ensure safety, comfort, and style.
            </p>
            <ul className="space-y-4 text-zinc-300">
               <li className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                 24/7 Concierge Service
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                 Premium Insurance Included
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                 Door-to-door Delivery
               </li>
            </ul>
          </div>
          <div className="relative h-[400px] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
             {/* Placeholder for About Image */}
             <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-zinc-600">
               [Premium Fleet Image]
             </div>
          </div>
        </div>
      </section>

      {/* Fleet Teaser */}
      <section id="fleet" className="py-24 bg-zinc-900 border-t border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Fleet</h2>
              <p className="text-zinc-400">Choose from our exclusive collection.</p>
            </div>
            <Link href="/fleet" className="text-orange-500 hover:text-orange-400 font-medium hidden md:block">
              View All Cars &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Car Card 1 */}
            <div className="group bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300">
              <div className="h-48 bg-zinc-800 relative">
                 <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                   [BMW X5 Image]
                 </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">BMW X5</h3>
                    <p className="text-sm text-zinc-500">SUV • Automatic</p>
                  </div>
                  <span className="bg-zinc-900 text-xs font-bold px-2 py-1 rounded border border-zinc-800">Premium</span>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <p className="text-orange-500 font-bold text-lg">$120 <span className="text-sm text-zinc-500 font-normal">/ day</span></p>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">Details</Button>
                </div>
              </div>
            </div>

            {/* Car Card 2 */}
            <div className="group bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300">
              <div className="h-48 bg-zinc-800 relative">
                 <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                   [Mercedes C-Class Image]
                 </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Mercedes C-Class</h3>
                    <p className="text-sm text-zinc-500">Sedan • Automatic</p>
                  </div>
                  <span className="bg-zinc-900 text-xs font-bold px-2 py-1 rounded border border-zinc-800">Luxury</span>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <p className="text-orange-500 font-bold text-lg">$145 <span className="text-sm text-zinc-500 font-normal">/ day</span></p>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">Details</Button>
                </div>
              </div>
            </div>

             {/* Car Card 3 */}
             <div className="group bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all duration-300">
              <div className="h-48 bg-zinc-800 relative">
                 <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                   [Audi A5 Image]
                 </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Audi A5</h3>
                    <p className="text-sm text-zinc-500">Coupe • Automatic</p>
                  </div>
                  <span className="bg-zinc-900 text-xs font-bold px-2 py-1 rounded border border-zinc-800">Sport</span>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <p className="text-orange-500 font-bold text-lg">$130 <span className="text-sm text-zinc-500 font-normal">/ day</span></p>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">Details</Button>
                </div>
              </div>
            </div>
          </div>
          
           <div className="mt-8 text-center md:hidden">
            <Link href="/fleet" className="text-orange-500 hover:text-orange-400 font-medium">
              View All Cars &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-12 border-t border-zinc-800">
        <div className="container mx-auto px-6 text-center md:text-left">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             <div>
               <h3 className="text-xl font-bold text-white mb-4">JustRent</h3>
               <p className="text-zinc-500 text-sm">
                 Premium car rental service for the modern traveler.
               </p>
             </div>
             <div>
               <h4 className="font-bold text-white mb-4">Links</h4>
               <ul className="space-y-2 text-sm text-zinc-400">
                 <li><Link href="#" className="hover:text-orange-500">Home</Link></li>
                 <li><Link href="#" className="hover:text-orange-500">Fleet</Link></li>
                 <li><Link href="#" className="hover:text-orange-500">About</Link></li>
               </ul>
             </div>
             <div>
               <h4 className="font-bold text-white mb-4">Support</h4>
               <ul className="space-y-2 text-sm text-zinc-400">
                 <li><Link href="#" className="hover:text-orange-500">FAQ</Link></li>
                 <li><Link href="#" className="hover:text-orange-500">Contact</Link></li>
                 <li><Link href="#" className="hover:text-orange-500">Terms of Service</Link></li>
               </ul>
             </div>
             <div>
               <h4 className="font-bold text-white mb-4">Contact</h4>
               <p className="text-sm text-zinc-400">
                 hello@justrent.com<br/>
                 +36 1 234 5678<br/>
                 Budapest, Hungary
               </p>
             </div>
           </div>
           <div className="mt-12 pt-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
             &copy; {new Date().getFullYear()} JustRent. All rights reserved.
           </div>
        </div>
      </footer>
    </div>
  );
}
