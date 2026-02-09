
import { NextResponse } from "next/server";
import { getRenteonToken } from "@/lib/renteon";

export const dynamic = 'force-dynamic';

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api";

export async function GET() {
    const token = await getRenteonToken();
    if (!token) return NextResponse.json({ error: "No token" });

    const results: any = {
        standardEndpoints: {},
        calculationStrategy: null
    };

    // 1. Try Standard Endpoints (Fast fail check)
    const endpoints = ['/insurances', '/services'];
    for (const ep of endpoints) {
        try {
            const res = await fetch(`${RENTEON_API_URL}${ep}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            results.standardEndpoints[ep] = res.status;
        } catch (e: any) {
            results.standardEndpoints[ep] = e.message;
        }
    }

    // 2. Try Calculation Strategy
    try {
        const dOut = new Date(); dOut.setDate(dOut.getDate() + 35);
        const dIn = new Date(); dIn.setDate(dIn.getDate() + 38);
        
        const availPayload = {
            DateOut: dOut.toISOString(),
            DateIn: dIn.toISOString(),
            OfficeOutId: 54, 
            OfficeInId: 54,
            BookAsCommissioner: true,
            PricelistId: 306,
            Currency: "EUR"
        };
        
        // A. Get a valid Car Category ID first
        const resAvail = await fetch(`${RENTEON_API_URL}/bookings/availability`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(availPayload)
        });
        
        if (resAvail.ok) {
            const cars = await resAvail.json();
            if (Array.isArray(cars) && cars.length > 0) {
                const car = cars[0];
                const calcPayload = {
                    ...availPayload,
                    CarCategoryId: car.CarCategoryId || car.CategoryId || car.Id
                };
                
                // B. Calculate to get Services
                const resCalc = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(calcPayload)
                });
                
                if (resCalc.ok) {
                    const calcData = await resCalc.json();
                    results.calculationStrategy = {
                        success: true,
                        servicesFound: calcData.Services?.length || 0,
                        services: calcData.Services || [], // Return the raw services list
                        total: calcData.Total
                    };
                } else {
                    results.calculationStrategy = { success: false, error: `Calculate failed: ${resCalc.status} ${await resCalc.text()}` };
                }
            } else {
                results.calculationStrategy = { success: false, error: "No cars available for dummy date" };
            }
        } else {
            results.calculationStrategy = { success: false, error: `Availability failed: ${resAvail.status}` };
        }
    } catch (calcErr: any) {
        results.calculationStrategy = { success: false, error: calcErr.message };
    }

    return NextResponse.json(results);
}
