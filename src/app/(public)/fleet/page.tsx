
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FleetCard } from "@/components/fleet/FleetCard";
import { Header } from "@/components/layout/Header";
import { FleetTopBar } from "@/components/fleet/FleetTopBar";
import { getSession } from "@/lib/auth";

import { FleetFilters } from "@/components/fleet/FleetFilters";
import { ActiveFilters } from "@/components/fleet/ActiveFilters";

import { getTranslations } from "@/lib/translation"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { BookingEngine } from "@/components/booking/BookingEngine";

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
  const make = typeof params.make === 'string' ? params.make : undefined;

  // Date parsing and calculation
  const startDateStr = typeof params.startDate === 'string' ? params.startDate : undefined;
  const endDateStr = typeof params.endDate === 'string' ? params.endDate : undefined;
  
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const endDate = endDateStr ? new Date(endDateStr) : undefined;
  
  const s = new Date(startDate); s.setHours(0,0,0,0);
  const e = endDate ? new Date(endDate) : new Date(startDate); 
  if (endDate) e.setHours(0,0,0,0);
  
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  const queryEndDate = endDate || new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

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
        status: { in: ['CONFIRMED', 'PENDING'] }
      }
    }
  };

  const fullWhereClause = { ...baseWhereClause };

  if (categories && categories.length > 0) {
    fullWhereClause.categories = {
      some: {
        name: { in: categories }
      }
    };
  }

  if (transmissions && transmissions.length > 0) {
    fullWhereClause.transmission = { in: transmissions };
  }

  if (fuelTypes && fuelTypes.length > 0) {
    fullWhereClause.fuelType = { in: fuelTypes };
  }

  if (seatCounts && seatCounts.length > 0) {
    const seatsNumbers = seatCounts.map(s => parseInt(s));
    fullWhereClause.seats = { in: seatsNumbers };
  }

  if (guaranteedModel) {
    fullWhereClause.orSimilar = false;
  }

  if (make) {
    fullWhereClause.make = {
      contains: make,
      mode: 'insensitive'
    };
  }

  const [cars, allAvailableCars, extrasData] = await Promise.all([
    prisma.car.findMany({
      where: fullWhereClause,
      include: {
        categories: true,
        pricingTiers: true,
        insuranceOptions: {
            include: { plan: true }
        }
      },
      orderBy: {
        pricePerDay: 'asc'
      }
    }),
    prisma.car.findMany({
      where: baseWhereClause,
      select: {
        id: true,
        categories: { select: { name: true } },
        transmission: true,
        fuelType: true,
        seats: true,
        orSimilar: true,
      }
    }),
    prisma.extra.findMany({
      orderBy: { price: 'asc' }
    })
  ]);

  // Derive filter options from available cars
  const availableCategories = Array.from(new Set(allAvailableCars.flatMap(car => car.categories.map(c => c.name)))).sort();
  const availableTransmissions = Array.from(new Set(allAvailableCars.map(car => car.transmission))).sort();
  const availableFuelTypes = Array.from(new Set(allAvailableCars.map(car => car.fuelType))).sort();
  const availableSeats = Array.from(new Set(allAvailableCars.map(car => car.seats))).sort((a, b) => a - b);

  const extras = extrasData.map(extra => ({
    ...extra,
    price: Number(extra.price)
  }));

  const serializedCars = cars.map((car: any) => ({
    ...car,
    pricePerDay: Number(car.pricePerDay),
    deposit: Number(car.deposit),
    fullInsurancePrice: Number(car.fullInsurancePrice || 0),
    extraKmPrice: Number(car.extraKmPrice || 0),
    unlimitedMileagePrice: Number(car.unlimitedMileagePrice || 0),
    registrationFee: Number(car.registrationFee || 0),
    contractFee: Number(car.contractFee || 0),
    winterizationFee: Number(car.winterizationFee || 0),
    pickupAfterHoursPrice: Number(car.pickupAfterHoursPrice || 0),
    returnAfterHoursPrice: Number(car.returnAfterHoursPrice || 0),
    pricingTiers: car.pricingTiers.map((tier: any) => ({
      ...tier,
      pricePerDay: Number(tier.pricePerDay),
      deposit: Number(tier.deposit)
    })),
    insuranceOptions: car.insuranceOptions.map((opt: any) => ({
        ...opt,
        pricePerDay: Number(opt.pricePerDay),
        deposit: Number(opt.deposit),
        plan: opt.plan
    }))
  }));

  const availableCarsSerialized = allAvailableCars.map(car => ({
      ...car,
      guaranteedModel: !car.orSimilar
  }));

  const hasActiveFilters = (categories?.length || 0) > 0 || 
                           (transmissions?.length || 0) > 0 || 
                           (fuelTypes?.length || 0) > 0 || 
                           (seatCounts?.length || 0) > 0 || 
                           guaranteedModel;

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-600 selection:text-white">
      <Header transparent={false} user={session?.user} dictionary={dictionary} lang={lang} />
      
      <main className="flex-1 pt-24 pb-20">
         <div className="container mx-auto px-4 md:px-6">
            {/* Top Search & Filter Bar */}
            <div className="mb-12">
                <div className="bg-white rounded-3xl p-2 shadow-sm border border-zinc-100 mb-12">
                     <BookingEngine 
                        initialStartDate={startDate} 
                        initialEndDate={endDate} 
                        compact={true} 
                        className="!p-0 !shadow-none !bg-transparent" 
                        dictionary={dictionary} 
                     />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-zinc-100 pb-4">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-2">Our Fleet</h1>
                        <p className="text-zinc-500 mb-4">Choose from our premium collection of vehicles.</p>
                        
                        {/* Active Filters Display Moved Here */}
                        <div className="mb-2">
                            <ActiveFilters />
                        </div>
                    </div>
                    
                    {/* Filter Toggle */}
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-zinc-400 text-sm font-bold">{serializedCars.length} vehicles available</span>
                        <details className="relative group">
                            <summary className="list-none">
                                <div className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-zinc-800 transition-colors">
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                    {hasActiveFilters && <span className="bg-red-600 w-2 h-2 rounded-full" />}
                                </div>
                            </summary>
                            <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold">Filter Vehicles</h3>
                                    {hasActiveFilters && (
                                        <Link href="/fleet" className="text-xs text-red-600 font-bold hover:underline">
                                            Reset All
                                        </Link>
                                    )}
                                </div>
                                <FleetFilters 
                                    currentFilters={{
                                        category: categories as string[],
                                        transmission: transmissions as string[],
                                        fuelType: fuelTypes as string[],
                                        seats: seatCounts as string[],
                                        guaranteedModel
                                    }}
                                    counts={{
                                        total: allAvailableCars.length
                                    }}
                                    options={{
                                        categories: availableCategories,
                                        transmissions: availableTransmissions,
                                        fuelTypes: availableFuelTypes,
                                        seats: availableSeats
                                    }}
                                    availableCars={availableCarsSerialized}
                                    dictionary={dictionary}
                                />
                            </div>
                        </details>
                    </div>
                </div>

                {/* Active Filters Display */}
                {/* <div className="mt-4">
                    <ActiveFilters />
                </div> */}
            </div>

            {/* Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {serializedCars.map((car: any) => (
                  <FleetCard 
                    key={car.id} 
                    car={car} 
                    searchParams={{
                        startDate: startDateStr,
                        endDate: endDateStr
                    }}
                    extras={extras}
                    dictionary={dictionary}
                    variant="light" // Using light variant for clean look
                  />
                ))}
            </div>
             
             {serializedCars.length === 0 && (
                <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-100">
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">No cars match your filters</h3>
                    <p className="text-zinc-500 mb-6">Try adjusting your criteria to see more results.</p>
                    <Button 
                        asChild
                        className="bg-black text-white hover:bg-zinc-800 rounded-xl px-8"
                    >
                        <Link href="/fleet">Clear All Filters</Link>
                    </Button>
                </div>
             )}
         </div>
      </main>

      {/* Footer is already in Layout */}
    </div>
  );
}
