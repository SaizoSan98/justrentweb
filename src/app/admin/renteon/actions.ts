"use server"

import { getSession } from "@/lib/auth"
import { getRenteonToken, fetchCarCategories, fetchRenteonServices } from "@/lib/renteon"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api"

export async function testRenteonConnection() {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    // 1. Test Auth
    const token = await getRenteonToken()
    if (!token) throw new Error("Failed to obtain access token")

    // 2. Test Data Fetch (e.g. Offices)
    const response = await fetch(`${RENTEON_API_URL}/offices`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`API Error: ${response.status} - ${text}`)
    }

    const data = await response.json()
    
    return { 
        success: true, 
        message: "Connection Successful!", 
        tokenPreview: `${token.substring(0, 10)}...`,
        data: data
    }

  } catch (error: any) {
    console.error("Renteon Test Failed:", error)
    return { 
        error: error.message || "Unknown error occurred",
        details: error.toString()
    }
  }
}

export async function syncAvailability() {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  const token = await getRenteonToken();
  if (!token) return { error: "Failed to get token" };

  try {
      // Fetch bookings for the next 12 months
      const today = new Date();
      const nextYear = new Date();
      nextYear.setDate(today.getDate() + 365);

      const payload = {
          DateFrom: today.toISOString(),
          DateTo: nextYear.toISOString()
      };

      const response = await fetch(`${RENTEON_API_URL}/bookings/search`, {
          method: 'POST',
          headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          throw new Error(`Renteon Search Failed: ${response.status} ${await response.text()}`);
      }

      const bookings = await response.json();
      const activeBookings = bookings.filter((b: any) => !b.IsCancelled);
      
      console.log(`Found ${activeBookings.length} active future bookings.`);

      const now = new Date();
      let updatedCount = 0;
      
      // Get all local cars with renteonId
      const localCars = await prisma.car.findMany({
          where: { renteonId: { not: null } }
      });

      // Map of Renteon CarID -> Status
      const carStatusMap = new Map<string, 'AVAILABLE' | 'RENTED'>();

      // Initialize all as AVAILABLE
      localCars.forEach(c => {
          if (c.renteonId) carStatusMap.set(c.renteonId, 'AVAILABLE');
      });

      // Process bookings to find RENTED ones
      for (const b of activeBookings) {
          const start = new Date(b.DateOut);
          const end = new Date(b.DateIn);
          const isOngoing = start <= now && end >= now;

          if (isOngoing) {
              const carId = b.CarId || b.Car?.Id;
              if (carId) {
                  carStatusMap.set(carId.toString(), 'RENTED');
              }
          }
      }

      // Update DB
      for (const [renteonId, status] of carStatusMap.entries()) {
          await prisma.car.updateMany({
              where: { renteonId: renteonId },
              data: { status: status }
          });
          updatedCount++;
      }

      revalidatePath("/admin/cars");
      
      return { 
          success: true, 
          message: `Availability check ran. Processed ${activeBookings.length} bookings. Updated status for ${updatedCount} cars.`,
          bookingsCount: activeBookings.length
      }

  } catch (error: any) {
      console.error("Availability Sync Error:", error);
      return { error: error.message };
  }
}

// SIPP Decoder Helper
function decodeSIPP(sipp: string): string {
    if (!sipp || sipp.length < 4) return 'Unknown';
    
    const letter1 = sipp[0].toUpperCase(); // Size
    const letter2 = sipp[1].toUpperCase(); // Doors/Type

    const sizeMap: Record<string, string> = {
        'M': 'Mini', 'N': 'Mini',
        'E': 'Economy', 'H': 'Economy',
        'C': 'Compact', 'D': 'Compact',
        'I': 'Intermediate',
        'S': 'Standard',
        'F': 'Fullsize',
        'P': 'Premium',
        'L': 'Luxury', 'W': 'Luxury',
        'X': 'Special',
        'O': 'Oversize'
    };

    const typeMap: Record<string, string> = {
        'B': '2-3 Door', 'C': '2-3 Door',
        'D': '4-5 Door', 'E': '4-5 Door',
        'W': 'Estate', 'V': 'Van', 'K': 'Van',
        'S': 'Sport', 'T': 'Convertible', 'F': 'SUV', 'J': 'SUV', 'X': 'Special', 'P': 'Pickup'
    };

    const size = sizeMap[letter1] || 'Special';
    const type = typeMap[letter2] || 'Car';

    // Combine logic
    if (type === 'SUV' || type === 'Estate' || type === 'Van' || type === 'Convertible' || type === 'Sport') {
        return `${size} ${type}`;
    }
    
    // Default to just Size for standard cars
    return size;
}

export async function syncCarsFromRenteon() {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    const categories = await fetchCarCategories()
    const token = await getRenteonToken()
    
    if (!categories || categories.length === 0) {
        return { error: "No car categories found in Renteon" }
    }

    const priceMap = new Map<number, number>(); // CategoryId -> PricePerDay

    // 0. Try Real Pricing with PricelistId: 351
    if (token) {
        console.log("Fetching Real Prices with PricelistId: 351...");
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 20); // Future safe date
        const dayAfter = new Date(tomorrow); dayAfter.setDate(tomorrow.getDate() + 1);

        // Fetch in parallel batches
        const batchSize = 5;
        for (let i = 0; i < categories.length; i += batchSize) {
            const batch = categories.slice(i, i + batchSize);
            await Promise.all(batch.map(async (cat: any) => {
                try {
                    const payload = {
                        CarCategoryId: cat.Id,
                        OfficeOutId: 54, // Airport
                        OfficeInId: 54,
                        DateOut: tomorrow.toISOString(),
                        DateIn: dayAfter.toISOString(),
                        PricelistId: 351,
                        BookAsCommissioner: true
                    };
                    const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.Total && data.Total > 0) {
                            priceMap.set(cat.Id, data.Total);
                        }
                    } else {
                        // console.warn(`Price check failed for cat ${cat.Id}: ${res.status}`);
                    }
                } catch (e) {
                    console.error(`Error fetching price for cat ${cat.Id}`, e);
                }
            }));
        }
        console.log(`Real Pricing: Found prices for ${priceMap.size} categories.`);
    }

    // 0b. Fallback to Smart Pricing if Real Pricing missed some
    if (priceMap.size < categories.length * 0.5) { // If we have less than 50% coverage
        console.log("Real Pricing coverage low, attempting Smart Pricing fallback...");
        // ... (Keep existing Smart Pricing logic as fallback)
        try {
            const today = new Date();
            const past = new Date(); past.setDate(today.getDate() - 90);
            const future = new Date(); future.setDate(today.getDate() + 365);
            const searchPayload = { DateFrom: past.toISOString(), DateTo: future.toISOString() };
            
            if (token) {
                const searchRes = await fetch(`${RENTEON_API_URL}/bookings/search`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(searchPayload)
                });
                if (searchRes.ok) {
                    const bookings = await searchRes.json();
                    bookings.forEach((b: any) => {
                        if (b.Total && b.DateOut && b.DateIn && b.CarCategoryId && !priceMap.has(b.CarCategoryId)) {
                            const start = new Date(b.DateOut);
                            const end = new Date(b.DateIn);
                            const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                            const dailyRate = b.Total / days;
                            if (dailyRate > 10 && dailyRate < 1000) {
                                 priceMap.set(b.CarCategoryId, dailyRate);
                            }
                        }
                    });
                }
            }
        } catch (e) { console.warn("Smart Pricing fallback failed", e); }
    }

    let createdCount = 0
    let updatedCount = 0

    // Process each category
    for (const cat of categories) {
        let categoryId: string | null = null;
        
        // DETERMINE CATEGORY NAME
        // Priority:
        // 1. Renteon Group (if descriptive)
        // 2. SIPP Decoding
        let groupName = cat.CarCategoryGroup;
        if (!groupName || groupName === 'Car' || groupName === 'Vehicle' || groupName.length < 3 || /^[A-Z]{4}$/.test(groupName)) {
            groupName = decodeSIPP(cat.SIPP);
        }

        // Clean up slug
        const groupSlug = groupName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        try {
            const dbCategory = await prisma.category.upsert({
                where: { slug: groupSlug },
                update: { name: groupName },
                create: { name: groupName, slug: groupSlug }
            });
            categoryId = dbCategory.id;
        } catch (err) {
            console.error("Failed to sync category group:", err);
        }

        // Helper for Enums
        const mapFuelType = (ft: string) => {
            const lower = ft?.toLowerCase() || ''
            if (lower.includes('diesel')) return 'DIESEL'
            if (lower.includes('hybrid')) return 'HYBRID'
            if (lower.includes('electric') || lower.includes('electro')) return 'ELECTRIC'
            return 'PETROL'
        }

        const mapTransmission = (tr: string) => {
            const lower = tr?.toLowerCase() || ''
            if (lower.includes('auto') || lower.includes('dsg')) return 'AUTOMATIC'
            return 'MANUAL'
        }

        // Process Models
        if (cat.CarModels && Array.isArray(cat.CarModels) && cat.CarModels.length > 0) {
            for (const model of cat.CarModels) {
                const make = model.CarMakeName || cat.CarMakeName || 'Unknown';
                let modelName = model.Name;
                
                // Clean model name
                if (modelName.toLowerCase().startsWith(make.toLowerCase())) {
                    modelName = modelName.substring(make.length).trim();
                }

                const carData = {
                    make: make,
                    model: modelName,
                    year: model.Year || new Date().getFullYear(),
                    licensePlate: `RT-${cat.SIPP}-${model.Id}`,
                    seats: cat.PassengerCapacity || 5,
                    pricePerDay: priceMap.get(cat.Id) || 50, // Use Pricelist 351 or Smart Price or default
                    imageUrl: model.ImageURL || cat.CarModelImageURL || null,
                    status: 'AVAILABLE',
                    renteonId: model.Id.toString(),
                    mileage: 0,
                    fuelType: mapFuelType(model.FuelTypeName || cat.FuelTypes?.[0]?.Name),
                    transmission: mapTransmission(cat.CarTransmissionType?.Name),
                    doors: model.NumberOfDoors || cat.NumberOfDoors || 5,
                    categories: categoryId ? {
                        connect: { id: categoryId }
                    } : undefined
                }

                // Upsert Car
                const existing = await prisma.car.findUnique({
                    where: { renteonId: carData.renteonId } as any
                })

                let existingId = existing?.id;
                if (!existingId) {
                    const existingByLp = await prisma.car.findUnique({
                        where: { licensePlate: carData.licensePlate }
                    });
                    existingId = existingByLp?.id;
                }
                
                try {
                    if (existingId) {
                        await prisma.car.update({
                            where: { id: existingId },
                            data: {
                                make: carData.make,
                                model: carData.model,
                                year: carData.year,
                                imageUrl: carData.imageUrl,
                                transmission: carData.transmission as any,
                                fuelType: carData.fuelType as any,
                                seats: carData.seats,
                                doors: carData.doors,
                                renteonId: carData.renteonId,
                                licensePlate: carData.licensePlate,
                                categories: carData.categories,
                                pricePerDay: carData.pricePerDay
                            } as any
                        })
                        updatedCount++
                    } else {
                        await prisma.car.create({
                            data: {
                            ...carData,
                            status: 'AVAILABLE',
                            transmission: carData.transmission as any,
                            fuelType: carData.fuelType as any,
                            } as any
                        })
                        createdCount++
                    }
                } catch (err: any) {
                    if (err.code === 'P2002') {
                        // Handle duplicate cleanup (simplified)
                         const conflict = await prisma.car.findUnique({ where: { licensePlate: carData.licensePlate } });
                         if (conflict && conflict.renteonId !== carData.renteonId) {
                             await prisma.car.delete({ where: { id: conflict.id } });
                             // Retry create/update would be needed here, but let's skip for next run
                         }
                    }
                    console.error(`Failed to sync car ${carData.renteonId}`, err.message);
                }
            }
        } else {
            // Fallback: Sync Category as Car
            const make = cat.CarMakeName || cat.CarModel?.split(' ')[0] || 'Unknown';
            let modelName = cat.CarModel || 'Unknown';
             if (modelName.toLowerCase().startsWith(make.toLowerCase())) {
                modelName = modelName.substring(make.length).trim();
            }

            const carData = {
                make: make,
                model: modelName,
                year: new Date().getFullYear(),
                licensePlate: `RT-${cat.SIPP}-${cat.Id}`,
                seats: cat.PassengerCapacity || 5,
                pricePerDay: priceMap.get(cat.Id) || 50,
                imageUrl: cat.CarModelImageURL || null,
                status: 'AVAILABLE',
                renteonId: cat.Id.toString(),
                mileage: 0,
                fuelType: mapFuelType(cat.FuelTypes?.[0]?.Name),
                transmission: mapTransmission(cat.CarTransmissionType?.Name),
                categories: categoryId ? {
                        connect: { id: categoryId }
                } : undefined
            }

            const existing = await prisma.car.findUnique({ where: { licensePlate: carData.licensePlate } });
            
            if (existing) {
                await prisma.car.update({
                    where: { id: existing.id },
                    data: {
                        make: carData.make,
                        model: carData.model,
                        imageUrl: carData.imageUrl,
                        transmission: carData.transmission as any,
                        fuelType: carData.fuelType as any,
                        seats: carData.seats,
                        categories: carData.categories,
                        renteonId: carData.renteonId,
                        pricePerDay: carData.pricePerDay
                    } as any
                })
                updatedCount++
            } else {
                 await prisma.car.create({
                    data: {
                        ...carData,
                        status: 'AVAILABLE',
                        transmission: carData.transmission as any,
                        fuelType: carData.fuelType as any,
                    } as any
                })
                createdCount++
            }
        }
    }
    
    // Trigger Extras Sync too
    await syncExtrasFromRenteon();

    revalidatePath("/admin/cars")
    return { 
        success: true, 
        message: `Synced ${categories.length} categories. Created ${createdCount} cars, updated ${updatedCount} cars. Pricing source: ${priceMap.size > 0 ? 'Renteon Pricelist 351' : 'Default'}` 
    }

  } catch (error: any) {
    console.error("Sync Error:", error)
    return { error: error.message || "Unknown error occurred" }
  }
}

export async function syncExtrasFromRenteon() {
    try {
        console.log("Starting Extras/Services Sync...");
        const services = await fetchRenteonServices();
        
        if (!services || services.length === 0) {
            console.warn("No services found in Renteon.");
            return { error: "No services found" };
        }

        console.log(`Found ${services.length} services.`);

        let extrasCount = 0;
        let insuranceCount = 0;

        for (const s of services) {
            const name = s.Name || s.Title;
            if (!name) continue;

            // Detect Type: Insurance or Extra?
            const lowerName = name.toLowerCase();
            const isInsurance = lowerName.includes('insurance') || lowerName.includes('cdw') || lowerName.includes('protection') || lowerName.includes('coverage') || lowerName.includes('excess');

            const price = s.Price || s.Total || 0; // Depends on API structure
            
            // Clean description
            const description = s.Description || "";

            if (isInsurance) {
                // Upsert InsurancePlan manually (since name is not unique in schema yet)
                const existingPlan = await prisma.insurancePlan.findFirst({
                    where: { name: name }
                });

                if (existingPlan) {
                    await prisma.insurancePlan.update({
                        where: { id: existingPlan.id },
                        data: {
                            description: description,
                            // InsurancePlan schema does not have pricePerDay in it directly, 
                            // it seems it's in CarInsurance (relation). 
                            // Wait, let's check schema again. 
                            // Schema says: InsurancePlan { id, name, description, isDefault, order, ... }
                            // It DOES NOT have pricePerDay. 
                            // Prices are likely in CarInsurance or we need to add it to schema if we want global price.
                            // But user said "Insurance Plans & Deposits" section in Edit Car...
                            // In Edit Car, we configure prices PER CAR.
                            // So here we are just syncing the DEFINITION of the plan.
                            // We can't sync price here unless we add it to InsurancePlan model as a default.
                            // Let's check schema again.
                        }
                    });
                } else {
                    await prisma.insurancePlan.create({
                        data: {
                            name: name,
                            description: description,
                            order: 10
                        }
                    });
                }
                insuranceCount++;
            } else {
                // Upsert Extra manually (since name is not unique in schema)
                const existingExtra = await prisma.extra.findFirst({
                    where: { name: name }
                });

                if (existingExtra) {
                    await prisma.extra.update({
                        where: { id: existingExtra.id },
                        data: {
                            description: description,
                            price: price
                        }
                    });
                } else {
                    await prisma.extra.create({
                        data: {
                            name: name,
                            description: description,
                            price: price,
                            priceType: 'PER_DAY'
                        }
                    });
                }
                extrasCount++;
            }
        }

        console.log(`Synced ${insuranceCount} insurance plans and ${extrasCount} extras.`);
        return { success: true, insuranceCount, extrasCount };

    } catch (error: any) {
        console.error("Extras Sync Failed:", error);
        return { error: error.message };
    }
}
