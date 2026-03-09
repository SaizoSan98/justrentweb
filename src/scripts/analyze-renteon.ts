
import { config } from "dotenv"
import crypto from 'crypto';

config()

const RENTEON_BASE_URL = 'https://justrentandtrans.s11.renteon.com/en';
const RENTEON_TOKEN_URL = `${RENTEON_BASE_URL}/token`;
const RENTEON_API_URL = `${RENTEON_BASE_URL}/api`;

async function getRenteonToken(): Promise<string> {
    // Use env vars or fallbacks
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

async function analyzeRenteonData() {
    console.log("🔍 Renteon Adatok Elemzése...\n");
    const token = await getRenteonToken();

    // 1. Kategóriák és Autók (SIPP)
    console.log("🚗 Kategóriák és Autók (SIPP):");
    const categoriesRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await categoriesRes.json();
    
    const validCategories: any[] = [];
    const carMap = new Map(); // SIPP -> { count, examples }

    categories.forEach((cat: any) => {
        if (cat.CarModels && cat.CarModels.length > 0) {
            validCategories.push(cat);
            const sipp = cat.SIPP || "N/A";
            
            // Insurance Group info
            const insGroup = cat.Groups?.find((g: any) => g.TypeName === 'Insurance')?.Name || "Nincs csoport";

            console.log(`\n  📂 Kategória ID: ${cat.Id} | Név: ${cat.Name || cat.CarModel} | SIPP: ${sipp} | Csoport: ${insGroup}`);
            console.log(`     Autók (${cat.CarModels.length} db):`);
            
            cat.CarModels.forEach((m: any) => {
                console.log(`       - ${m.CarMakeName} ${m.Name} (ID: ${m.Id}, Év: ${m.Year || 'N/A'})`);
            });
        }
    });

    // 2. Extrák (Equipment)
    console.log("\n📦 Elérhető Extrák:");
    const equipmentRes = await fetch(`${RENTEON_API_URL}/equipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    // Note: Renteon endpoint might differ, usually services or equipments. 
    // Let's try fetching bookings/calculate to see services list, or generic lists.
    // But specific endpoint for equipment list might be /equipments or similar.
    // If fails, we fallback to calculate services.
    
    if (equipmentRes.ok) {
        const equipments = await equipmentRes.json();
        equipments.forEach((eq: any) => {
             console.log(`  - ${eq.Name} (Ár: ${eq.PriceAmount} ${eq.Currency})`);
        });
    } else {
        console.log("  ⚠️  Külön /equipments endpoint nem elérhető vagy üres. (Próba számítással...)");
    }

    // 3. Számítás egy reprezentatív kategóriára (hogy lássuk a biztosításokat és árakat)
    if (validCategories.length > 0) {
        console.log("\n💰 Ár és Biztosítás Elemzés (Minta Kalkuláció - 3 napra):");
        
        // Pick a category that is likely to have insurance (e.g. from 'Midi' group if exists, or random)
        const testCat = validCategories.find(c => c.Groups?.some((g: any) => ['Midi', 'Maxi', 'Mini'].includes(g.Name))) || validCategories[0];
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 30); // 30 nap múlva
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3);

        const payload = {
            CarCategoryId: testCat.Id,
            OfficeOutId: 54, 
            OfficeInId: 54,
            DateOut: startDate.toISOString(),
            DateIn: endDate.toISOString(),
            Currency: "EUR",
            BookAsCommissioner: true,
            PricelistId: 453
        };

        const calcRes = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (calcRes.ok) {
            const data = await calcRes.json();
            console.log(`  Teszt Kategória: ${testCat.Name} (ID: ${testCat.Id})`);
            console.log(`  Alap Bérleti Díj (3 napra): ${data.Total} EUR`);
            
            console.log("  🛡️  Elérhető Biztosítások és Szolgáltatások:");
            if (data.Services) {
                data.Services.forEach((s: any) => {
                    // Filter meaningful services
                    if (['Insurance', 'Car rent', 'Additional fee', 'Additional equipment'].includes(s.ServiceTypeName)) {
                        console.log(`    - [${s.ServiceTypeName}] ${s.Name}:`);
                        console.log(`      PriceAmount: ${s.ServicePrice?.Amount}`);
                        console.log(`      PriceAmountTotal: ${s.ServicePrice?.AmountTotal}`);
                        console.log(`      PriceCurrency: ${s.ServicePrice?.Currency}`);
                        console.log(`      IsOneTimePayment: ${s.ServicePrice?.IsOneTimePayment}`);
                        console.log(`      InsuranceDepositAmount: ${s.InsuranceDepositAmount}`);
                    }
                });
            }
        } else {
             console.log(`  ⚠️  Kalkuláció hiba: ${calcRes.status}`);
        }
    }
}

analyzeRenteonData().catch(console.error);
