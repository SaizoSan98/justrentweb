
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { config } from "dotenv";

config();
const prisma = new PrismaClient();

const RENTEON_BASE_URL = 'https://justrentandtrans.s11.renteon.com/en';
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
    const response = await fetch(`${RENTEON_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });
    const data = await response.json();
    return data.access_token;
}

async function run() {
    const token = await getRenteonToken();
    const response = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const cats = await response.json();
    cats.forEach((c: any) => console.log(`${c.Id} | ${c.SIPP} | ${c.Name}`));
}

run().catch(console.error);
