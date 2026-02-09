
import { config } from "dotenv"
config()
import { executeSyncCars } from "../lib/renteon-sync"

async function run() {
    console.log("Starting manual sync trigger...")
    try {
        const result = await executeSyncCars()
        console.log("Sync Result:", JSON.stringify(result, null, 2))
    } catch (e) {
        console.error("Sync Failed:", e)
    }
}

run()
