import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FleetCard } from "@/components/fleet/FleetCard";
import { Header } from "@/components/layout/Header";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { getSession } from "@/lib/auth";

import { FleetFilters } from "@/components/fleet/FleetFilters";

export const dynamic = 'force-dynamic';

export default async function FleetPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  const params = await searchParams ?? {};
  const category = typeof params.category === 'string' ? params.category : undefined;
  const categories = typeof params.category === 'object' ? params.category : (category ? [category] : undefined);
  
  const transmission = typeof params.transmission === 'string' ? params.transmission : undefined;
  const transmissions = typeof params.transmission === 'object' ? params.transmission : (transmission ? [transmission] : undefined);

  const fuelType = typeof params.fuelType === 'string' ? params.fuelType : undefined;
  const fuelTypes = typeof params.fuelType === 'object' ? params.fuelType : (fuelType ? [fuelType] : undefined);

  const seats = typeof params.seats === 'string' ? params.seats : undefined;
  const seatCounts = typeof params.seats === 'object' ? params.seats : (seats ? [seats] : undefined);

  const guaranteedModel = params.guaranteedModel === 'true';

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

  const whereClause: any = {
    status: 'AVAILABLE',
  };

  if (categories && categories.length > 0) {
    whereClause.category = { in: categories };
  }

  if (transmissions && transmissions.length > 0) {
    whereClause.transmission = { in: transmissions };
  }

  if (fuelTypes && fuelTypes.length > 0) {
    whereClause.fuelType = { in: fuelTypes };
  }

  if (seatCounts && seatCounts.length > 0) {
    // Handling "8+" case if needed, otherwise exact match
    const seatsNumbers = seatCounts.map(s => parseInt(s));
    whereClause.seats = { in: seatsNumbers };
  }

  if (guaranteedModel) {
    whereClause.guaranteedModel = true;
  }

  // Filter out cars that are booked in the requested period
  // We need to check for overlapping bookings
  whereClause.bookings = {
    none: {
      OR: [
        {
          startDate: { lte: queryEndDate },
          endDate: { gte: startDate }
        }
      ],
      status: { in: ['CONFIRMED', 'PENDING'] } // Assuming these statuses block availability
    }
  };

  const cars = await prisma.car.findMany({
    where: whereClause,
    include: {
      pricingTiers: true
    },
    orderBy: {
      pricePerDay: 'asc'
    }
  });

  const serializedCars = cars.map((car: any) => ({
    ...car,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    pricingTiers: car.pricingTiers.map((tier: any) => ({
      ...tier,
      pricePerDay: Number(tier.pricePerDay),
      deposit: Number(tier.deposit)
    }))
  }));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header user={session?.user} />
      
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">Our Premium Fleet</h1>
            <p className="text-zinc-500">
              Select from our wide range of luxury vehicles.
              {startDateStr && (
                <span className="block mt-1 text-red-600 font-medium">
                  Showing availability for {startDate.toLocaleDateString()} 
                  {endDate && ` - ${endDate.toLocaleDateString()}`} 
                  ({diffDays} day{diffDays > 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
          
          <BookingEngine 
            className="w-full md:w-auto static translate-y-0 shadow-none border border-zinc-200 bg-white" 
            compact={true}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
             <FleetFilters 
               currentFilters={{
                 category: categories,
                 transmission: transmissions,
                 fuelType: fuelTypes,
                 seats: seatCounts,
                 guaranteedModel: guaranteedModel
               }}
               counts={{
                 total: serializedCars.length
               }}
             />
          </aside>

          {/* Car Grid */}
          <div className="flex-1">
            {serializedCars.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-zinc-300">
                <p className="text-zinc-500 text-lg">No vehicles found matching your criteria.</p>
                <Button variant="link" className="text-red-600 mt-2" asChild>
                  <Link href="/fleet">Clear all filters</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serializedCars.map((car: any) => (
                  <FleetCard 
                    key={car.id} 
                    car={car} 
                    searchParams={{
                      startDate: startDateStr,
                      endDate: endDateStr
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
