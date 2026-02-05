
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
        // We use SIPP code or ID as unique identifier
        // Renteon Car Category Structure (based on docs/examples):
        // { Id: 290, CarModel: "VW T-Cross", SIPP: "CGAR", ... }
        
        // Find existing car by Renteon ID (stored in metadata or we can use license plate if available, but categories are abstract)
        // Actually, we are syncing "Car Types" (models) not individual physical cars with license plates here.
        // But our DB 'Car' model represents a physical car OR a model type?
        // In this project, 'Car' seems to be individual cars (licensePlate is unique).
        // Renteon 'CarCategories' are types.
        
        // STRATEGY: We will create/update a "Display Car" for each Renteon Category.
        // We will set licensePlate to something like "RENTEON-{ID}" to avoid conflicts.
        // This is a simplification to get the models on the site.
        
        // Map Renteon Data to Prisma Car Model
        const carData = {
            make: cat.CarMakeName || cat.CarModel?.split(' ')[0] || 'Unknown',
            model: cat.CarModel?.split(' ').slice(1).join(' ') || cat.CarModel || 'Unknown',
            year: 2024, // Default to current year as API might not return it for category
            // color removed as it is not in the schema
            licensePlate: `RT-${cat.SIPP}-${cat.Id}`, // Virtual license plate
            vin: `RT-VIN-${cat.Id}`,
            fuelType: cat.FuelTypes?.[0]?.Name || 'Petrol',
            transmission: cat.CarTransmissionType?.Name || 'Manual',
            seats: cat.PassengerCapacity || 5,
            pricePerDay: 50, // Default, will need real pricing later
            imageUrl: cat.CarModelImageURL || null,
            isAvailable: true,
            renteonId: cat.Id.toString(),
            mileage: 0 // Default mileage for new cars synced from Renteon
        }

        // Check if exists by our virtual license plate
        const existing = await prisma.car.findUnique({
            where: { licensePlate: carData.licensePlate }
        })

        if (existing) {
            await prisma.car.update({
                where: { id: existing.id },
                data: {
                    make: carData.make,
                    model: carData.model,
                    imageUrl: carData.imageUrl,
                    transmission: carData.transmission,
                    fuelType: carData.fuelType,
                    seats: carData.seats
                    // We don't update price/availability blindly to avoid overwriting manual changes
                }
            })
            updatedCount++
        } else {
            await prisma.car.create({
                data: carData
            })
            createdCount++
        }
    }

    revalidatePath("/admin/cars")
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
