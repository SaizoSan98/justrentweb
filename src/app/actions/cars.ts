
'use server'

import { prisma } from "@/lib/prisma"

export async function getAvailableCarCount() {
  try {
    const count = await prisma.car.count({
      where: {
        status: 'AVAILABLE'
      }
    })
    return count
  } catch (error) {
    console.error("Failed to fetch car count:", error)
    return 0
  }
}
