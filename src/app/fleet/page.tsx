import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FleetCard } from "@/components/fleet/FleetCard";
import { Header } from "@/components/layout/Header";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { getSession } from "@/lib/auth";

import { FleetFilters } from "@/components/fleet/FleetFilters";

import { getTranslations } from "@/lib/translation"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"

export const dynamic = 'force-dynamic';

export default async function FleetPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en
  
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

  // 1. Define base availability criteria (ignoring UI filters like category/transmission)
  // This is used for the "Show X offers" counter to calculate potential matches
  const baseWhereClause: any = {
    status: 'AVAILABLE',
    bookings: {
      none: {
        OR: [
          {
            startDate: { lte: queryEndDate },
            endDate: { gte: startDate }
          }
        ],
        status: { in: ['CONFIRMED', 'PENDING'] } // Assuming these statuses block availability
      }
    }
  };

  // 2. Build the full filter for the main grid (includes UI filters)
  const fullWhereClause = { ...baseWhereClause };

  if (categories && categories.length > 0) {
    fullWhereClause.category = { in: categories };
  }

  if (transmissions && transmissions.length > 0) {
    fullWhereClause.transmission = { in: transmissions };
  }

  if (fuelTypes && fuelTypes.length > 0) {
    fullWhereClause.fuelType = { in: fuelTypes };
  }

  if (seatCounts && seatCounts.length > 0) {
    // Handling "8+" case if needed, otherwise exact match
    const seatsNumbers = seatCounts.map(s => parseInt(s));
    fullWhereClause.seats = { in: seatsNumbers };
  }

  if (guaranteedModel) {
    fullWhereClause.guaranteedModel = true;
  }

  // 3. Execute queries in parallel
  const [cars, allAvailableCars, categoriesData, transmissionsData, fuelTypesData, seatsData, extrasData] = await Promise.all([
    // Main Grid Query: Filtered by ALL criteria
    prisma.car.findMany({
      where: fullWhereClause,
      include: {
        pricingTiers: true
      },
      orderBy: {
        pricePerDay: 'asc'
      }
    }),

    // Counter Query: Filtered only by AVAILABILITY (ignoring UI filters)
    // This allows the frontend to calculate "Show X offers" dynamically
    prisma.car.findMany({
      where: baseWhereClause,
      select: {
        id: true,
        category: true,
        transmission: true,
        fuelType: true,
        seats: true,
        orSimilar: true,
      }
    }),

    // Filter Options
    prisma.category.findMany({ 
      select: { name: true }, 
      orderBy: { name: 'asc' } 
    }),
    prisma.car.findMany({ 
      select: { transmission: true }, 
      distinct: ['transmission'],
      where: { status: 'AVAILABLE' }
    }),
    prisma.car.findMany({ 
      select: { fuelType: true }, 
      distinct: ['fuelType'],
      where: { status: 'AVAILABLE' }
    }),
    prisma.car.findMany({ 
      select: { seats: true }, 
      distinct: ['seats'], 
      orderBy: { seats: 'asc' },
      where: { status: 'AVAILABLE' }
    }),
    // Fetch Extras for booking flow
    prisma.extra.findMany({
      orderBy: { price: 'asc' }
    })
  ]);

  const extras = extrasData.map(extra => ({
    ...extra,
    price: Number(extra.price)
  }));

  // Fetch Translations if not English
  let translations: any[] = [];
  if (lang !== 'en') {
    const carIds = cars.map(c => c.id);
    translations = await getTranslations(carIds, 'Car', lang);
  }

  const filterOptions = {
    categories: categoriesData.map(c => c.name),
    transmissions: transmissionsData.map(t => t.transmission),
    fuelTypes: fuelTypesData.map(f => f.fuelType),
    seats: seatsData.map(s => s.seats)
  };

  const serializedCars = cars.map((car: any) => {
    // Apply translations
    let translatedCar = { ...car };
    if (lang !== 'en') {
      const carTranslations = translations.filter((t: any) => t.entityId === car.id);
      carTranslations.forEach((t: any) => {
        // Safe override of fields if they exist in translation
        // For now we might translate 'category', 'transmission', 'fuelType' if we want deep localization
        // But mainly 'make', 'model' are usually kept as is, but maybe 'description' if we had one.
        // Let's assume we translate technical terms for now via helper or DB
        // Actually, for dropdowns like transmission, we usually translate the VALUE, not replace the field in DB usually.
        // But if we use the translation table:
        if (t.field === 'transmission') translatedCar.transmission = t.value;
        if (t.field === 'fuelType') translatedCar.fuelType = t.value;
        if (t.field === 'category') translatedCar.category = t.value;
      });
    }

    return {
      ...translatedCar,
      pricePerDay: Number(car.pricePerDay),
      deposit: Number(car.deposit),
      pricingTiers: car.pricingTiers.map((tier: any) => ({
        ...tier,
        pricePerDay: Number(tier.pricePerDay),
        deposit: Number(tier.deposit)
      }))
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header user={session?.user} dictionary={dictionary} lang={lang} />
      
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">{dictionary.fleet.title}</h1>
            <p className="text-zinc-500">
              {dictionary.fleet.subtitle}
              <span className="block mt-1 text-red-600 font-medium">
                {dictionary.hero.show_cars} {startDate.toLocaleDateString()} 
                {endDate && ` - ${endDate.toLocaleDateString()}`} 
                ({diffDays} {diffDays > 1 ? dictionary.common.days : dictionary.common.day})
              </span>
            </p>
          </div>
          
          <BookingEngine 
            className="w-full md:w-auto static translate-y-0 shadow-none bg-transparent" 
            compact={true}
            dictionary={dictionary}
          />
        </div>

        {/* Filters Bar - Sticky */}
        <div className="sticky top-20 z-30 -mx-6 px-6 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50 mb-8 py-2">
           <div className="container mx-auto">
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
               options={filterOptions}
               availableCars={allAvailableCars.map(car => ({
                 ...car,
                 guaranteedModel: !car.orSimilar
               }))}
               dictionary={dictionary}
             />
           </div>
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serializedCars.map((car: any) => (
                <FleetCard 
                  key={car.id} 
                  car={car} 
                  extras={extras}
                  searchParams={{
                    startDate: startDateStr,
                    endDate: endDateStr
                  }}
                  dictionary={dictionary}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
