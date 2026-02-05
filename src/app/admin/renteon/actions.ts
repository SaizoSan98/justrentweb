
"use server"

import { getSession } from "@/lib/auth"
import { getRenteonToken } from "@/lib/renteon"

// We need to export this from lib/renteon or duplicate it here temporarily for testing
// Since getRenteonToken is not exported in the file I read, I will modify lib/renteon.ts first
// But wait, I can see getRenteonToken in the file content? No, I only read the first 100 lines.
// Let's assume I need to export it.

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
    // Removed 'v1' from URL based on 404 error and documentation pattern: https://{host}/{culture}/api/{controller}/{action}
    const response = await fetch('https://justrentandtrans.s11.renteon.com/en/api/offices', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`API Error: ${response.status} - ${text}`)
    }

    const data = await response.json()
    
    return { 
        success: true, 
        message: "Connection Successful!", 
        tokenPreview: `${token.substring(0, 10)}...`,
        data: data
    }

  } catch (error: any) {
    console.error("Renteon Test Failed:", error)
    return { 
        error: error.message || "Unknown error occurred",
        details: error.toString()
    }
  }
}
