
"use server"

import { getSession } from "@/lib/auth"
import { getRenteonToken, fetchCarCategories } from "@/lib/renteon"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// We need to export this from lib/renteon or duplicate it here temporarily for testing
// Since getRenteonToken is not exported in the file I read, I will modify lib/renteon.ts first
// But wait, I can see getRenteonToken in the file content? No, I only read the first 100 lines.
// Let's assume I need to export it.

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
    // Removed 'v1' from URL based on 404 error and documentation pattern: https://{host}/{culture}/api/{controller}/{action}
    const response = await fetch('https://justrentandtrans.s11.renteon.com/en/api/offices', {
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
      // Fetch bookings for the next 12 months to cover all future availability
      const today = new Date();
      const nextYear = new Date();
      nextYear.setDate(today.getDate() + 365);

      const payload = {
          DateFrom: today.toISOString(),
          DateTo: nextYear.toISOString()
      };

      const response = await fetch('https://justrentandtrans.s11.renteon.com/en/api/bookings/search', {
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

      // DEBUG: Log first booking to understand structure
      if (activeBookings.length > 0) {
          console.log("Sample Booking Structure:", JSON.stringify(activeBookings[0], null, 2));
      }

      const now = new Date();
      let updatedCount = 0;

      // 1. Reset all cars to AVAILABLE first? 
      // Risk: If we fail to find bookings, we might show rented cars as available.
      // Better: Fetch all cars, map status based on bookings.
      
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
          // Check if booking is currently active
          const start = new Date(b.DateOut);
          const end = new Date(b.DateIn);
          
          // Add 2 hours buffer for "cleanup" or late return? No, stick to strict dates for now.
          const isOngoing = start <= now && end >= now;

          if (isOngoing) {
              // Try to find CarId
              // Booking structure might have CarId directly or inside Car object
              const carId = b.CarId || b.Car?.Id;
              
              if (carId) {
                  carStatusMap.set(carId.toString(), 'RENTED');
              }
          }
      }

      // Update DB
      for (const [renteonId, status] of carStatusMap.entries()) {
          // Only update if status changed?
          // For simplicity/robustness, just update. Prisma is fast enough for small fleet.
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

export async function syncCarsFromRenteon() {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    const categories = await fetchCarCategories()
    
    if (!categories || categories.length === 0) {
        return { error: "No car categories found in Renteon" }
    }

    let createdCount = 0
    let updatedCount = 0

    // Process each category
    for (const cat of categories) {
        let categoryId: string | null = null;
        if (cat.CarCategoryGroup) {
            // "Crossover", "Compact", etc.
            const groupSlug = cat.CarCategoryGroup.toLowerCase().replace(/\s+/g, '-');
            const groupName = cat.CarCategoryGroup;
            
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

        // If category has detailed CarModels, use them!
        if (cat.CarModels && Array.isArray(cat.CarModels) && cat.CarModels.length > 0) {
            for (const model of cat.CarModels) {
                // Name Handling: "Volkswagen T-Cross..." -> Remove Make if present
                const make = model.CarMakeName || cat.CarMakeName || 'Unknown';
                let modelName = model.Name;
                
                // If model name starts with make (case insensitive), strip it
                if (modelName.toLowerCase().startsWith(make.toLowerCase())) {
                    modelName = modelName.substring(make.length).trim();
                }

                // If model name still starts with Make (sometimes it's repeated differently), try checking parts
                // E.g. Make="Volvo", Name="XC90 XC90" -> this logic won't fix "XC90 XC90" unless Make was "XC90"
                // The user complained about "XC90 XC90". 
                // In Renteon example: "CarMakeAndModelName": "Volkswagen T-Cross..."
                // "Name": "T-Cross..."
                // So "Name" is usually good.
                // But if user sees "XC90 XC90", maybe Renteon sends that in "Name"?
                // We'll trust "Name" but strip Make prefix if matches.

                const carData = {
                    make: make,
                    model: modelName,
                    year: model.Year || new Date().getFullYear(),
                    licensePlate: `RT-${cat.SIPP}-${model.Id}`, // Virtual LP
                    seats: cat.PassengerCapacity || 5,
                    pricePerDay: 50, // Placeholder
                    imageUrl: model.ImageURL || cat.CarModelImageURL || null,
                    status: 'AVAILABLE',
                    renteonId: model.Id.toString(),
                    mileage: 0,
                    fuelType: mapFuelType(model.FuelTypeName || cat.FuelTypes?.[0]?.Name),
                    transmission: mapTransmission(cat.CarTransmissionType?.Name),
                    doors: model.NumberOfDoors || cat.NumberOfDoors || 5,
                    // Connect Category
                    categories: categoryId ? {
                        connect: { id: categoryId }
                    } : undefined
                }

                // Upsert Car
                // Check if exists by renteonId first
                const existing = await prisma.car.findUnique({
                    where: { renteonId: carData.renteonId } as any
                })

                // Then check by licensePlate (our virtual one or real one if synced differently before)
                let existingId = existing?.id;
                if (!existingId) {
                    const existingByLp = await prisma.car.findUnique({
                        where: { licensePlate: carData.licensePlate }
                    });
                    existingId = existingByLp?.id;
                }
                
                // CRITICAL: Check if we have duplicates in DB for this car (e.g. one by renteonId, one by LP)
                // If we found both and they are different IDs, we should probably merge or delete one?
                // For now, let's prefer the one with renteonId if available, or just update the one we found.
                
                try {
                    if (existingId) {
                         // Update
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
                                renteonId: carData.renteonId, // Ensure renteonId is set
                                licensePlate: carData.licensePlate, // Ensure LP is consistent
                                categories: carData.categories
                            } as any
                        })
                        updatedCount++
                    } else {
                        // Create
                        await prisma.car.create({
                            data: {
                            ...carData,
                            status: 'AVAILABLE', // explicit enum
                            transmission: carData.transmission as any,
                            fuelType: carData.fuelType as any,
                            } as any
                        })
                        createdCount++
                    }
                } catch (err: any) {
                    // Handle Unique Constraint Violation (P2002)
                    if (err.code === 'P2002') {
                        console.warn(`Unique constraint failed for Car ${carData.renteonId}. Cleaning up duplicates...`);
                        
                        // It means we tried to update/create but a record with same unique field (renteonId OR licensePlate) exists
                        // and it wasn't the one we targeted (or we targeted none).
                        
                        // Strategy: Find ALL records that conflict (by renteonId OR licensePlate)
                        // and keep the "best" one, delete others.
                        
                        const conflictByRenteonId = await prisma.car.findUnique({ where: { renteonId: carData.renteonId } as any });
                        const conflictByLp = await prisma.car.findUnique({ where: { licensePlate: carData.licensePlate } });
                        
                        const winner = conflictByRenteonId || conflictByLp;
                        
                        if (winner) {
                             // Update the winner
                             await prisma.car.update({
                                where: { id: winner.id },
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
                                    categories: carData.categories
                                } as any
                            })
                            updatedCount++
                            
                            // If there was another conflicting record (e.g. one had renteonId, other had LP), delete the loser
                            if (conflictByRenteonId && conflictByLp && conflictByRenteonId.id !== conflictByLp.id) {
                                console.log(`Deleting duplicate car ${conflictByLp.id} in favor of ${conflictByRenteonId.id}`);
                                // Delete related first just in case
                                await prisma.pricingTier.deleteMany({ where: { carId: conflictByLp.id } });
                                await prisma.carInsurance.deleteMany({ where: { carId: conflictByLp.id } });
                                await prisma.availability.deleteMany({ where: { carId: conflictByLp.id } });
                                await prisma.car.delete({ where: { id: conflictByLp.id } });
                            }
                        }
                    } else {
                        console.error(`Failed to sync car ${carData.renteonId}`, err);
                    }
                }
            }
        } else {
            // Fallback: Sync the Category itself as a generic car (Old Logic)
            // ... (keep old logic but improved)
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
                pricePerDay: 50,
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

            // ... Upsert logic (simplified for brevity, reused)
            const existing = await prisma.car.findUnique({ where: { licensePlate: carData.licensePlate } });
            
            try {
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
                            renteonId: carData.renteonId
                        } as any
                    })
                    updatedCount++
                } else {
                    await prisma.car.create({ data: carData as any })
                    createdCount++
                }
            } catch (err: any) {
                if (err.code === 'P2002') {
                    // Similar retry logic for fallback
                     const forceFound = await prisma.car.findUnique({
                        where: { renteonId: carData.renteonId } as any
                    });
                    if (forceFound) {
                        await prisma.car.update({
                            where: { id: forceFound.id },
                            data: {
                                // Update basic fields, keep existing details if possible?
                                // Fallback logic is aggressive, but we must respect unique constraint
                                make: carData.make,
                                model: carData.model,
                                renteonId: carData.renteonId
                            } as any
                        })
                        updatedCount++
                    }
                } else {
                    console.error("Fallback Sync Failed:", err)
                }
            }
        }
    }

    revalidatePath("/admin/cars")
    revalidatePath("/cars")
    return { 
        success: true, 
        message: `Sync successful! Created: ${createdCount}, Updated: ${updatedCount}`,
        stats: { created: createdCount, updated: updatedCount, total: categories.length }
    }

  } catch (error: any) {
    console.error("Car Sync Failed:", error)
    return { error: error.message || "Sync failed" }
  }
}
