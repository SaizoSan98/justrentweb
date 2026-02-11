
import { PrismaClient } from "@prisma/client"
import crypto from 'crypto';
import { config } from "dotenv"

config() // Load env vars

const prisma = new PrismaClient()
const RENTEON_BASE_URL = 'https://justrentandtrans.s11.renteon.com/en';
const RENTEON_TOKEN_URL = `${RENTEON_BASE_URL}/token`;
const RENTEON_API_URL = `${RENTEON_BASE_URL}/api`;

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// --- Embedded Renteon Lib ---
async function getRenteonToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
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

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Renteon Token Error:', response.status, errorText);
            throw new Error(`Failed to get token: ${response.status}`);
        }

        const data = await response.json();
        cachedToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
        
        return cachedToken as string;
    } catch (error) {
        console.error('Renteon Auth Exception:', error);
        throw error;
    }
}

async function fetchCarCategories(): Promise<any[]> {
    const token = await getRenteonToken();
    if (!token) return [];

    try {
        const response = await fetch(`${RENTEON_API_URL}/carCategories`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch car categories:', await response.text());
            return [];
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Renteon Car Category Fetch Exception:', error);
        return [];
    }
}
// ----------------------------

async function cleanup() {
    console.log("Starting BRUTAL cleanup of insurances...")
    
    // 1. Fetch ALL cars from DB
    const cars = await prisma.car.findMany({
        where: { renteonId: { not: null } },
        include: { insuranceOptions: true }
    })
    
    console.log(`Found ${cars.length} cars with Renteon ID.`)

    // 2. Fetch Categories from Renteon to know which category ID belongs to which car
    const categories = await fetchCarCategories()
    const token = await getRenteonToken()
    
    if (!categories || !token) {
        console.error("Failed to fetch Renteon data.")
        return
    }

    // Map: Car Renteon ID -> Category ID
    const carToCatMap = new Map<string, number>()
    categories.forEach((cat: any) => {
        if (cat.CarModels) {
            cat.CarModels.forEach((model: any) => {
                carToCatMap.set(model.Id.toString(), cat.Id)
            })
        }
        // Also map representative car if no models list
        if (cat.Id) {
             // Fallback: If we can't map exact ID, we might need another way.
             // But usually CarModels is populated.
        }
    })

    // 3. For each category, fetch its VALID services/insurances
    // Map: Category ID -> Set of Valid Service IDs (strings)
    const catToValidServices = new Map<number, any>() // Changed to 'any' to hold Map<serviceId, {price, deposit}>

    // We need to be careful. fetchCarCategories doesn't return services.
    // We must use the calculation trick or assume we have a map.
    // Let's use the same logic as sync: Calculate for each category to get EXACT services.
    
    console.log("Fetching valid services per category...")
    
    // Helper to find valid services with retries on dates
    const fetchServicesForCat = async (catId: number) => {
        const offsets = [30, 60, 90, 120, 180, 240, 300];
        for (const offset of offsets) {
            const startDate = new Date(); 
            startDate.setDate(startDate.getDate() + offset);
            const endDate = new Date(startDate); 
            endDate.setDate(startDate.getDate() + 3);

            const payload = {
                CarCategoryId: catId,
                OfficeOutId: 54, 
                OfficeInId: 54,
                DateOut: startDate.toISOString(),
                DateIn: endDate.toISOString(),
                Currency: "EUR",
                BookAsCommissioner: true,
                PricelistId: 306
            };

            try {
                const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.Services && Array.isArray(data.Services)) {
                        const validServices = new Map<string, any>();
                        data.Services.forEach((s: any) => {
                            const name = (s.Name || "").toLowerCase();
                            if (name.includes('insurance') || name.includes('protect') || name.includes('cdw') || name.includes('sct')) {
                                const id = (s.ServiceId || s.Id).toString();
                                validServices.set(id, {
                                    id: id,
                                    price: (s.ServicePrice?.AmountTotal || 0) / 3,
                                    deposit: s.InsuranceDepositAmount || 0
                                });
                            }
                        });
                        if (validServices.size > 0) return validServices;
                    }
                }
            } catch (e) {
                // Ignore and try next date
            }
        }
        return null;
    }

    // Pre-fetch plans to map Renteon Service ID to DB Plan ID
    const allPlans = await prisma.insurancePlan.findMany();
    const planMap = new Map<string, any>(); // Renteon Service ID -> DB Plan
    allPlans.forEach(p => {
        if (p.renteonId) planMap.set(p.renteonId, p);
    });

    let processedCount = 0;
    
    // Map of fallback categories if primary fails (e.g. 330 -> 329)
    const fallbackCats: Record<number, number> = {
        330: 329, // Large SUV -> Medium SUV (likely same insurances)
        290: 301, // Compact SUV -> Compact (likely same insurances)
        292: 301, // Intermediate -> Compact
        297: 301,
        322: 329,
        370: 329,
        384: 294, // Van -> Van
        348: 330,
        324: 301,
        325: 301,
        298: 301,
        412: 301,
        581: 291
    };

    // Process each car
    for (const car of cars) {
        if (!car.renteonId) continue;
        
        let catId = carToCatMap.get(car.renteonId.toString())
        
        // If not found in map, try to guess or use the car's existing data if we have category stored? 
        // We don't have category in DB Car model usually.
        // But we can try to find it via manual mapping or skipping.
        if (!catId) {
            console.warn(`Skipping Car ${car.make} ${car.model} (ID: ${car.id}) - No Category Map found for RenteonID ${car.renteonId}`)
            continue
        }

        // Get or Fetch valid services for this category
        if (!catToValidServices.has(catId)) {
            console.log(`Fetching services for Category ${catId}...`)
            let validServices = await fetchServicesForCat(catId)
            
            // Fallback if failed
            if (!validServices && fallbackCats[catId]) {
                 const fallbackId = fallbackCats[catId];
                 console.log(`Failed to fetch for ${catId}, trying fallback ${fallbackId}...`);
                 // Ensure fallback is fetched
                 if (!catToValidServices.has(fallbackId)) {
                      const fbServices = await fetchServicesForCat(fallbackId);
                      catToValidServices.set(fallbackId, fbServices);
                 }
                 validServices = catToValidServices.get(fallbackId);
            }

            if (validServices) {
                catToValidServices.set(catId, validServices)
            } else {
                console.error(`Could not fetch valid services for Category ${catId} (tried multiple dates)`)
                catToValidServices.set(catId, null) // Mark as failed
            }
        }

        const validServicesMap = catToValidServices.get(catId)
        
        if (!validServicesMap) {
            console.warn(`Skipping cleanup for Car ${car.id} - No valid services found for Cat ${catId}`)
            continue
        }

        // --- PERFORM SYNC ---
        
        // 1. DELETE invalid insurances
        // Identify which current insurances are NOT in the valid set
        const invalidInsurances = car.insuranceOptions.filter(opt => {
             // Find the plan for this option
             // We need to check if the plan's renteonId matches any valid service ID
             // But opt only has planId. We need to look up the plan.
             // We can do this efficiently by checking if planId corresponds to a valid Renteon Service
             
             // Wait, opt is CarInsurance. We need to know its plan's renteonId.
             // We don't have plan loaded in 'include: { insuranceOptions: true }' - wait, we need 'include: { insuranceOptions: { include: { plan: true } } }'
             // Or we can just use our 'planMap' reversed or look up planId.
             
             // Let's rely on planMap which maps RenteonID -> Plan.
             // We can build a set of Valid Plan IDs for this car.
             return false; // logic placeholder
        });
        
        // Build Valid Plan IDs Set
        const validPlanIds = new Set<string>();
        for (const [serviceId, _] of validServicesMap.entries()) {
            const plan = planMap.get(serviceId);
            if (plan) validPlanIds.add(plan.id);
        }
        
        // Delete where planId is NOT in validPlanIds
        const deleteResult = await prisma.carInsurance.deleteMany({
            where: {
                carId: car.id,
                planId: { notIn: Array.from(validPlanIds) }
            }
        });
        
        if (deleteResult.count > 0) {
            console.log(`[Car ${car.id}] Deleted ${deleteResult.count} invalid insurances.`)
        }

        // 2. UPSERT valid insurances (Add missing, Update existing)
        for (const [serviceId, serviceData] of validServicesMap.entries()) {
            const plan = planMap.get(serviceId);
            if (plan) {
                // Upsert
                await prisma.carInsurance.upsert({
                    where: {
                        carId_planId: {
                            carId: car.id,
                            planId: plan.id
                        }
                    },
                    update: {
                        deposit: serviceData.deposit,
                        pricePerDay: serviceData.price
                    },
                    create: {
                        carId: car.id,
                        planId: plan.id,
                        deposit: serviceData.deposit,
                        pricePerDay: serviceData.price
                    }
                });
                // console.log(`[Car ${car.id}] Synced ${plan.name}`)
            } else {
                console.warn(`[Car ${car.id}] Valid Service ${serviceId} has no corresponding DB Plan!`)
            }
        }
        
        processedCount++;
    }

    console.log(`Cleanup finished. Processed ${processedCount} cars.`)
}

cleanup()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
