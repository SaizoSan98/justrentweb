
import { executeSyncCars } from "./src/lib/renteon-sync.ts";

async function runSync() {
    console.log("Starting Sync...");
    const result = await executeSyncCars();
    console.log("Sync Result:", JSON.stringify(result, null, 2));
}

runSync().catch(console.error);
