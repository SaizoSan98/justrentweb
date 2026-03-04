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

async function checkAllCategories() {
    const token = await getRenteonToken();

    const categoriesRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await categoriesRes.json();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    console.log(`Checking ${categories.length} categories for Unlimited Mileage...`);

    for (const cat of categories) {
        const payload = {
            CarCategoryId: cat.Id,
            OfficeOutId: 54, // Vecsés
            OfficeInId: 54,
            DateOut: startDate.toISOString(),
            DateIn: endDate.toISOString(),
            Currency: "EUR",
            BookAsCommissioner: true, 
            PricelistId: 306
        };

        const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            
            if (data.Services) {
                const unlimitedService = data.Services.find((s: any) => 
                    s.ServiceTypeName === 'Unlimited mileage' || 
                    (s.Name && s.Name.toLowerCase().includes('unlimited'))
                );
                
                if (unlimitedService) {
                    console.log(`✅ FOUND in Category: ${cat.Name} (ID: ${cat.Id}) - Service: ${unlimitedService.Name} (${unlimitedService.ServicePrice.Amount} ${unlimitedService.ServicePrice.Currency})`);
                } else {
                    console.log(`❌ NOT FOUND in Category: ${cat.Name} (ID: ${cat.Id})`);
                }
            } else {
                 console.log(`⚠️ NO SERVICES in Category: ${cat.Name} (ID: ${cat.Id})`);
            }
        } else {
            console.log(`Error checking category ${cat.Name}: ${res.status}`);
        }
    }
}

checkAllCategories().catch(console.error);
