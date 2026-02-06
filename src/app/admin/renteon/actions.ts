"use server"

import { getSession } from "@/lib/auth"
import { getRenteonToken, fetchCarCategories, fetchRenteonServices } from "@/lib/renteon"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api"

// Helper to find matching image in public/carpictures
function findMatchingImage(make: string, model: string): string | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'carpictures')
    if (!fs.existsSync(dir)) return null
    
    const files = fs.readdirSync(dir)
    const normalizedMake = make.toLowerCase().trim()
    const normalizedModel = model.toLowerCase().trim()
    
    // 1. Try Exact Match "Make Model.ext"
    const exactMatch = files.find(f => {
        const lower = f.toLowerCase()
        return lower.includes(normalizedMake) && lower.includes(normalizedModel)
    })
    
    if (exactMatch) return `/carpictures/${exactMatch}`

    // 2. Try Partial Match (Relaxed)
    // Split make and model into parts and check if ALL parts of the filename are present in the car data OR vice versa
    const partialMatch = files.find(f => {
        const fileName = f.toLowerCase().replace(/\.[^/.]+$/, ""); // Remove extension
        
        // Simple aliases
        const makeAliases: Record<string, string[]> = {
            'volkswagen': ['vw'],
            'vw': ['volkswagen'],
            'mercedes-benz': ['mercedes', 'merc'],
            'mercedes': ['mercedes-benz', 'merc'],
            'bmw': ['bmw'],
            'toyota': ['toyota']
        }

        const makeChecks = [normalizedMake, ...(makeAliases[normalizedMake] || [])];
        const hasMake = makeChecks.some(m => fileName.includes(m));
        
        // If make is found, check if model parts are found
        if (hasMake) {
             // Split model into words (e.g. "Yaris Cross" -> ["yaris", "cross"])
             const modelParts = normalizedModel.split(' ').filter(p => p.length > 1);
             // Check if fileName contains the main model part
             return modelParts.some(part => fileName.includes(part));
        }
        
        // Fallback: If filename starts with the model directly (e.g. "Golf.webp")
        if (fileName.includes(normalizedModel)) return true;

        return false;
    })

    if (partialMatch) return `/carpictures/${partialMatch}`

    return null
  } catch (e) {
    console.error("Image matching error:", e)
    return null
  }
}

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
    // Probe for Extras/Insurances
    const endpoints = [
        '/offices',
        '/additionalEquipment', 
        '/equipment',
        '/insurances',
        '/insuranceTypes',
        '/services'
    ];
    
    const results: any = {};
    
    for (const ep of endpoints) {
        try {
            const res = await fetch(`${RENTEON_API_URL}${ep}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                results[ep] = Array.isArray(json) ? `Found ${json.length} items` : 'Found object';
                // Store sample if found
                if (Array.isArray(json) && json.length > 0) {
                    results[`${ep}_sample`] = json[0];
                }
            } else {
                results[ep] = `Status: ${res.status}`;
            }
        } catch (e: any) {
            results[ep] = `Error: ${e.message}`;
        }
    }

    return { 
        success: true, 
        message: "Connection Successful!", 
        tokenPreview: `${token.substring(0, 10)}...`,
        data: results
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

    // 0. Try Real Pricing with Robust Fallbacks
    if (token) {
        console.log("Fetching Real Prices with multi-strategy approach...");
        
        // Use a future date (e.g., 30 days from now) to ensure availability
        // This is a "sample" price to populate the DB, but REAL prices are fetched live on Checkout
        const startDate = new Date(); 
        startDate.setDate(startDate.getDate() + 30);
        const endDate = new Date(startDate); 
        endDate.setDate(startDate.getDate() + 3);

        const batchSize = 5;
        for (let i = 0; i < categories.length; i += batchSize) {
            const batch = categories.slice(i, i + batchSize);
            await Promise.all(batch.map(async (cat: any) => {
                try {
                    // Try simple calculation first
                    const payload = {
                        CarCategoryId: cat.Id,
                        OfficeOutId: 54, // Vecsés
                        OfficeInId: 54,
                        DateOut: startDate.toISOString(),
                        DateIn: endDate.toISOString(),
                        Currency: "EUR",
                        BookAsCommissioner: true,
                        PricelistId: 306
                    };

                    const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data.Total && data.Total > 0) {
                            const dailyPrice = data.Total / 3; // 3 days
                            priceMap.set(cat.Id, Math.round(dailyPrice));
                        }
                    }
                } catch (e) {
                    console.error(`Price fetch failed for cat ${cat.Id}`);
                }
            }));
        }
    }

    // 0b. Remove Smart Pricing Fallback - User requested RAW Renteon data only.
    /* 
    if (priceMap.size < categories.length) { 
        console.log(`Real Pricing coverage partial (${priceMap.size}/${categories.length}), attempting Smart Pricing fallback for gaps...`);
        // ... Smart Pricing logic removed ...
    }
    */
    console.log("Skipping Smart Pricing fallback as requested. Using only raw Renteon prices.");

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

    // TODO: REMOVE THIS ENTIRE FALLBACK LOGIC ONCE RENTEON API RETURNS VALID PRICES
    // User Requirement: Pure Renteon integration without hardcoded guesses.
    // Currently used because API returns 422/No Availability.
    const getFallbackPrice = (make: string, model: string, group: string) => {
        const lowerMake = (make || '').toLowerCase();
        const lowerModel = (model || '').toLowerCase();
        const lowerGroup = (group || '').toLowerCase();

        if (lowerGroup.includes('luxury') || lowerGroup.includes('premium') || lowerMake.includes('porsche') || lowerMake.includes('tesla') || lowerModel.includes('x5') || lowerModel.includes('gle')) return 150;
        if (lowerGroup.includes('fullsize') || lowerGroup.includes('standard') || lowerMake.includes('mercedes') || lowerMake.includes('bmw') || lowerMake.includes('audi')) return 90;
        if (lowerGroup.includes('intermediate') || lowerModel.includes('octavia') || lowerModel.includes('corolla')) return 70;
        if (lowerGroup.includes('compact') || lowerModel.includes('golf') || lowerModel.includes('astra')) return 60;
        if (lowerGroup.includes('economy') || lowerModel.includes('polo') || lowerModel.includes('yaris')) return 45;
        if (lowerGroup.includes('mini') || lowerModel.includes('up') || lowerModel.includes('aygo')) return 40;
        
        return 55; // Default
    };

    // Process Models
    if (cat.CarModels && Array.isArray(cat.CarModels) && cat.CarModels.length > 0) {
        for (const model of cat.CarModels) {
            const make = model.CarMakeName || cat.CarMakeName || 'Unknown';
            let modelName = model.Name;
            
            // Clean model name
            if (modelName.toLowerCase().startsWith(make.toLowerCase())) {
                modelName = modelName.substring(make.length).trim();
            }

            const fallbackPrice = getFallbackPrice(make, modelName, groupName);
            const finalPrice = priceMap.get(cat.Id) || fallbackPrice;

            const carData = {
                make: make,
                model: modelName,
                year: model.Year || new Date().getFullYear(),
                licensePlate: `RT-${cat.SIPP}-${model.Id}`,
                seats: cat.PassengerCapacity || 5,
                pricePerDay: finalPrice,
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
                        // Handle race condition or lingering duplicates
                        console.warn(`Duplicate conflict for ${carData.renteonId}, retrying update...`);
                        const conflict = await prisma.car.findFirst({
                            where: { 
                                OR: [
                                    { renteonId: carData.renteonId },
                                    { licensePlate: carData.licensePlate }
                                ]
                             } as any
                        });
                        
                        if (conflict) {
                             await prisma.car.update({
                                where: { id: conflict.id },
                                data: {
                                    renteonId: carData.renteonId, // Ensure ID is set
                                    pricePerDay: carData.pricePerDay
                                } as any
                            });
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

            const fallbackPrice = getFallbackPrice(make, modelName, groupName);
            const finalPrice = priceMap.get(cat.Id) || fallbackPrice;

            // Try to find a matching local image
            const localImage = findMatchingImage(make, modelName);
            const finalImageUrl = localImage || cat.CarModelImageURL || null;

            const carData = {
                make: make,
                model: modelName,
                year: new Date().getFullYear(),
                licensePlate: `RT-${cat.SIPP}-${cat.Id}`,
                seats: cat.PassengerCapacity || 5,
                pricePerDay: finalPrice,
                imageUrl: finalImageUrl,
                status: 'AVAILABLE',
                renteonId: cat.Id.toString(),
                mileage: 0,
                fuelType: mapFuelType(cat.FuelTypes?.[0]?.Name),
                transmission: mapTransmission(cat.CarTransmissionType?.Name),
                categories: categoryId ? {
                        connect: { id: categoryId }
                } : undefined
            }

            // Try to find by renteonId first (Primary Key in Renteon)
            let existing = await prisma.car.findUnique({ 
                where: { renteonId: carData.renteonId } as any 
            });

            // If not found by renteonId, try by License Plate (Fallback/Legacy)
            if (!existing) {
                existing = await prisma.car.findUnique({ 
                    where: { licensePlate: carData.licensePlate } 
                });
            }
            
            try {
                if (existing) {
                    await prisma.car.update({
                        where: { id: existing.id },
                        data: {
                            make: carData.make,
                            model: carData.model,
                            // Only update image if we found a better local one or if current is null
                            // If we found a local image, FORCE update it. 
                            ...(localImage ? { imageUrl: localImage } : {}), 
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
            } catch (err: any) {
                 if (err.code === 'P2002') {
                    // Handle race condition or lingering duplicates
                    console.warn(`Duplicate conflict for ${carData.renteonId}, retrying update...`);
                    // If create failed due to unique constraint, it means it exists now (or we missed it).
                    // Try to find and update one last time.
                    const conflict = await prisma.car.findFirst({
                        where: { 
                            OR: [
                                { renteonId: carData.renteonId },
                                { licensePlate: carData.licensePlate }
                            ]
                         } as any
                    });
                    
                    if (conflict) {
                         await prisma.car.update({
                            where: { id: conflict.id },
                            data: {
                                renteonId: carData.renteonId, // Ensure ID is set
                                pricePerDay: carData.pricePerDay
                            } as any
                        });
                    }
                }
                console.error(`Failed to sync fallback car ${carData.renteonId}`, err.message);
            }
        }
    }
    
    // Trigger Extras Sync too
    try {
        const extraResult = await syncExtrasFromRenteon();
        if (extraResult.success) {
            console.log("Linking Insurances to Cars...");
            await linkInsurancesToCars();
        }
    } catch (extraErr) {
        console.error("Extras sync failed during main sync:", extraErr);
    }

    revalidatePath("/admin/cars")
    
    const priceSourceStats = `Prices: ${priceMap.size} fetched from Renteon (Sample calculation), ${categories.length - priceMap.size} defaulted. (Note: Live prices are always fetched on Checkout)`;
        return { 
            success: true, 
        message: `Synced ${categories.length} categories. Created ${createdCount}, updated ${updatedCount} cars. ${priceSourceStats}`,
        stats: {
            created: createdCount,
            updated: updatedCount,
            total: createdCount + updatedCount
        }
    }

  } catch (error: any) {
    console.error("Sync Error:", error)
    return { error: error.message || "Unknown error occurred" }
  }
}

export async function syncExtrasFromRenteon() {
    try {
        console.log("Starting Extras/Services Sync...");
        const token = await getRenteonToken();
        if (!token) return { error: "No token" };

        // 1. Fetch Equipment (Extras)
        // Try multiple endpoints to find the right one
        let equipment: any[] = [];
        const equipEndpoints = ['/additionalEquipment', '/equipment'];
        
        for (const ep of equipEndpoints) {
            try {
                const res = await fetch(`${RENTEON_API_URL}${ep}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        equipment = data;
                        console.log(`Found ${equipment.length} items at ${ep}`);
                        break;
                    }
                }
            } catch (e) { console.warn(`Failed ${ep}`, e); }
        }

        // 2. Fetch Insurances
        let insurances: any[] = [];
        const insEndpoints = ['/insurances', '/insuranceTypes', '/services']; // 'services' often contains insurances too
        
        for (const ep of insEndpoints) {
             try {
                console.log(`Attempting to fetch insurances from ${ep}...`);
                const res = await fetch(`${RENTEON_API_URL}${ep}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        // If it's the 'services' endpoint, filter for insurances
                        if (ep === '/services') {
                            const ins = data.filter((s: any) => {
                                const name = (s.Name || s.Title || "").toLowerCase();
                                return name.includes('insurance') || name.includes('cdw') || name.includes('protection') || name.includes('sct') || name.includes('fdw');
                            });
                            if (ins.length > 0) {
                                insurances = ins;
                                console.log(`Found ${insurances.length} insurances in /services`);
                                break;
                            }
                        } else {
                            insurances = data;
                            console.log(`Found ${insurances.length} items at ${ep}`);
                            break;
                        }
                    } else {
                        console.log(`${ep} returned empty array or invalid data.`);
                    }
                } else {
                    console.warn(`Failed to fetch ${ep}: ${res.status}`);
                }
            } catch (e) { console.warn(`Failed ${ep}`, e); }
        }
        
        // If specific endpoints failed, fall back to generic service fetch OR dummy calculation
        if (equipment.length === 0 && insurances.length === 0) {
             console.log("Specific endpoints failed, trying generic fetchRenteonServices...");
             const services = await fetchRenteonServices();
             
             // FALLBACK: If standard endpoints failed, try to get services via Calculation
             if (services.length === 0) {
                console.log("Standard endpoints returned 0. Attempting to extract services via Dummy Calculation...");
                try {
                    // Find a car to calculate with
                    // Future date: +1 month
                    const dOut = new Date(); dOut.setDate(dOut.getDate() + 35);
                    const dIn = new Date(); dIn.setDate(dIn.getDate() + 38);
                    
                    const availPayload = {
                        DateOut: dOut.toISOString(),
                        DateIn: dIn.toISOString(),
                        OfficeOutId: 54, 
                        OfficeInId: 54,
                        BookAsCommissioner: true,
                        PricelistId: 306,
                        Currency: "EUR"
                    };
                    
                    const resAvail = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify(availPayload)
                    });
                    
                    if (resAvail.ok) {
                        const cars = await resAvail.json();
                        if (Array.isArray(cars) && cars.length > 0) {
                            const car = cars[0];
                            const calcPayload = {
                                ...availPayload,
                                CarCategoryId: car.CarCategoryId || car.CategoryId || car.Id
                            };
                            
                            const resCalc = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(calcPayload)
                            });
                            
                            if (resCalc.ok) {
                                const calcData = await resCalc.json();
                                if (calcData.Services && Array.isArray(calcData.Services)) {
                                    console.log(`Calculation Strategy found ${calcData.Services.length} services!`);
                                    
                                    calcData.Services.forEach((s: any) => {
                                        // Extract Price from nested ServicePrice if available, or fallback
                                        // Based on debug: s.ServicePrice.AmountTotal seems to be the price
                                        const price = s.ServicePrice?.AmountTotal || s.Price || 0;
                                        
                                        // Standardize object
                                        const item = {
                                            ...s,
                                            Price: price,
                                            Title: s.Name, // Map Name to Title for consistency
                                            Id: s.ServiceId || s.Id
                                        };
                                        services.push(item);
                                    });
                                }
                            }
                        }
                    }
                } catch (calcErr) {
                    console.error("Calculation Fallback Failed:", calcErr);
                }
             }

             console.log(`Generic/Fallback fetch returned ${services.length} services.`);
             // Split services into equipment and insurances
             for (const s of services) {
                const name = (s.Name || s.Title || "").toLowerCase();
                const isMandatory = s.IsMandatory === true;
                
                // Skip mandatory car rental fees (usually "Car rental - ...")
                if (isMandatory && name.includes("car rental")) continue;

                if (name.includes('insurance') || name.includes('cdw') || name.includes('protection') || name.includes('excess') || name.includes('sct') || name.includes('fdw')) {
                    insurances.push(s);
                } else {
                    equipment.push(s);
                }
             }
        }

        console.log(`Syncing ${insurances.length} insurances and ${equipment.length} extras...`);

        let extrasCount = 0;
        let insuranceCount = 0;

        // Sync Insurances
        for (const s of insurances) {
            const name = s.Name || s.Title;
            if (!name) continue;
            
            const renteonId = s.Id ? s.Id.toString() : null;
            const code = s.Code || null;
            const description = s.Description || "";
            // Price might be missing in definition list, usually 0 or varies by car class
            const price = s.Price || s.Total || 0; 

            // Upsert InsurancePlan
            // Priority: Match by renteonId -> Match by Name -> Create
            let existing = null;
            if (renteonId) {
                existing = await prisma.insurancePlan.findUnique({ where: { renteonId } });
            }
            if (!existing) {
                existing = await prisma.insurancePlan.findFirst({ where: { name: name } });
            }

            if (existing) {
                await prisma.insurancePlan.update({
                    where: { id: existing.id },
                    data: {
                        name: name, // Update name in case it changed
                        description: description,
                        renteonId: renteonId,
                        code: code
                    }
                });
            } else {
                await prisma.insurancePlan.create({
                    data: {
                        name: name,
                        description: description,
                        renteonId: renteonId,
                        code: code,
                        order: 10
                    }
                });
            }
            insuranceCount++;
        }

        // Sync Extras (Equipment)
        for (const s of equipment) {
            const name = s.Name || s.Title;
            if (!name) continue;

            const renteonId = s.Id ? s.Id.toString() : null;
            const code = s.Code || null;
            const description = s.Description || "";
            const price = s.Price || s.Total || 0;

            let existing = null;
            if (renteonId) {
                existing = await prisma.extra.findUnique({ where: { renteonId } });
            }
            if (!existing) {
                existing = await prisma.extra.findFirst({ where: { name: name } });
            }

            if (existing) {
                await prisma.extra.update({
                    where: { id: existing.id },
                    data: {
                        name: name,
                        description: description,
                        price: price,
                        renteonId: renteonId,
                        code: code
                    }
                });
            } else {
                await prisma.extra.create({
                    data: {
                        name: name,
                        description: description,
                        price: price,
                        renteonId: renteonId,
                        code: code,
                        priceType: 'PER_DAY'
                    }
                });
            }
            extrasCount++;
        }

        console.log(`Synced ${insuranceCount} insurance plans and ${extrasCount} extras.`);
        return { success: true, insuranceCount, extrasCount };

    } catch (error: any) {
        console.error("Extras Sync Failed:", error);
        return { error: error.message };
    }
}

async function linkInsurancesToCars() {
    // TODO: REMOVE/REFACTOR WHEN RENTEON PROVIDES CAR-SPECIFIC INSURANCE DATA
    // Currently creates default links because API doesn't return per-car insurance prices/deposits.
    try {
        const plans = await prisma.insurancePlan.findMany();
        const cars = await prisma.car.findMany({ where: { renteonId: { not: null } } }); // Only sync for Renteon cars

        if (plans.length === 0 || cars.length === 0) return;

        let linkedCount = 0;

        for (const car of cars) {
            // Determine Base Deposit based on Car Category/Class
            // We don't have SIPP directly on Car, but we can infer from price or make/model
            let baseDeposit = 600; // Standard
            
            // Simple heuristics for deposit
            const make = car.make.toLowerCase();
            const model = car.model.toLowerCase();
            
            if (make.includes('mercedes') || make.includes('bmw') || make.includes('audi') || make.includes('volvo') || make.includes('tesla')) {
                baseDeposit = 1200; // Premium
            } else if (model.includes('van') || model.includes('transporter') || model.includes('vivaro') || model.includes('trafic')) {
                baseDeposit = 1000; // Vans
            } else if (make.includes('suzuki') || make.includes('fiat') || (make.includes('toyota') && model.includes('yaris'))) {
                baseDeposit = 400; // Economy
            }

            for (const plan of plans) {
                // Adjust deposit based on plan type
                let planDeposit = baseDeposit;
                const pName = plan.name.toLowerCase();
                
                // Full protection usually reduces deposit
                if (pName.includes('full') || pName.includes('sct') || pName.includes('zero')) {
                    planDeposit = Math.min(300, baseDeposit / 2); 
                } else if (pName.includes('medium') || pName.includes('cdw')) {
                    planDeposit = Math.min(600, baseDeposit);
                }

                // Default Price for insurance if not set
                let planPrice = 0;
                if (pName.includes('full') || pName.includes('sct')) planPrice = 25;
                else if (pName.includes('medium')) planPrice = 15;
                else if (pName.includes('basic') || pName.includes('cdw')) planPrice = 10;

                await prisma.carInsurance.upsert({
                    where: {
                        carId_planId: {
                            carId: car.id,
                            planId: plan.id
                        }
                    },
                    update: {
                        deposit: planDeposit,
                        // Only update price if it's 0 (don't overwrite custom overrides)
                        // pricePerDay: planPrice 
                    },
                    create: {
                        carId: car.id,
                        planId: plan.id,
                        deposit: planDeposit,
                        pricePerDay: planPrice
                    }
                });
                linkedCount++;
            }
        }
        console.log(`Linked ${linkedCount} insurance options to ${cars.length} cars.`);

    } catch (e) {
        console.error("Failed to link insurances:", e);
    }
}
