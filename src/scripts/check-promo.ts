import { getRenteonToken, fetchCarCategories } from "../lib/renteon"

const RENTEON_API_URL = "https://justrentandtrans.s11.renteon.com/en/api"

async function check() {
  const token = await getRenteonToken()
  if (!token) return

  const categories = await fetchCarCategories();
  const categoryId = categories[0].Id;

  const payload: any = {
    CarCategoryId: categoryId,
    OfficeOutId: 54,
    OfficeInId: 54,
    DateOut: "2026-08-01T10:00:00.000Z",
    DateIn: "2026-08-05T10:00:00.000Z",
    BookAsCommissioner: true,
    PricelistId: 306,
    Currency: "EUR"
  }

  const res1 = await fetch(`${RENTEON_API_URL}/bookings/calculate`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  const data1 = await res1.json()
  console.log(JSON.stringify(data1, null, 2))
}
check().catch(console.error)
