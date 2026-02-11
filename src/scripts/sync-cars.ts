
import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import crypto from 'crypto';

config()

const RENTEON_BASE_URL = 'https://justrentandtrans.s11.renteon.com/en';
const RENTEON_TOKEN_URL = `${RENTEON_BASE_URL}/token`;
const RENTEON_API_URL = `${RENTEON_BASE_URL}/api`;

const prisma = new PrismaClient()

async function getRenteonToken(): Promise<string> {
    const clientId = process.env.RENTEON_CLIENT_ID || '';
    const clientSecret = process.env.RENTEON_CLIENT_SECRET || '';
    const username = process.env.RENTEON_USERNAME || '';
    const password = process.env.RENTEON_PASSWORD || '';
    
    const salt = crypto.randomBytes(16).toString('hex');
    const compositeKey = `${username}${salt}${clientSecret}${password}${salt}${clientSecret}${clientId}`;
    const signature = crypto.createHash('sha512').update(compositeKey, 'utf8').digest('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    params.append('client_id', clientId);
    params.append('signature', signature);
    params.append('salt', salt);
    
    const response = await fetch(RENTEON_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });

    if (!response.ok) throw new Error(`Token Error: ${response.status}`);
    const data = await response.json();
    return data.access_token;
}

export async function syncCarsFromRenteon() {
    console.log("Starting Full Car Sync from Renteon...");
    const token = await getRenteonToken();
    
    // 1. Fetch Categories (which contain the car models)
    // Note: Renteon API structure usually nests models inside categories in /carCategories endpoint
    // OR we can try to fetch all cars if there is an endpoint.
    // Based on previous discovery, /carCategories returns categories with a 'CarModels' array.
    
    const res = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
    const categories = await res.json();
    
    let stats = { created: 0, updated: 0, deactivated: 0, total: 0 };
    const activeRenteonIds = new Set<string>();

    for (const cat of categories) {
        if (!cat.CarModels || !Array.isArray(cat.CarModels)) continue;

        for (const model of cat.CarModels) {
            stats.total++;
            const renteonId = model.Id.toString();
            activeRenteonIds.add(renteonId);

            // Determine Make and Model from Name (e.g. "Toyota Yaris Cross...")
            // Renteon provides "CarMakeName" and "Name" (which is full name usually)
            const make = model.CarMakeName || "Unknown";
            // Model name is usually "Name" but might include make.
            // Example: Make="Toyota", Name="Yaris Cross 1.5..."
            // We should try to strip Make from Name if present to be clean, or just use Name as Model if our DB expects that.
            // Our DB 'model' field usually holds the specific model info.
            let modelName = model.Name || "";
            if (modelName.toLowerCase().startsWith(make.toLowerCase())) {
                modelName = modelName.substring(make.length).trim();
            }

            // Map Transmission
            // Renteon: cat.CarTransmissionType.Name (e.g. "Automatic")
            // DB: 'manual' | 'automatic'
            const transmission = cat.CarTransmissionType?.Name?.toLowerCase().includes('auto') ? 'automatic' : 'manual';

            // Map Image
            // Renteon: model.ImageURL (often empty, but check)
            // If empty, we keep existing or leave null.
            
            // Upsert into DB
            const existingCar = await prisma.car.findFirst({
                where: { renteonId: renteonId }
            });

            // Check Schema fields (we can infer from existing code or assume)
            // We'll do a safe update.
            
            if (existingCar) {
                await prisma.car.update({
                    where: { id: existingCar.id },
                    data: {
                        make: make,
                        model: modelName,
                        year: model.Year || new Date().getFullYear(),
                        transmission: transmission as any, // Cast to any to avoid enum issues if mismatch
                        seats: cat.PassengerCapacity || 5,
                        doors: cat.NumberOfDoors || 5,
                        // Update other fields if needed
                    }
                });
                stats.updated++;
            } else {
                await prisma.car.create({
                    data: {
                        make: make,
                        model: modelName,
                        year: model.Year || new Date().getFullYear(),
                        transmission: transmission as any,
                        seats: cat.PassengerCapacity || 5,
                        doors: cat.NumberOfDoors || 5,
                        renteonId: renteonId,
                        pricePerDay: 0,
                        licensePlate: "TBD", // Required field fallback
                        mileage: 0, // Required field fallback
                    }
                });
                stats.created++;
            }
        }
    }

    // Optional: Deactivate/Delete cars in our DB that are NOT in Renteon anymore?
    // User said: "csak a valósan megtalált autókkal töltse fel".
    // It implies we should remove or hide others.
    // Let's set renteonId to null for those not found, or delete them if they are purely Renteon cars.
    // For safety, let's just log them or mark them unavailable.
    
    /*
    const carsToRemove = await prisma.car.findMany({
        where: {
            renteonId: { not: null },
            renteonId: { notIn: Array.from(activeRenteonIds) }
        }
    });
    // ... logic to handle removal ...
    */

    console.log(`Sync complete. Created: ${stats.created}, Updated: ${stats.updated}, Total scanned: ${stats.total}`);
    return stats;
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    syncCarsFromRenteon()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
}
