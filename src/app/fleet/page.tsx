import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FleetCard } from "@/components/fleet/FleetCard";
import { Header } from "@/components/layout/Header";
import { BookingEngine } from "@/components/booking/BookingEngine";

export const dynamic = 'force-dynamic';

export default async function FleetPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams ?? {};
  const category = typeof params.category === 'string' ? params.category : undefined;
  const transmission = typeof params.transmission === 'string' ? params.transmission : undefined;
  
  type PricingTier = {
    minDays: number;
    maxDays: number | null;
    pricePerDay: number;
    deposit: number;
  };
  
  function getStockImageUrl(make: string, model: string): string {
    // Explicit mappings for the 3 test cars as requested by user
    if (make === 'Tesla' && model === 'Model 3') {
      return "https://imgd.aeplcdn.com/1056x594/n/cw/ec/175993/kushaq-exterior-right-front-three-quarter-2.png?isig=0&q=80&wm=1";
    }
    if (make === 'BMW' && model === 'X5') {
      return "https://imgd.aeplcdn.com/370x208/n/cw/ec/102663/baleno-exterior-right-front-three-quarter-69.png?isig=0&q=80";
    }
    if (make === 'Mercedes-Benz' && model === 'C-Class') {
      return "https://imgd.aeplcdn.com/370x208/n/cw/ec/51909/a4-exterior-right-front-three-quarter-80.png?isig=0&q=80";
    }

    const pool = [
      "https://imgd.aeplcdn.com/1056x594/n/cw/ec/175993/kushaq-exterior-right-front-three-quarter-2.png?isig=0&q=80&wm=1",
      "https://imgd.aeplcdn.com/370x208/n/cw/ec/102663/baleno-exterior-right-front-three-quarter-69.png?isig=0&q=80",
      "https://imgd.aeplcdn.com/370x208/n/cw/ec/51909/a4-exterior-right-front-three-quarter-80.png?isig=0&q=80",
      "https://imgd.aeplcdn.com/370x208/n/cw/ec/39472/a6-exterior-right-front-three-quarter-3.png?isig=0&q=80"
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
  
  // If no params provided, default to today ONLY (no 3 days default)
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const endDate = endDateStr ? new Date(endDateStr) : undefined;
  
  // Fix: Ensure we compare start of days to avoid time nuances if we want pure calendar days
  const s = new Date(startDate); s.setHours(0,0,0,0);
  // If endDate is undefined, we assume 1 day for display/calculation purposes until user picks a range
  const e = endDate ? new Date(endDate) : new Date(startDate); 
  if (endDate) e.setHours(0,0,0,0);
  
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  // For DB query, if no endDate is set, we just check availability for startDate (1 day)
  const queryEndDate = endDate || new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

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
              endDate: { gte: queryEndDate },
            },
          },
        },
        {
          NOT: {
            availabilities: {
              some: {
                status: { in: ['MAINTENANCE', 'RENTED', 'OUT_OF_SERVICE'] },
                AND: [
                  { startDate: { lt: queryEndDate } },
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
  }).then((items: any[]) => items.map((car: any) => {
    // Only use stock images if no image is uploaded
    let displayImage = car.imageUrl;
    
    if (!displayImage) {
      if (car.make === 'Tesla' && car.model === 'Model 3') {
        displayImage = "https://imgd.aeplcdn.com/1056x594/n/cw/ec/175993/kushaq-exterior-right-front-three-quarter-2.png?isig=0&q=80&wm=1";
      } else if (car.make === 'BMW' && car.model === 'X5') {
        displayImage = "https://imgd.aeplcdn.com/370x208/n/cw/ec/102663/baleno-exterior-right-front-three-quarter-69.png?isig=0&q=80";
      } else if (car.make === 'Mercedes-Benz' && car.model === 'C-Class') {
        displayImage = "https://imgd.aeplcdn.com/370x208/n/cw/ec/51909/a4-exterior-right-front-three-quarter-80.png?isig=0&q=80";
      } else {
        displayImage = getStockImageUrl(car.make, car.model);
      }
    }

    return {
      ...car,
      imageUrl: displayImage,
      pricePerDay: Number(car.pricePerDay),
      pricingTiers: car.pricingTiers.sort((a: any, b: any) => a.minDays - b.minDays).map((tier: any) => ({
        ...tier,
        pricePerDay: Number(tier.pricePerDay),
        deposit: Number(tier.deposit)
      }))
    };
  }));

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Header */}
      <Header />

      {/* Booking Engine */}
      <div className="pt-32 pb-8 bg-zinc-50/50">
        <BookingEngine 
          key={`${startDate.toISOString()}-${endDate?.toISOString() ?? 'undefined'}`}
          initialStartDate={startDate}
          initialEndDate={endDate}
          className="w-full max-w-6xl mx-auto px-4 mt-0 shadow-none border border-zinc-200"
          showLabel={false}
          compact={true}
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full">
            <span className="text-zinc-500 font-medium">Selected Duration:</span>
            <span className="font-bold text-red-600">{diffDays} {diffDays === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-6 mb-12">
          {/* Category Filter */}
          <div className="flex justify-center gap-3 overflow-x-auto pb-4">
            {['All Categories', 'SUV', 'Sedan', 'Sports', 'Luxury'].map((cat) => (
              <Link 
                key={cat} 
                href={cat === 'All Categories' ? `/fleet?startDate=${startDate.toISOString()}&endDate=${queryEndDate.toISOString()}${transmission ? `&transmission=${transmission}` : ''}` : `/fleet?category=${cat}&startDate=${startDate.toISOString()}&endDate=${queryEndDate.toISOString()}${transmission ? `&transmission=${transmission}` : ''}`}
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

          {/* Transmission Filter */}
          <div className="flex justify-center gap-3">
             {['Any', 'MANUAL', 'AUTOMATIC'].map((trans) => (
              <Link 
                key={trans} 
                href={`/fleet?${category && category !== 'All Categories' ? `category=${category}&` : ''}startDate=${startDate.toISOString()}&endDate=${queryEndDate.toISOString()}${trans !== 'Any' ? `&transmission=${trans}` : ''}`}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  (transmission === trans || (!transmission && trans === 'Any'))
                    ? 'bg-zinc-900 text-white' 
                    : 'bg-white text-zinc-400 border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
                }`}
              >
                {trans === 'Any' ? 'Any Gearbox' : trans}
              </Link>
            ))}
          </div>
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
