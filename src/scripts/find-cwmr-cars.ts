
import { config } from "dotenv";
import crypto from 'crypto';

config();

const RENTEON_BASE_URL = 'https://justrentandtrans.s11.renteon.com/en';
const RENTEON_TOKEN_URL = `${RENTEON_BASE_URL}/token`;
const RENTEON_API_URL = `${RENTEON_BASE_URL}/api`;

async function getRenteonToken(): Promise<string> {
    const clientId = process.env.RENTEON_CLIENT_ID || 'Inhouse.Web';
    const clientSecret = process.env.RENTEON_CLIENT_SECRET || '2016-Web';
    const username = process.env.RENTEON_USERNAME || 'Web01';
    const password = process.env.RENTEON_PASSWORD || '0pp.4fgt!RtZZ1';

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

async function findCarsInCWMR() {
    const token = await getRenteonToken();

    // Attempt to fetch specific cars
    const res = await fetch(`${RENTEON_API_URL}/cars`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const cars = await res.json();

    if (Array.isArray(cars)) {
        const cwmrCars = cars.filter((car: any) => car.CarCategoryId === 409);
        if (cwmrCars.length > 0) {
            console.log(`✅ Találtam ${cwmrCars.length} autót a CWMR (409) kategóriában:`);
            cwmrCars.forEach((c: any) => console.log(`   - ${c.Make} ${c.Model} (Rendszám: ${c.PlateNumber})`));
        } else {
            console.log("❌ Nincsenek autók a CWMR kategóriában a /cars válaszban.");
            // Try searching for ID 409 in raw results
            console.log("Searching for ID 409 in all categories again with details...");
            const catRes = await fetch(`${RENTEON_API_URL}/carCategories/409`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (catRes.ok) {
                const detail = await catRes.json();
                console.log("CWMR Detail:", JSON.stringify(detail, null, 2));
            }
        }
    } else {
        console.log("❌ Nem sikerült lekérni az autókat.");
    }
}

findCarsInCWMR().catch(console.error);
