
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
    console.log("🔍 Holnapi (2026-03-10) elérhetőség ellenőrzése (Standalone)...\n");

    const token = await getRenteonToken();

    // Tomorrow: 2026-03-10
    const startDate = new Date("2026-03-10T10:00:00Z");
    const endDate = new Date("2026-03-11T10:00:00Z");

    console.log(`📅 Időszak: ${startDate.toISOString()} -> ${endDate.toISOString()}`);

    // Fetch Categories
    const catRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await catRes.json();

    const availPayload = {
        DateOut: startDate.toISOString(),
        DateIn: endDate.toISOString(),
        OfficeOutId: 54, // Vecsés
        OfficeInId: 54,
        BookAsCommissioner: true,
        PricelistId: 453,
        Currency: "EUR"
    };

    console.log("📡 Elérhetőség lekérése...");

    try {
        const resAvail = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(availPayload)
        });

        if (!resAvail.ok) {
            console.error(`❌ Hiba az elérhetőség lekérésekor: ${resAvail.status}`);
            console.error(await resAvail.text());
            return;
        }

        const availableCars = await resAvail.json();

        if (!Array.isArray(availableCars) || availableCars.length === 0) {
            console.log("📭 Nincs elérhető autó holnapra.");
            return;
        }

        console.log(`✅ ${availableCars.length} kategória elérhető holnapra:\n`);

        for (const car of availableCars) {
            const catId = car.CarCategoryId || car.CategoryId;
            const categoryInfo = Array.isArray(categories) ? categories.find((c: any) => c.Id === catId) : null;
            const models = categoryInfo ? categoryInfo.CarModels.map((m: any) => m.Name).join(", ") : "Ismeretlen modellek";

            console.log(`🚗 Kategória: ${car.CarCategoryName || categoryInfo?.Name || 'N/A'}`);
            console.log(`   SIPP: ${car.SIPP || categoryInfo?.SIPP || 'N/A'}`);
            console.log(`   Ár (1 nap): ${car.Price} ${car.Currency}`);
            console.log(`   Modellek: ${models}`);
            console.log("------------------------------------------------");
        }

    } catch (e) {
        console.error("Hiba:", e);
    }
}

checkTomorrow().catch(console.error);
