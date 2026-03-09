
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

async function querySpecificDates() {
    console.log("🔍 Renteon Adatok Lekérése Konkrét Dátumra (Szimulált Foglalás API hívás)...\n");
    const token = await getRenteonToken();

    // Dátumok beállítása: 30 nap múlva, 1 napos bérlés (hogy lássuk a napi díjat tisztán)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    console.log(`📅 Dátum (1 nap): ${startDate.toISOString().split('T')[0]} -> ${endDate.toISOString().split('T')[0]}`);

    // Először lekérünk egy valid kategóriát, hogy ne tippeljünk ID-t
    const categoriesRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await categoriesRes.json();
    
    // Keressünk egy "Midi" kategóriát, amiben van autó (pl. CGAR - VW T-Cross)
    const testCat = categories.find((c: any) => c.SIPP === 'CGAR' && c.CarModels.length > 0) || categories[0];
    
    if (!testCat) {
        console.log("❌ Nem találtam tesztelhető kategóriát.");
        return;
    }

    console.log(`🚗 Teszt Kategória: ${testCat.Name} (ID: ${testCat.Id}, SIPP: ${testCat.SIPP})`);

    const payload = {
        CarCategoryId: testCat.Id,
        OfficeOutId: 54, // Vecsés
        OfficeInId: 54,
        DateOut: startDate.toISOString(),
        DateIn: endDate.toISOString(),
        Currency: "EUR",
        BookAsCommissioner: true, 
        PricelistId: 453
    };

    console.log("\n📡 Kérés küldése a /bookings/calculate endpointra (Csak EXTRÁK)...");

    try {
        const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            console.log("\n📦 NYERS RENTEON EXTRÁK (Equipment & Fees):");
            console.log("------------------------------------------------");
            
            if (data.Services && Array.isArray(data.Services)) {
                data.Services.forEach((s: any) => {
                    // Szűrés: Csak Equipment és Fee típusok
                    if (s.ServiceTypeName === 'Additional equipment' || s.ServiceTypeName === 'Additional fee') {
                        console.log(`  - Név: "${s.Name}"`);
                        console.log(`    Típus: ${s.ServiceTypeName}`);
                        console.log(`    Ár (1 napra): ${s.ServicePrice?.AmountTotal} ${s.ServicePrice?.Currency}`);
                        console.log(`    Egységár: ${s.ServicePrice?.Amount} ${s.ServicePrice?.Currency}`);
                        console.log(`    Fizetés módja: ${s.ServicePrice?.IsOneTimePayment ? 'EGYSZERI DÍJ' : 'NAPI DÍJ'}`);
                        console.log(`    Kötelező? ${s.IsMandatory ? 'IGEN' : 'NEM'}`);
                        console.log(`    ID: ${s.ServiceId}`);
                        console.log("");
                    }
                });
            } else {
                console.log("  Nincsenek extrák a válaszban.");
            }
            console.log("------------------------------------------------");

        } else {
            console.log(`❌ HIBA: ${res.status}`);
            console.log(await res.text());
        }
    } catch (e) {
        console.error("Hálózati hiba:", e);
    }
}

querySpecificDates().catch(console.error);
