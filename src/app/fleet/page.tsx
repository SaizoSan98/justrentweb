import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car } from "@prisma/client";
import { Users, Briefcase, Fuel, Snowflake, Gauge, Info } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  
  // Date parsing and calculation
  const startDateStr = typeof params.startDate === 'string' ? params.startDate : undefined;
  const endDateStr = typeof params.endDate === 'string' ? params.endDate : undefined;
  
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const endDate = endDateStr ? new Date(endDateStr) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Default 3 days
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

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
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Just<span className="text-orange-600">Rent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-zinc-600 hover:text-orange-600 transition-colors">Home</Link>
            <Link href="/fleet" className="text-orange-600">Fleet</Link>
            <Link href="/about" className="text-zinc-600 hover:text-orange-600 transition-colors">About</Link>
            <Link href="/contact" className="text-zinc-600 hover:text-orange-600 transition-colors">Contact</Link>
          </nav>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 font-semibold shadow-md shadow-orange-600/20">
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-zinc-900 tracking-tight">Our Premium Fleet</h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Showing prices for <span className="font-bold text-orange-600">{diffDays} days</span> rental period.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-4">
          {['All Categories', 'SUV', 'Sedan', 'Sports', 'Luxury'].map((cat) => (
            <Link 
              key={cat} 
              href={cat === 'All Categories' ? `/fleet?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` : `/fleet?category=${cat}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                (category === cat || (!category && cat === 'All Categories'))
                  ? 'bg-orange-600 text-white shadow-orange-600/30 transform scale-105' 
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:border-orange-600 hover:text-orange-600'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Car Grid */}
        {cars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No cars available</h3>
            <p className="text-zinc-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car: Car) => {
              const totalPrice = Number(car.pricePerDay) * diffDays;
              
              return (
                <div key={car.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative border border-zinc-100 flex flex-col">
                  
                  {/* Info Badge */}
                  <div className="absolute top-0 left-0 z-20">
                    <div className="bg-orange-600 text-white w-12 h-12 flex items-center justify-center rounded-br-3xl shadow-md">
                      <Info className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Car Category Badge (Top Right - Optional/Stylistic) */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">{car.category}</span>
                  </div>

                  {/* Image Area */}
                  <div className="h-48 bg-gradient-to-b from-zinc-50 to-white relative flex items-center justify-center p-6 mt-6">
                    {car.imageUrl ? (
                      <img 
                        src={car.imageUrl} 
                        alt={`${car.make} ${car.model}`} 
                        className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-zinc-300 font-bold text-2xl">NO IMAGE</div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="p-6 pt-2 flex flex-col flex-grow text-center">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight mb-1">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-zinc-400 text-sm font-medium mb-6">or similar</p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-3 gap-y-6 gap-x-2 mb-8 px-2">
                      <div className="flex flex-col items-center gap-1">
                        <Users className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-zinc-500 font-medium">5</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Briefcase className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-zinc-500 font-medium">3</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-5 h-5 flex items-center justify-center border-2 border-orange-600 rounded text-[10px] font-bold text-orange-600">5</div>
                        <span className="text-xs text-zinc-500 font-medium">Doors</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Snowflake className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-zinc-500 font-medium">AC</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Gauge className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-zinc-500 font-medium">Auto</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <Fuel className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-zinc-500 font-medium">Petrol</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-auto">
                      <div className="mb-4">
                        <span className="text-2xl font-black text-orange-600">{totalPrice.toLocaleString()} HUF</span>
                        <span className="text-xs text-zinc-400 font-medium block uppercase tracking-wide">for {diffDays} days</span>
                      </div>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 transition-all transform active:scale-95 uppercase tracking-wider text-base">
                        FOGLALÁS
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}