
"use server"

import { getRenteonToken } from "@/lib/renteon"

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api"

export interface AvailabilityResult {
    success: boolean;
    data?: any;
    error?: string;
}

export async function checkRealTimeAvailability(
    dateOut: Date, 
    dateIn: Date, 
    pickupId: number = 54, // Default Vecsés
    dropoffId: number = 54
): Promise<AvailabilityResult> {
    
    const token = await getRenteonToken();
    if (!token) return { success: false, error: "Auth Error" };

    // Format dates to ISO string
    const dOut = dateOut.toISOString();
    const dIn = dateIn.toISOString();

    // Use the /bookings/availability endpoint which returns a list efficiently
    // Based on debug findings: requires OfficeInId and BookAsCommissioner: true
    const payload = {
        DateOut: dOut,
        DateIn: dIn,
        OfficeOutId: pickupId,
        OfficeInId: dropoffId,
        BookAsCommissioner: true,
        PricelistId: 306, // WEB Pricelist (ID 306) from user screenshots
        Currency: "EUR"
    };

    try {
        const res = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const data = await res.json();
            // console.log("Renteon Availability Data:", JSON.stringify(data).substring(0, 200));
            return {
                success: true,
                data: Array.isArray(data) ? data : []
            };
        } else {
            const errorText = await res.text();
            console.error("Availability Check Failed:", res.status, errorText);
            // Fallback: If API fails with 422 or 500, we might want to return error so UI knows
            return { success: false, error: `API Error: ${res.status}` };
        }
    } catch (e: any) {
        console.error("Availability Exception:", e);
        return { success: false, error: e.message };
    }
}
