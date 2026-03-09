
import { PrismaClient } from '@prisma/client';
import { config } from "dotenv";
import crypto from 'crypto';

config();
const prisma = new PrismaClient();

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

async function finalSyncAstraCorsa() {
    console.log("🚀 Starting Final Sync for Astra & Corsa...");
    const token = await getRenteonToken();
    const catRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await catRes.json();

    const targetIds = [409, 411];
    const targetCats = categories.filter((c: any) => targetIds.includes(c.Id));

    for (const cat of targetCats) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 2);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 5);

        const payload = {
            CarCategoryId: cat.Id, OfficeOutId: 54, OfficeInId: 54,
            DateOut: startDate.toISOString(), DateIn: endDate.toISOString(),
            Currency: "EUR", BookAsCommissioner: true, PricelistId: 453
        };

        const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) continue;
        const data = await res.json();
        const price = Math.round(data.Total / 3);

        const models = (cat.CarModels && cat.CarModels.length > 0) ? cat.CarModels : [{ Id: cat.Id, Name: cat.SIPP === 'CWMR' ? 'Astra' : 'Corsa', CarMakeName: 'Opel' }];

        for (const model of models) {
            const carData: any = {
                make: model.CarMakeName || 'Opel',
                model: model.Name,
                year: model.Year || 2024,
                licensePlate: `RT-${cat.SIPP}-${model.Id}`,
                seats: cat.PassengerCapacity || 5,
                pricePerDay: price,
                status: 'AVAILABLE',
                renteonId: model.Id.toString(),
                fuelType: 'PETROL',
                transmission: cat.CarTransmissionType?.Name?.includes('Auto') ? 'AUTOMATIC' : 'MANUAL',
                doors: cat.NumberOfDoors || 5,
                mileage: 0
            };

            await prisma.car.upsert({
                where: { renteonId: carData.renteonId },
                update: carData,
                create: carData
            });
            console.log(`✅ Synced: ${carData.make} ${carData.model} (ID: ${carData.renteonId})`);
        }
    }
    console.log("✨ Final Sync Complete.");
}

finalSyncAstraCorsa().finally(() => prisma.$disconnect());
