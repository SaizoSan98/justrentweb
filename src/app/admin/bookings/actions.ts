'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { BookingStatus } from "@prisma/client"
import { getSession } from "@/lib/auth"
import { cancelBookingInRenteon } from "@/lib/renteon"
import { 
  sendBookingConfirmationEmail, 
  sendBookingCancellationEmail, 
  sendBookingCompletedEmail 
} from "@/lib/email"

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const session = await getSession()
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true }
    })

    if (!booking) return { error: "Booking not found" }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status }
    })

    // Send Email Notification based on status
    if (status === 'CONFIRMED') {
      await sendBookingConfirmationEmail(booking)
    } else if (status === 'CANCELLED') {
      await sendBookingCancellationEmail(booking)
    } else if (status === 'COMPLETED') {
      await sendBookingCompletedEmail(booking)
    }

    // Sync with Renteon if Cancelled
    if (status === 'CANCELLED') {
      // We run this in background so we don't block the UI response
      // But we need to pass the booking object.
      // Ideally we should await it to report errors, but to keep UI snappy we can just fire it.
      // However, for Admin actions, waiting is usually acceptable to ensure sync.
      
      try {
        await cancelBookingInRenteon(booking)
      } catch (err) {
        console.error("Failed to cancel in Renteon:", err)
        // We don't rollback the local cancel, but we log it.
      }
    }

    revalidatePath("/admin/bookings")
    revalidatePath("/dashboard") // Update user dashboard too
    
    return { success: true }
  } catch (error) {
    console.error("Failed to update booking status:", error)
    return { error: "Failed to update booking status" }
  }
}
