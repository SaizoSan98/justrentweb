
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

export async function syncPrices() {
    console.log("Starting Price Sync from Renteon...");
    const token = await getRenteonToken();
    
    // Fetch all cars from DB
    const cars = await prisma.car.findMany({
        where: { renteonId: { not: null } }
    });
    
    console.log(`Found ${cars.length} cars to update prices.`);
    
    // We need to fetch Categories to map ID -> Category ID if needed, 
    // BUT we can also calculate price using the same logic as insurance:
    // Make a dummy booking calculation for 1 day, 3 days, 7 days, 30 days to get pricing tiers.
    
    // OR we can check if Renteon has a Pricelist endpoint we can use.
    // Let's use the robust "Calculate" method for a representative duration (e.g. 3 days)
    // and set the base pricePerDay.
    
    // Also, we need to map Car -> Category ID for the calculation payload.
    // We can fetch categories once.
    const categoriesRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
         headers: { 'Authorization': `Bearer ${token}` }
    })
    const categories = await categoriesRes.json();
    const modelToCatId = new Map<string, number>();
    
    // Group fallback map (Category ID -> Group Name)
    const catToGroupMap = new Map<number, string>();
    const groupToCatsMap = new Map<string, number[]>();

    categories.forEach((cat: any) => {
        if (cat.CarModels) {
            cat.CarModels.forEach((m: any) => {
                modelToCatId.set(m.Id.toString(), cat.Id);
            });
        }
        // Also map representative model if no submodels
        modelToCatId.set(cat.Id.toString(), cat.Id); // Fallback if renteonId is catId
        
        // Group logic
        const insGroup = cat.Groups?.find((g: any) => g.TypeName === 'Insurance');
        const groupName = insGroup ? insGroup.Name : 'UNKNOWN';
        catToGroupMap.set(cat.Id, groupName);
        if (!groupToCatsMap.has(groupName)) groupToCatsMap.set(groupName, []);
        groupToCatsMap.get(groupName)?.push(cat.Id);
    });
    
    // Manual overrides for missing models
    modelToCatId.set("504", 371); // XC90
    modelToCatId.set("579", 330); // OMODA
    
    for (const car of cars) {
        if (!car.renteonId) continue;
        
        let catId = modelToCatId.get(car.renteonId);
        
        if (!catId) {
            // Try to guess from DB or skip
            console.warn(`[Car ${car.id}] No Category ID found for Model ID ${car.renteonId}`);
            continue;
        }
        
        // Calculate price for 1 day to get base rate
        // We use a future date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 60);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3); // 3 days for safer availability
        
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
        
        let price = 0;
        let success = false;

        try {
            const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.Total) {
                    price = data.Total / 3; // Total for 3 days -> 1 day
                    success = true;
                }
            } else {
                // Try Fallback Group Logic if 422
                const groupName = catToGroupMap.get(catId);
                if (groupName) {
                    console.log(`[Car ${car.id}] Failed. Trying Group '${groupName}' price...`);
                    // Use a known working cat from group (e.g. Midi -> 293)
                    // We found 329 works for Midi? 
                    // Let's iterate through all cats in group until one works
                    const catsInGroup = groupToCatsMap.get(groupName) || [];
                    
                    for (const fallbackCatId of catsInGroup) {
                        if (fallbackCatId === catId) continue;
                        
                        payload.CarCategoryId = fallbackCatId;
                        const res2 = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        
                        if (res2.ok) {
                            const data2 = await res2.json();
                            if (data2.Total) {
                                price = data2.Total / 3;
                                success = true;
                                console.log(` -> Found fallback price from Cat ${fallbackCatId}: ${price.toFixed(2)} EUR`);
                                break; // Found one!
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error fetching price for ${car.id}:`, e);
        }

        if (success && price > 0) {
            await prisma.car.update({
                where: { id: car.id },
                data: { pricePerDay: price }
            });
            console.log(`Updated ${car.make} ${car.model} price to ${price} EUR`);
        } else {
            console.log(`Could not find price for ${car.make} ${car.model}`);
        }
    }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    syncPrices()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
}
