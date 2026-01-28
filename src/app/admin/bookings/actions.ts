'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { BookingStatus } from "@prisma/client"
import { getSession } from "@/lib/auth"

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const session = await getSession()
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    })

    revalidatePath("/admin/bookings")
    revalidatePath("/dashboard") // Update user dashboard too
    
    return { success: true }
  } catch (error) {
    console.error("Failed to update booking status:", error)
    return { error: "Failed to update booking status" }
  }
}
