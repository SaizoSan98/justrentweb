
import * as fs from 'fs';
import * as path from 'path';
import { getRenteonToken, fetchCarCategories } from '../src/lib/renteon';

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (key && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
}

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api";

async function testPricing() {
    console.log("Starting Pricing Diagnostics...");
    
    // Check Env
    if (!process.env.RENTEON_CLIENT_ID) {
        console.error("Missing RENTEON_CLIENT_ID in env");
        return;
    }

    const token = await getRenteonToken();
    if (!token) {
        console.error("Failed to get token");
        return;
    }
    console.log("Token obtained.");

    const categories = await fetchCarCategories();
    console.log(`Fetched ${categories.length} categories.`);

    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 20);
    const dayAfter = new Date(tomorrow); dayAfter.setDate(tomorrow.getDate() + 1);
    
    // Test Availability Search
    console.log("\n--- Testing General Availability Search ---");
    const searchPayload = {
        DateFrom: tomorrow.toISOString(),
        DateTo: dayAfter.toISOString(),
        OfficeOutId: 54,
        OfficeInId: 54
    };
    
    try {
        const res = await fetch(`${RENTEON_API_URL}/bookings/search`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(searchPayload)
        });
        if (res.ok) {
            const data = await res.json();
            console.log(`Availability Search found ${Array.isArray(data) ? data.length : 0} bookings.`);
            if (Array.isArray(data) && data.length > 0) {
                console.log("Sample Booking:", JSON.stringify(data[0], null, 2));
            }
        } else {
            console.log(`Availability Search Failed: ${res.status} - ${await res.text()}`);
        }
    } catch (e) { console.error("Search error", e); }

    // Test a few categories (first 5)
    const sampleCats = categories.slice(0, 5);
    
    // Future date (6 months)
    const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 180);
    const futureDateEnd = new Date(futureDate); futureDateEnd.setDate(futureDate.getDate() + 3);

    for (const cat of sampleCats) {
        console.log(`\n--- Testing Category: ${cat.CarCategoryGroup} (${cat.SIPP}) [ID: ${cat.Id}] ---`);
        
        const scenarios = [
            {
                name: "Standard (PL 351, Airport, +20 days)",
                payload: {
                    CarCategoryId: cat.Id,
                    OfficeOutId: 54,
                    OfficeInId: 54,
                    DateOut: tomorrow.toISOString(),
                    DateIn: dayAfter.toISOString(),
                    PricelistId: 351,
                    BookAsCommissioner: true,
                    Currency: "EUR"
                }
            },
            {
                name: "Future (PL 351, Airport, +180 days)",
                payload: {
                    CarCategoryId: cat.Id,
                    OfficeOutId: 54,
                    OfficeInId: 54,
                    DateOut: futureDate.toISOString(),
                    DateIn: futureDateEnd.toISOString(),
                    PricelistId: 351,
                    BookAsCommissioner: true,
                    Currency: "EUR"
                }
            },
            {
                name: "No Commissioner",
                payload: {
                    CarCategoryId: cat.Id,
                    OfficeOutId: 54,
                    OfficeInId: 54,
                    DateOut: tomorrow.toISOString(),
                    DateIn: dayAfter.toISOString(),
                    PricelistId: 351,
                    BookAsCommissioner: false,
                    Currency: "EUR"
                }
            },
            {
                name: "Downtown Office (53)",
                payload: {
                    CarCategoryId: cat.Id,
                    OfficeOutId: 53,
                    OfficeInId: 53,
                    DateOut: tomorrow.toISOString(),
                    DateIn: dayAfter.toISOString(),
                    PricelistId: 351,
                    BookAsCommissioner: true,
                    Currency: "EUR"
                }
            },
            {
                name: "No Pricelist ID",
                payload: {
                    CarCategoryId: cat.Id,
                    OfficeOutId: 54,
                    OfficeInId: 54,
                    DateOut: tomorrow.toISOString(),
                    DateIn: dayAfter.toISOString(),
                    BookAsCommissioner: true,
                    Currency: "EUR"
                }
            }
        ];

        // If category has models, try the first model ID
        if (cat.CarModels && cat.CarModels.length > 0) {
            scenarios.push({
                name: `Specific Car Model ID (${cat.CarModels[0].Id})`,
                payload: {
                    CarModelId: cat.CarModels[0].Id,
                    OfficeOutId: 54,
                    OfficeInId: 54,
                    DateOut: tomorrow.toISOString(),
                    DateIn: dayAfter.toISOString(),
                    PricelistId: 351,
                    BookAsCommissioner: true,
                    Currency: "EUR"
                } as any // Cast to any to allow CarModelId
            });
        }

        for (const scenario of scenarios) {
            try {
                const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(scenario.payload)
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.Total > 0) {
                        console.log(`✅ SUCCESS [${scenario.name}]: ${data.Total} EUR`);
                    } else {
                        console.log(`❌ FAILED [${scenario.name}]: Price is 0/Missing`);
                    }
                } else {
                    const errorText = await res.text();
                    console.log(`❌ ERROR [${scenario.name}]: HTTP ${res.status} - ${errorText}`);
                }
            } catch (e) {
                console.log(`❌ EXCEPTION [${scenario.name}]:`, e);
            }
        }
    }
}

testPricing();
