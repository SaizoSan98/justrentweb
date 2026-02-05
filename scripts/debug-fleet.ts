
import * as fs from 'fs';
import * as path from 'path';
import { getRenteonToken } from '../src/lib/renteon';

// Manually load .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
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

async function debugFleet() {
    console.log("Starting Fleet & Pricelist Diagnostics...");
    const token = await getRenteonToken();
    if (!token) return;

    // 1. Probe Offices
    console.log("\n--- Probing Offices ---");
    try {
        const res = await fetch(`${RENTEON_API_URL}/offices`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            console.log(`Found ${data.length} offices.`);
            data.forEach((o: any) => console.log(`Office: ${o.Name} (ID: ${o.Id})`));
        } else {
            console.log(`Offices failed: ${res.status}`);
        }
    } catch (e) { console.log("Offices Error:", e); }

    // 2. Probe Categories (Deep Inspect)
    console.log("\n--- Probing Categories ---");
    try {
        const res = await fetch(`${RENTEON_API_URL}/carCategories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            console.log(`Found ${data.length} categories.`);
            if (data.length > 0) {
                console.log("Sample Category (Full):", JSON.stringify(data[0], null, 2));
            }
        }
    } catch (e) { console.log("Categories Error:", e); }

    // 3. Probe Pricelists (Retry with /api/settings/pricelists or similar?)
    // ... skip for now as previous attempts failed

    // 4. Test Cat 332 Availability (Known ID) with correct Office
    // ...
}

debugFleet();
