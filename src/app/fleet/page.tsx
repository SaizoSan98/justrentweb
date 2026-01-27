import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FleetCard } from "@/components/fleet/FleetCard";

export const dynamic = 'force-dynamic';

export default async function FleetPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const params = searchParams ?? {};
  const category = typeof params.category === 'string' ? params.category : undefined;
  
  type PricingTier = {
    minDays: number;
    maxDays: number | null;
    pricePerDay: number;
    deposit: number;
  };
  
  function getStockImageUrl(make: string, model: string): string {
    const pool = [
      "https://www.pngmart.com/files/22/BMW-X5-PNG-Clipart.png",
      "https://www.pngmart.com/files/22/Mercedes-Benz-C-Class-PNG-Isolated-Pic.png",
      "https://www.pngmart.com/files/22/Audi-A5-PNG-File.png",
      "https://www.pngmart.com/files/22/Tesla-Model-3-PNG-Picture.png",
      "https://www.pngmart.com/files/22/Porsche-911-PNG-Clipart.png",
      "https://www.pngmart.com/files/22/Chevrolet-Camaro-PNG-Image.png",
      "https://www.pngmart.com/files/22/Range-Rover-PNG-Clipart.png"
    ];
    // Use a deterministic hash based on make+model to pick an image from the pool
    // This ensures the same car always gets the same random image
    const str = `${make}${model}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pool.length;
    return pool[index];
  }
  
  // Date parsing and calculation
  const startDateStr = typeof params.startDate === 'string' ? params.startDate : undefined;
  const endDateStr = typeof params.endDate === 'string' ? params.endDate : undefined;
  
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const endDate = endDateStr ? new Date(endDateStr) : new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

  const whereClause: { status: 'AVAILABLE'; category?: string } = {
    status: 'AVAILABLE',
  };

  if (category && category !== 'All Categories') {
    whereClause.category = category;
  }

  const cars = await prisma.car.findMany({
    where: {
      ...whereClause,
      AND: [
        {
          availabilities: {
            some: {
              status: 'AVAILABLE',
              startDate: { lte: startDate },
              endDate: { gte: endDate },
            },
          },
        },
        {
          NOT: {
            availabilities: {
              some: {
                status: { in: ['MAINTENANCE', 'RENTED', 'OUT_OF_SERVICE'] },
                AND: [
                  { startDate: { lt: endDate } },
                  { endDate: { gt: startDate } },
                ],
              },
            },
          },
        },
      ],
    },
    include: {
      pricingTiers: true,
    },
    orderBy: {
      pricePerDay: 'asc',
    },
  }).then((items: any[]) => items.map((car: any) => ({
    ...car,
    pricePerDay: Number(car.pricePerDay),
    pricingTiers: car.pricingTiers.map((tier: any) => ({
      ...tier,
      pricePerDay: Number(tier.pricePerDay),
      deposit: Number(tier.deposit)
    }))
  })));

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Just<span className="text-red-600">Rent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-zinc-600 hover:text-red-600 transition-colors">Home</Link>
            <Link href="/fleet" className="text-red-600 font-bold">Our Fleet</Link>
            <Link href="/#contact" className="text-zinc-600 hover:text-red-600 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-4">
               <Button variant="ghost" className="text-zinc-600 hover:text-red-600 font-bold">
                 Login
               </Button>
               <Button variant="ghost" className="text-zinc-600 hover:text-red-600 font-bold">
                 Register
               </Button>
             </div>
             <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 font-semibold shadow-md shadow-red-600/20 uppercase tracking-wide">
               Book Now!
             </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-zinc-900 tracking-tight">Our Premium Fleet</h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Showing prices for <span className="font-bold text-red-600">{diffDays} days</span> rental period.
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
                  ? 'bg-red-600 text-white shadow-red-600/30 transform scale-105' 
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:border-red-600 hover:text-red-600'
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
            {cars.map((car: any) => {
              const imageUrl = car.imageUrl ?? getStockImageUrl(car.make, car.model);
              return (
                <FleetCard 
                  key={car.id} 
                  car={car} 
                  diffDays={diffDays} 
                  imageUrl={imageUrl} 
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
