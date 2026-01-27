import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;

  const whereClause: any = {
    status: 'AVAILABLE',
  };

  if (category && category !== 'All Categories') {
    whereClause.category = category;
  }

  const cars = await prisma.car.findMany({
    where: whereClause,
    orderBy: {
      pricePerDay: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Just<span className="text-orange-600">Rent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-zinc-600 hover:text-orange-600 transition-colors">Home</Link>
            <Link href="/fleet" className="text-orange-600">Fleet</Link>
            <Link href="/about" className="text-zinc-600 hover:text-orange-600 transition-colors">About</Link>
            <Link href="/contact" className="text-zinc-600 hover:text-orange-600 transition-colors">Contact</Link>
          </nav>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 text-zinc-900">Our Premium Fleet</h1>
          <p className="text-zinc-600 text-lg max-w-2xl">
            Choose from our exclusive collection of high-end vehicles. Whether you need a luxury SUV for a family trip or a sportscar for a weekend getaway, we have the perfect car for you.
          </p>
        </div>

        {/* Filters (Simple placeholder for now) */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {['All Categories', 'SUV', 'Sedan', 'Sports', 'Luxury'].map((cat) => (
            <Link 
              key={cat} 
              href={cat === 'All Categories' ? '/fleet' : `/fleet?category=${cat}`}
              className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                (category === cat || (!category && cat === 'All Categories'))
                  ? 'bg-zinc-900 text-white border-zinc-900' 
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-orange-500 hover:text-orange-500'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Car Grid */}
        {cars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">No cars available</h3>
            <p className="text-zinc-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car: Car) => (
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
                      No Image Available
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-zinc-900 shadow-sm border border-zinc-100">
                    {car.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">{car.make} {car.model}</h3>
                      <p className="text-sm text-zinc-500">{car.year} • {car.licensePlate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Automatic
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      5 Seats
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wide font-semibold">Price per day</p>
                      <p className="text-orange-600 font-bold text-2xl">${Number(car.pricePerDay)}</p>
                    </div>
                    <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg px-6">
                      Rent Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
