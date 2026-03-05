
"use server"

import { getRenteonToken, fetchCarCategories } from "@/lib/renteon"

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
    dropoffId: number = 54,
    promoCode?: string
): Promise<AvailabilityResult> {

    const token = await getRenteonToken();
    if (!token) return { success: false, error: "Auth Error" };

    const dOut = dateOut.toISOString();
    const dIn = dateIn.toISOString();

    const categories = await fetchCarCategories();
    if (!categories || categories.length === 0) {
        return { success: false, error: "Could not fetch car categories from Renteon." };
    }

    const availabilityData = [];

    for (const category of categories) {
        const catId = category.Id;
        const payload: any = {
            CarCategoryId: catId,
            OfficeOutId: pickupId,
            OfficeInId: dropoffId,
            DateOut: dOut,
            DateIn: dIn,
            BookAsCommissioner: true,
            PricelistId: 306,
            Currency: "EUR"
        };

        if (promoCode) {
            payload.PromoCode = promoCode;
        }

        try {
            const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                const unlimitedService = data.Services.find((s: any) => s.ServiceTypeName === 'Unlimited mileage');

                availabilityData.push({
                    CarCategoryId: catId,
                    Amount: data.Total,
                    DepositAmount: data.Deposit,
                    unlimitedMileagePrice: unlimitedService ? unlimitedService.ServicePrice.Amount : null
                });
            } else if (res.status === 422 && promoCode) {
                // Check if this error is specifically because of the promo code
                try {
                    const errorData = await res.json();
                    if (errorData?.ModelState?.['bookingInModel.PromoCode']) {
                        return { success: false, error: "Érvénytelen promóciós kód." };
                    }
                } catch (e) {
                    // JSON parse failed, ignore
                }
            }
        } catch (e: any) {
            // Ignore categories that fail to calculate
        }
    }

    return {
        success: true,
        data: availabilityData
    };
}
