
import { NextResponse } from "next/server";
import { getRenteonToken } from "@/lib/renteon";

export const dynamic = 'force-dynamic';

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api";

export async function GET() {
    const token = await getRenteonToken();
    if (!token) return NextResponse.json({ error: "No token" });

    const results: any = {
        mini: null,
        midiCandidates: {},
        maxi: null,
        offices: []
    };

    // Get offices
    try {
        const offRes = await fetch(`${RENTEON_API_URL}/offices`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const offices = await offRes.json();
        if (Array.isArray(offices)) {
            results.offices = offices.map((o: any) => `${o.Id}: ${o.Name}`);
        }
    } catch (e) { results.officesError = e; }

    const catsRes = await fetch(`${RENTEON_API_URL}/carCategories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await catsRes.json();
    
    const targetCats: Record<string, number> = {};
    
    if (Array.isArray(categories)) {
    results.foundCategories = categories.map((c: any) => `${c.Id}: ${c.CarCategoryGroup} (${c.SIPP})`);

    // Test parameters
    const dOut = new Date(); dOut.setDate(dOut.getDate() + 2);
    const dIn = new Date(); dIn.setDate(dIn.getDate() + 3); // 1 day rental
    
    const basePayload = {
      DateOut: dOut.toISOString(),
      DateIn: dIn.toISOString(),
      OfficeOutId: 54, 
      OfficeInId: 54,
      BookAsCommissioner: true,
      PricelistId: 306,
      Currency: "EUR"
    };

    // Check ALL categories to find what is available
    results.availableCategories = {};
    
    // Limit to parallel execution to speed up
    const promises = categories.map((c: any) => 
        checkCategory(token, `${c.SIPP} (${c.Id})`, c.Id, basePayload, results.availableCategories)
    );
    
    await Promise.all(promises);
  }

  return NextResponse.json(results);
}

async function checkCategory(token: string, key: string, catId: number, basePayload: any, results: any) {
    try {
      const resCalc = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...basePayload, CarCategoryId: catId })
      });
      
      if (resCalc.ok) {
        const data = await resCalc.json();
        const insurances = data.Services?.filter((s: any) => 
          (s.Name || "").toLowerCase().includes('insurance') || 
          (s.Name || "").toLowerCase().includes('protect')
        ).map((s: any) => ({
          name: s.Name,
          priceTotal: s.ServicePrice?.AmountTotal,
          deposit: s.InsuranceDepositAmount
        }));
        
        results[key] = {
          catId,
          insurances
        };
      } else {
        // failed
      }
    } catch (e: any) {
      // failed
    }
}
