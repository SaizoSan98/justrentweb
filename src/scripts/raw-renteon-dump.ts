
import { config } from "dotenv"
import crypto from 'crypto';

config()

const RENTEON_BASE_URL = 'https://justrentandtrans.s11.renteon.com/en';
const RENTEON_TOKEN_URL = `${RENTEON_BASE_URL}/token`;
const RENTEON_API_URL = `${RENTEON_BASE_URL}/api`;

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

async function rawRenteonDump() {
    console.log("🔍 NYERS Renteon Adatok Lekérése (Kalkuláció nélkül)...\n");
    const token = await getRenteonToken();

    // 1. Árlisták (Pricelists) - Hogy lássuk van-e egyáltalán
    console.log("📋 Árlisták (/pricelists):");
    try {
        const res = await fetch(`${RENTEON_API_URL}/pricelists`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(`Hiba: ${res.status} ${res.statusText}`);
        }
    } catch (e) { console.error(e); }

    // 2. Extrák / Felszerelések (/equipments)
    console.log("\n📦 Felszerelések (/equipments):");
    try {
        const res = await fetch(`${RENTEON_API_URL}/equipments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log(`Hiba: ${res.status} ${res.statusText}`);
        }
    } catch (e) { console.error(e); }

    // 3. Szolgáltatások (/services) - Ha létezik ilyen endpoint
    console.log("\n🛠️  Szolgáltatások (/services):");
    try {
        const res = await fetch(`${RENTEON_API_URL}/services`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            // Csak az első párat írjuk ki, ha sok van
            console.log(JSON.stringify(data.slice(0, 5), null, 2)); 
            console.log(`... és további ${data.length - 5} elem.`);
        } else {
            console.log(`Hiba: ${res.status} ${res.statusText} (Valószínűleg nincs ilyen endpoint vagy más a neve)`);
        }
    } catch (e) { console.error(e); }

    // 4. Kategóriák (/carCategories) - Itt vannak az autók is
    console.log("\n🚗 Kategóriák és Autók (/carCategories):");
    try {
        const res = await fetch(`${RENTEON_API_URL}/carCategories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            // Csak egy mintát írjunk ki, hogy lássuk a struktúrát
            if (data.length > 0) {
                console.log("MINTA (Első elem):");
                console.log(JSON.stringify(data[0], null, 2));
                
                console.log("\nÖsszesítés:");
                data.forEach((cat: any) => {
                    console.log(`ID: ${cat.Id}, Név: ${cat.Name}, SIPP: ${cat.SIPP}, Modellek száma: ${cat.CarModels?.length || 0}`);
                });
            } else {
                console.log("Üres lista.");
            }
        } else {
            console.log(`Hiba: ${res.status} ${res.statusText}`);
        }
    } catch (e) { console.error(e); }

}

rawRenteonDump().catch(console.error);
