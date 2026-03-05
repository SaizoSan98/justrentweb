
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
                const rentService = data.Services.find((s: any) => s.IsRent);

                // Calculate the actual daily rate from DateOut/DateIn
                const dOut = new Date(data.DateOut);
                const dIn = new Date(data.DateIn);
                const rentalDays = Math.max(1, Math.round((dIn.getTime() - dOut.getTime()) / (1000 * 60 * 60 * 24)));
                const dailyRate = rentService ? (rentService.ServicePrice.AmountTotal / rentalDays) : (data.Total / rentalDays);

                availabilityData.push({
                    CarCategoryId: catId,
                    Amount: data.Total,
                    dailyRate: dailyRate,
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

export async function verifyPromoCodeForCar(
    car: any,
    dateOut: Date,
    dateIn: Date,
    pickupId: number = 54,
    dropoffId: number = 54,
    promoCode: string
): Promise<{ success: boolean; discountAmount: number; error?: string }> {
    const token = await getRenteonToken();
    if (!token) return { success: false, discountAmount: 0, error: "Auth Error" };

    const { mapCarToCategoryId } = await import("@/lib/renteon");
    const catId = mapCarToCategoryId(car);
    const dOut = dateOut.toISOString();
    const dIn = dateIn.toISOString();

    const payloadWithoutPromo: any = {
        CarCategoryId: catId,
        OfficeOutId: pickupId,
        OfficeInId: dropoffId,
        DateOut: dOut,
        DateIn: dIn,
        BookAsCommissioner: true,
        PricelistId: 306,
        Currency: "EUR"
    };

    const payloadWithPromo: any = { ...payloadWithoutPromo, PromoCode: promoCode };

    try {
        // Fetch WITH promo
        const resWith = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWithPromo)
        });

        if (!resWith.ok) {
            if (resWith.status === 422) {
                return { success: false, discountAmount: 0, error: "Invalid promo code." };
            }
            return { success: false, discountAmount: 0, error: "Failed to verify promo." };
        }

        const dataWith = await resWith.json();
        const priceWithPromo = dataWith.Total;

        let explicitDiscount = 0;
        if (dataWith.Services && Array.isArray(dataWith.Services)) {
            dataWith.Services.forEach((s: any) => {
                if (s.DiscountAmount) explicitDiscount += s.DiscountAmount;
            });
        }

        if (explicitDiscount > 0) {
            return { success: true, discountAmount: explicitDiscount };
        }

        // Fetch WITHOUT promo if explicit discount is 0 to see if Total changed
        const resWithout = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWithoutPromo)
        });

        if (resWithout.ok) {
            const dataWithout = await resWithout.json();
            const priceWithoutPromo = dataWithout.Total;
            if (priceWithoutPromo > priceWithPromo) {
                return { success: true, discountAmount: priceWithoutPromo - priceWithPromo };
            }
        }

        // If promo is valid but discount is 0, we still accept it (maybe percentage is 0 or conditional)
        return { success: true, discountAmount: 0 };
    } catch (e) {
        return { success: false, discountAmount: 0, error: "Verification error" };
    }
}
