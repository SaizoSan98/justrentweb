
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FleetCard } from "@/components/fleet/FleetCard";
import { Header } from "@/components/layout/Header";
import { FleetTopBar } from "@/components/fleet/FleetTopBar";
import { getSession } from "@/lib/auth";

import { FleetFilters } from "@/components/fleet/FleetFilters";

import { getTranslations } from "@/lib/translation"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { ChevronDown } from "lucide-react";

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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-red-600 selection:text-white">
      <Header transparent={false} user={session?.user} dictionary={dictionary} lang={lang} />
      
      {/* Top Bar / Stepper */}
      <div className="pt-24">
        <FleetTopBar searchParams={params as any} />
      </div>

      <div className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
             <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm sticky top-32">
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
          </aside>

          {/* Main Content */}
          <main className="flex-1">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Choose your vehicle <span className="text-zinc-500 text-lg font-normal ml-2">{serializedCars.length} available</span></h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400 uppercase tracking-wider font-bold">Sort By</span>
                    <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:text-white">
                        Most Popular First
                        <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                </div>
             </div>

             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
                    variant="dark"
                  />
                ))}
             </div>
             
             {serializedCars.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">No cars available</h3>
                    <p className="text-zinc-500">Try adjusting your dates or filters to see more results.</p>
                    <Button 
                        asChild
                        className="mt-6 bg-zinc-900 text-white hover:bg-zinc-800"
                    >
                        <Link href="/fleet">Clear Filters</Link>
                    </Button>
                </div>
             )}
          </main>
        </div>
      </div>
    </div>
  );
}
