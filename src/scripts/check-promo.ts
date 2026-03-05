import { getRenteonToken } from "../lib/renteon"

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api"

async function check() {
  const token = await getRenteonToken()
  if (!token) return

  const categoryId = 401; // Peugeot 208

  const basePayload: any = {
    CarCategoryId: categoryId,
    OfficeOutId: 54,
    OfficeInId: 54,
    DateOut: "2026-08-01T10:00:00.000Z",
    DateIn: "2026-08-06T10:00:00.000Z", // 5 days
    BookAsCommissioner: true,
    PricelistId: 306,
    Currency: "EUR"
  }

  // WITHOUT PROMO
  console.log("=== WITHOUT PROMO ===")
  const res1 = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(basePayload)
  })
  const data1 = await res1.json()
  console.log(`Total: ${data1.Total}`)
  console.log(`TotalRent: ${data1.Totals?.[0]?.TotalRent}`)
  console.log(`TotalDiscount: ${data1.Totals?.[0]?.TotalDiscount}`)

  // WITH PROMO gili2
  console.log("\n=== WITH PROMO (gili2) ===")
  const promoPayload = { ...basePayload, PromoCode: "gili2" }
  const res2 = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(promoPayload)
  })

  if (res2.ok) {
    const data2 = await res2.json()
    console.log(`Total: ${data2.Total}`)
    console.log(`TotalRent: ${data2.Totals?.[0]?.TotalRent}`)
    console.log(`TotalDiscount: ${data2.Totals?.[0]?.TotalDiscount}`)
    console.log(`PromoCode: ${data2.PromoCode}`)

    // Check ALL services for discounts
    const rent2 = data2.Services?.find((s: any) => s.IsRent)
    if (rent2) {
      console.log(`Rent DiscountAmount: ${rent2.DiscountAmount}`)
      console.log(`Rent DiscountPercentage: ${rent2.DiscountPercentage}`)
      console.log(`Rent Amount/day: ${rent2.ServicePrice?.Amount}`)
    }

    console.log(`\nDifference (saving): ${data1.Total - data2.Total} EUR`)
  } else {
    console.log("ERROR:", await res2.text())
  }
}
check().catch(console.error)
