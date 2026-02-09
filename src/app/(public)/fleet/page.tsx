
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
  
  // Calculate default start date (Current time + 2 hours)
  const defaultStartDate = new Date();
  defaultStartDate.setHours(defaultStartDate.getHours() + 2);
  // We keep minutes as is, or round them? User said "Feb 10. 11:53" (if now is 9:53). So keep minutes.
  // defaultStartDate.setMinutes(0, 0, 0); // Removed zeroing minutes

  const startDate = startDateStr ? new Date(startDateStr) : defaultStartDate;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;
  
  // Default duration: 3 days
  const queryEndDate = endDate || new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Base availability filter - ALWAYS applied on server to prevent booking conflicts
  // We now fetch ALL cars that are generally available in fleet, and mark them as rented if they have conflicts
  const baseWhereClause: any = {
    status: 'AVAILABLE',
    // We include bookings to check them later for conflicts
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
        },
        // Include bookings to check availability manually
        bookings: {
           where: {
             status: { in: ['CONFIRMED', 'PENDING'] },
             startDate: { lte: queryEndDate },
             endDate: { gte: startDate }
           },
           select: { id: true } // We only need existence
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
  
  // Strict Renteon Dependency: We assume failure if check fails.
  let isRenteonCheckSuccessful = false;

  // Only check Renteon if we have dates
  if (startDate && queryEndDate) {
      try {
        const renteonResult = await checkRealTimeAvailability(startDate, queryEndDate);
        
        if (renteonResult.success && Array.isArray(renteonResult.data)) {
            isRenteonCheckSuccessful = true;
            renteonAvailableCategoryIds = new Set();
            renteonResult.data.forEach((item: any) => {
                const catId = item.CarCategoryId || item.CategoryId || item.Id;
                if (catId) {
                    renteonAvailableCategoryIds?.add(catId);
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
            console.warn("Renteon Availability Check Failed:", renteonResult.error);
        }
      } catch (err) {
          console.error("Renteon Check Exception:", err);
      }
  }

  // 3. Filter Local Cars based on Renteon AND Update Prices
  // STRICT MODE: If Renteon check fails or returns empty, we default to UNAVAILABLE.
  // We use localCars as the base list.
  
  let allAvailableCars = localCars.map(car => {
      // Default to unavailable if Renteon check wasn't successful or if car not in Renteon list
      // We ignore local bookings because "nincs helyi elérhetőség, csak Renteonból dolgozunk"
      let isAvailable = false;
      
      if (isRenteonCheckSuccessful && renteonAvailableCategoryIds) {
           const catId = mapCarToCategoryId(car);
           if (renteonAvailableCategoryIds.has(catId)) {
               isAvailable = true;
           }
      }

      return {
          ...car,
          isAvailable
      };
  });

  if (isRenteonCheckSuccessful && renteonAvailableCategoryIds) {
      // Calculate duration in days for price-per-day calculation
      const durationMs = queryEndDate.getTime() - startDate.getTime();
      const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

      allAvailableCars = allAvailableCars.map(car => {
          const newCar = { ...car };
          const catId = mapCarToCategoryId(car);
          const renteonData = renteonPrices.get(catId);
          
          if (renteonData) {
              // Override pricePerDay with Renteon's effective daily rate
              newCar.pricePerDay = Math.round(renteonData.amount / days) as any;
              
              // Override Deposit
              if (renteonData.deposit > 0) {
                  newCar.deposit = renteonData.deposit as any;
              }
          }
          return newCar;
      });
  }

  // SORTING: Available first (Price ASC), then Unavailable (Price ASC)
  allAvailableCars.sort((a, b) => {
      // 1. Availability (Available first)
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      
      // 2. Price (Cheapest first)
      return (Number(a.pricePerDay) - Number(b.pricePerDay));
  });

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
    isAvailable: car.isAvailable !== false, // Default to true if undefined
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
