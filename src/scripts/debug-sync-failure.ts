
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

async function debugSync(catId: number) {
    const token = await getRenteonToken();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
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
        PricelistId: 453
    };

    console.log(`\n--- Debugging Category ${catId} ---`);
    const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        const data = await res.json();
        console.log(`✅ Price found: ${data.Total}`);

        const insurances = data.Services
            ? data.Services.filter((s: any) => {
                const n = (s.Name || "").toLowerCase();
                return n.includes('insurance') || n.includes('protect') || n.includes('cdw') || n.includes('sct');
            })
            : [];

        console.log(`🛡️ Insurances found: ${insurances.length}`);
        if (insurances.length === 0) {
            console.log("⚠️ NO INSURANCES for this category! (This is why sync skips it)");
        }
    } else {
        console.log(`❌ Calculation failed: ${res.status}`);
        console.log(await res.text());
    }
}

async function main() {
    await debugSync(409); // CWMR - Astra
    await debugSync(411); // EDMR - Corsa
}

main().catch(console.error);
