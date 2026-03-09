
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

async function checkInsurances() {
    const token = await getRenteonToken();
    const dOut = new Date(); dOut.setDate(dOut.getDate() + 2);
    const dIn = new Date(dOut); dIn.setDate(dIn.getDate() + 2);

    const payload = {
        OfficeOutId: 54,
        OfficeInId: 54,
        DateOut: dOut.toISOString(),
        DateIn: dIn.toISOString(),
        BookAsCommissioner: true,
        PricelistId: 453,
        Currency: "EUR"
    };

    const resAvail = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (resAvail.ok) {
        const cars = await resAvail.json();
        const car = cars[0];
        console.log(`Checking insurances for Car Category ${car.CarCategoryId}...`);

        const calcPayload = { ...payload, CarCategoryId: car.CarCategoryId };
        const resCalc = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(calcPayload)
        });

        if (resCalc.ok) {
            const data = await resCalc.json();
            console.log(`Total: ${data.Total}`);
            console.log("Services:");
            data.Services.forEach((s: any) => {
                const isIns = s.ServiceTypeName === 'Insurance' || s.Name.toLowerCase().includes('insurance') || s.Name.toLowerCase().includes('protect');
                if (isIns || s.IsRent) {
                    console.log(`- ${s.Name} (${s.ServiceTypeName}): Total=${s.ServicePrice?.AmountTotal}, Amount=${s.ServicePrice?.Amount}, IsRent=${s.IsRent}`);
                }
            });
        }
    }
}

checkInsurances().catch(console.error);
