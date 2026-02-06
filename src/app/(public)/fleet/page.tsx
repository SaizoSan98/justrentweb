
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { getSession } from "@/lib/auth";
import { FleetClientWrapper } from "@/components/fleet/FleetClientWrapper";
import { getTranslations } from "@/lib/translation"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { Footer } from "@/components/layout/Footer";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { checkRealTimeAvailability } from "@/app/actions/renteon-availability";
import { mapCarToCategoryId } from "@/lib/renteon";

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
  
  // Date parsing and calculation
  const startDateStr = typeof params.startDate === 'string' ? params.startDate : undefined;
  const endDateStr = typeof params.endDate === 'string' ? params.endDate : undefined;
  
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const endDate = endDateStr ? new Date(endDateStr) : undefined;
  
  const queryEndDate = endDate || new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

  // Base availability filter - ALWAYS applied on server to prevent booking conflicts
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

  // 1. Fetch Local Cars (Catalog)
  const [localCars, extrasData] = await Promise.all([
    prisma.car.findMany({
      where: baseWhereClause,
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
    prisma.extra.findMany({
      orderBy: { price: 'asc' }
    })
  ]);

  // 2. Renteon Availability Check (Real-time)
  let renteonAvailableCategoryIds: Set<number> | null = null;
  let renteonPrices = new Map<number, { amount: number, deposit: number }>(); // Map CatId -> { Amount, Deposit }
  
  // Only check Renteon if we have dates (which we usually do as defaults are set)
  if (startDate && queryEndDate) {
      const renteonResult = await checkRealTimeAvailability(startDate, queryEndDate);
      
      if (renteonResult.success && Array.isArray(renteonResult.data)) {
          // Map Renteon results to Category IDs
          // Renteon availability items typically contain CarCategoryId
          renteonAvailableCategoryIds = new Set();
          renteonResult.data.forEach((item: any) => {
              const catId = item.CarCategoryId || item.CategoryId || item.Id;
              if (catId) {
                  renteonAvailableCategoryIds?.add(catId);
                  // Store Price & Deposit
                  if (item.Amount) {
                      renteonPrices.set(catId, {
                          amount: Number(item.Amount),
                          deposit: Number(item.DepositAmount || item.Deposit || 0)
                      });
                  }
              }
          });
          console.log(`Renteon Real-Time: Found ${renteonAvailableCategoryIds.size} available categories.`);
      } else {
          console.warn("Renteon Availability Check Failed or Empty:", renteonResult.error);
          // If check fails, we might want to fallback to local or show empty. 
          // For now, if it errors, we treat it as "System unavailable" and fallback to local to avoid empty page on API error.
          // BUT if it returns success=[] (empty), renteonAvailableCategoryIds will be empty Set, so we show 0 cars.
      }
  }

  // 3. Filter Local Cars based on Renteon AND Update Prices
  let allAvailableCars = localCars;
  if (renteonAvailableCategoryIds !== null) {
      // Calculate duration in days for price-per-day calculation
      const durationMs = queryEndDate.getTime() - startDate.getTime();
      const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

      allAvailableCars = localCars.filter(car => {
          const catId = mapCarToCategoryId(car);
          return renteonAvailableCategoryIds?.has(catId);
      }).map(car => {
          // Clone car to avoid mutating cached object
          const newCar = { ...car };
          const catId = mapCarToCategoryId(car);
          const renteonData = renteonPrices.get(catId);
          
          if (renteonData) {
              // Override pricePerDay with Renteon's effective daily rate
              newCar.pricePerDay = (renteonData.amount / days) as any;
              
              // Override Deposit
              if (renteonData.deposit > 0) {
                  newCar.deposit = renteonData.deposit as any;
              }
          }
          return newCar;
      });
  }

  // Derive filter options from available cars
  const availableCategories = Array.from(new Set(allAvailableCars.flatMap(car => car.categories.map(c => c.name)))).sort();
  const availableTransmissions = Array.from(new Set(allAvailableCars.map(car => car.transmission))).sort();
  const availableFuelTypes = Array.from(new Set(allAvailableCars.map(car => car.fuelType))).sort();
  const availableSeats = Array.from(new Set(allAvailableCars.map(car => car.seats))).sort((a, b) => a - b);

  const options = {
    categories: availableCategories,
    transmissions: availableTransmissions,
    fuelTypes: availableFuelTypes,
    seats: availableSeats
  }

  const serializedCars = allAvailableCars.map((car: any) => ({
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

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-600 selection:text-white">
      <Header transparent={false} user={session?.user} dictionary={dictionary} lang={lang} />
      
      <main className="flex-1 pt-24 pb-20">
         <div className="container mx-auto px-4 md:px-6">
            {/* Top Search & Filter Bar */}
            <div className="mb-20">
                 <BookingEngine 
                    initialStartDate={startDate} 
                    initialEndDate={endDate}
                    noShadow={true}
                 />
            </div>

            <FleetClientWrapper 
                cars={serializedCars} 
                dictionary={dictionary}
                options={options}
            />
         </div>
      </main>
      
      <Footer />
    </div>
  );
}
