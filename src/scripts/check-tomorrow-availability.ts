
import { config } from "dotenv";
import { getRenteonToken, fetchCarCategories } from "../lib/renteon.js";

config();

const RENTEON_API_URL = 'https://justrentandtrans.s11.renteon.com/en/api';

async function checkTomorrow() {
    console.log("🔍 Holnapi (2026-03-10) elérhetőség ellenőrzése...\n");

    const token = await getRenteonToken();

    // Tomorrow: 2026-03-10
    const startDate = new Date("2026-03-10T10:00:00Z");
    const endDate = new Date("2026-03-11T10:00:00Z");

    console.log(`📅 Időszak: ${startDate.toISOString()} -> ${endDate.toISOString()}`);

    const categories = await fetchCarCategories();

    const availPayload = {
        DateOut: startDate.toISOString(),
        DateIn: endDate.toISOString(),
        OfficeOutId: 54, // Vecsés
        OfficeInId: 54,
        BookAsCommissioner: true,
        PricelistId: 453,
        Currency: "EUR"
    };

    console.log("📡 Elérhetőség lekérése...");

    try {
        const resAvail = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(availPayload)
        });

        if (!resAvail.ok) {
            console.error(`❌ Hiba az elérhetőség lekérésekor: ${resAvail.status}`);
            console.error(await resAvail.text());
            return;
        }

        const availableCars = await resAvail.json();

        if (!Array.isArray(availableCars) || availableCars.length === 0) {
            console.log("📭 Nincs elérhető autó holnapra.");
            return;
        }

        console.log(`✅ ${availableCars.length} kategória elérhető holnapra:\n`);

        for (const car of availableCars) {
            const catId = car.CarCategoryId || car.CategoryId;
            const categoryInfo = categories.find((c: any) => c.Id === catId);
            const models = categoryInfo ? categoryInfo.CarModels.map((m: any) => m.Name).join(", ") : "Ismeretlen modellek";

            console.log(`🚗 Kategória: ${car.CarCategoryName || categoryInfo?.Name || 'N/A'}`);
            console.log(`   SIPP: ${car.SIPP || categoryInfo?.SIPP || 'N/A'}`);
            console.log(`   Ár (1 nap): ${car.Price} ${car.Currency}`);
            console.log(`   Modellek: ${models}`);
            console.log("------------------------------------------------");
        }

    } catch (e) {
        console.error("Hiba:", e);
    }
}

checkTomorrow().catch(console.error);
