
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

async function checkTomorrow() {
    console.log("🔍 Holnapi (2026-03-10) elérhetőség ellenőrzése (Detailed)...\n");

    const token = await getRenteonToken();
    const startDate = new Date("2026-03-10T10:00:00Z");
    const endDate = new Date("2026-03-11T10:00:00Z");

    const catRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await catRes.json();

    const availPayload = {
        DateOut: startDate.toISOString(),
        DateIn: endDate.toISOString(),
        OfficeOutId: 54,
        OfficeInId: 54,
        BookAsCommissioner: true,
        PricelistId: 453,
        Currency: "EUR"
    };

    try {
        const resAvail = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(availPayload)
        });

        if (resAvail.ok) {
            const availableCars = await resAvail.json();
            for (const car of availableCars) {
                if (car.SIPP === 'CWMR') {
                    console.log("DEBUG: Full CWMR Data:", JSON.stringify(car, null, 2));
                }
                const catId = car.CarCategoryId || car.CategoryId;
                const categoryInfo = Array.isArray(categories) ? categories.find((c: any) => c.Id === catId) : null;
                const models = (categoryInfo && categoryInfo.CarModels) ? categoryInfo.CarModels.map((m: any) => m.Name).join(", ") : "Ismeretlen modellek";

                console.log(`🚗 Kategória: ${car.CarCategoryName || categoryInfo?.Name || 'N/A'} (SIPP: ${car.SIPP})`);
                console.log(`   Modellek: ${models}`);
                console.log("------------------------------------------------");
            }
        }
    } catch (e) {
        console.error(e);
    }
}

checkTomorrow().catch(console.error);
