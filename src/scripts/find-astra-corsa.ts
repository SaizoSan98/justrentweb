
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

async function findAstraAndCorsa() {
    const token = await getRenteonToken();
    const catRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await catRes.json();

    console.log("Searching for Astra and Corsa in categories...");

    for (const cat of categories) {
        const models = cat.CarModels || [];
        const hasAstra = models.some((m: any) => m.Name.toLowerCase().includes('astra'));
        const hasCorsa = models.some((m: any) => m.Name.toLowerCase().includes('corsa'));

        if (hasAstra || hasCorsa) {
            console.log(`📍 Kategória: ${cat.Name} (SIPP: ${cat.SIPP}, ID: ${cat.Id})`);
            if (hasAstra) console.log("   - Astra megtalálva!");
            if (hasCorsa) console.log("   - Corsa megtalálva!");
            models.forEach((m: any) => console.log(`     -> ${m.Name}`));
        }
    }
}

findAstraAndCorsa().catch(console.error);
