import { config } from "dotenv"
import crypto from 'crypto';

config()

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

async function testCalculateWithPromo() {
    const token = await getRenteonToken();

    console.log("Testing Calculate with valid CarCategory and 'PromoCode' parameter...");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 3);

    const payloadValid = {
        CarCategoryId: 290, // Valid ID from previous response
        OfficeOutId: 54,
        OfficeInId: 54,
        DateOut: startDate.toISOString(),
        DateIn: endDate.toISOString(),
        Currency: "EUR",
        BookAsCommissioner: true,
        PricelistId: 306
    };

    const payloadWithPromo = {
        ...payloadValid,
        PromoCode: "TESZT2026" // Just testing with a random code to see the actual response format
    };

    const calcRes2 = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadWithPromo)
    });

    if (calcRes2.ok) {
        const data2 = await calcRes2.json();
        console.log("Calculate WITH PromoCode Success. Total:", data2.Total);
    } else {
        console.log("Calculate WITH promo failed:", calcRes2.status);
        try {
            const errorData = await calcRes2.json();
            console.log(errorData);
        } catch (e) { }
    }

    // Test if we can fetch something like /pricelists/306/promos or similar
    console.log("\nTesting other possible promo endpoints for pricelist 306...");
    const possibleEndpoints = [
        'promocodes',
        'promotions',
        'discounts'
    ];

    for (const ep of possibleEndpoints) {
        const res = await fetch(`${RENTEON_API_URL}/pricelists/306/${ep}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`/pricelists/306/${ep} -> Status: ${res.status}`);
    }
}

testCalculateWithPromo().catch(console.error);
