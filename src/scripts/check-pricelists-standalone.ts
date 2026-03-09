
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

async function listPricelists() {
    console.log("🔍 Renteon Árlisták Lekérése...\n");

    const token = await getRenteonToken();

    try {
        const res = await fetch(`${RENTEON_API_URL}/pricelists`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error(`❌ Hiba az árlisták lekérésekor: ${res.status}`);
            console.error(await res.text());
            return;
        }

        const pricelists = await res.json();

        if (!Array.isArray(pricelists)) {
            console.log("📭 Váratlan válaszformátum.");
            console.log(pricelists);
            return;
        }

        console.log(`✅ ${pricelists.length} árlista található:\n`);

        pricelists.forEach((pl: any) => {
            console.log(`🆔 ID: ${pl.Id}`);
            console.log(`📝 Név: ${pl.Name}`);
            console.log(`------------------------------------------------`);
        });

    } catch (e) {
        console.error("Hiba:", e);
    }
}

listPricelists().catch(console.error);
