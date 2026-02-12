"use server"

import { getSession } from "@/lib/auth"
import { getRenteonToken } from "@/lib/renteon"
import { executeSyncCars, executeSyncAvailability, executeSyncExtras } from "@/lib/renteon-sync"
import { strictSync as executeNewSyncCars } from "@/scripts/strict-sync"

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api"

export async function testRenteonConnection() {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    // 1. Test Auth
    const token = await getRenteonToken()
    if (!token) throw new Error("Failed to obtain access token")

    // 2. Test Data Fetch (e.g. Offices)
    // Probe for Extras/Insurances
    const endpoints = [
        '/offices',
        '/additionalEquipment', 
        '/equipment',
        '/insurances',
        '/insuranceTypes',
        '/services'
    ];
    
    const results: any = {};
    
    for (const ep of endpoints) {
        try {
            const res = await fetch(`${RENTEON_API_URL}${ep}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                results[ep] = Array.isArray(json) ? `Found ${json.length} items` : 'Found object';
                // Store sample if found
                if (Array.isArray(json) && json.length > 0) {
                    results[`${ep}_sample`] = json[0];
                }
            } else {
                results[ep] = `Status: ${res.status}`;
            }
        } catch (e: any) {
            results[ep] = `Error: ${e.message}`;
        }
    }

    return { 
        success: true, 
        message: "Connection Successful!", 
        tokenPreview: `${token.substring(0, 10)}...`,
        data: results
    }

  } catch (error: any) {
    console.error("Renteon Test Failed:", error)
    return { 
        error: error.message || "Unknown error occurred",
        details: error.toString()
    }
  }
}

export async function syncAvailability() {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  return await executeSyncAvailability();
}

export async function syncCarsFromRenteon() {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  // Use the NEW sync script which is more robust
  // We need to adapt it because the script is async and returns stats, 
  // while the previous one might have returned different structure.
  // But let's just call it.
  try {
      const stats = await executeNewSyncCars();
      return { success: true, message: `Synced ${stats.total} cars (Created: ${stats.created}, Updated: ${stats.updated})` };
  } catch (e: any) {
      console.error("Sync Failed:", e);
      return { error: e.message || "Sync Failed" };
  }
}

export async function syncExtrasFromRenteon() {
  // This might be used by client components or other actions?
  // We'll wrap it just in case.
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    await executeSyncExtras();
    return { success: true, message: "Extras synced successfully" };
  } catch (error: any) {
    console.error("Sync Extras Failed:", error);
    return { error: error.message || "Sync Failed" };
  }
}
