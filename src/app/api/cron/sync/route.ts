
import { NextResponse } from "next/server";
import { executeSyncCars, executeSyncAvailability } from "@/lib/renteon-sync";

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        // Simple protection: Check for Bearer token if CRON_SECRET is set
        if (process.env.CRON_SECRET) {
             if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
             }
        }
        
        console.log("Starting Automatic Sync (Cron)...");
        
        // Run syncs
        const carsResult = await executeSyncCars();
        const availResult = await executeSyncAvailability();
        
        return NextResponse.json({
            success: true,
            cars: carsResult,
            availability: availResult
        });
    } catch (error: any) {
        console.error("Cron Sync Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
