import { getRenteonToken } from "../lib/renteon"

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api"

async function check() {
  const token = await getRenteonToken()
  if (!token) return

  const categoryId = 401; // Peugeot 208

  // Test various day counts
  const testCases = [1, 2, 3, 4, 5, 7, 10, 14]

  for (const numDays of testCases) {
    const startDate = new Date("2026-03-16T10:00:00.000Z")
    const endDate = new Date(startDate.getTime() + numDays * 24 * 60 * 60 * 1000)

    const payload: any = {
      CarCategoryId: categoryId,
      OfficeOutId: 54,
      OfficeInId: 54,
      DateOut: startDate.toISOString(),
      DateIn: endDate.toISOString(),
      BookAsCommissioner: true,
      PricelistId: 306,
      Currency: "EUR"
    }

    const res = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      const data = await res.json()
      const perDay = data.Total / numDays
      const rounded = Math.round(perDay)
      console.log(`${numDays} days: Total=${data.Total} | perDay=${perDay.toFixed(2)} | Math.round=${rounded}`)
    } else {
      console.log(`${numDays} days: ERROR ${res.status}`)
    }
  }
}
check().catch(console.error)
