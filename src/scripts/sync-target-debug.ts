
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

async function syncSpecificCategories(ids: number[]) {
    const token = await getRenteonToken();
    const catRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await catRes.json();

    const targetCats = categories.filter((c: any) => ids.includes(c.Id));
    console.log(`Syncing ${targetCats.length} target categories...`);

    for (const cat of targetCats) {
        console.log(`\nSyncing ${cat.SIPP} (ID: ${cat.Id})...`);
        // Simulating the price fetch and insurance fetch logic from renteon-sync.ts
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 2);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3);

        const payload = {
            CarCategoryId: cat.Id,
            OfficeOutId: 54,
            OfficeInId: 54,
            DateOut: startDate.toISOString(),
            DateIn: endDate.toISOString(),
            Currency: "EUR",
            BookAsCommissioner: true,
            PricelistId: 453
        };

        const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            console.log(`   ✅ Price found: ${data.Total}`);

            const models = cat.CarModels || [];
            if (models.length === 0) {
                console.log("   ❌ NO MODELS found in category models list.");
            } else {
                models.forEach((m: any) => console.log(`   🚗 Model: ${m.Name} (ID: ${m.Id})`));
            }
        } else {
            console.log(`   ❌ Calculation failed for ${cat.SIPP}: ${res.status}`);
        }
    }
}

syncSpecificCategories([409, 411]).catch(console.error);
