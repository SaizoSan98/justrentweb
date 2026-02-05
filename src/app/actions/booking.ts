'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { syncBookingToRenteon } from "@/lib/renteon"

export async function createBooking(prevState: any, formData: FormData) {
  try {
    const session = await getSession()
    
    // Allow guest booking if session is missing, but preferably we should require auth or create a guest user.
    // However, the error "Application error: a server-side exception has occurred" usually means a crash.
    // Let's check if session exists. If not, we might be trying to access session.user.id which throws if session is null.
    // Based on the code: if (!session?.user?.id) return { error: ... }
    // This is safe.
    
    // The issue might be date parsing if startDate is invalid string "undefined" or similar.
    const startDateStr = formData.get('startDate') as string
    const endDateStr = formData.get('endDate') as string
    
    if (!startDateStr || startDateStr === 'undefined') {
        throw new Error("Invalid Start Date")
    }
    
    const startDate = new Date(startDateStr)
    // If endDate is undefined/null, we default to startDate + 1 day or throw error?
    // The previous fix in CheckoutForm ensures we display 1 day if undefined, 
    // but here we are receiving form data.
    let endDate = endDateStr && endDateStr !== 'undefined' ? new Date(endDateStr) : undefined
    
    if (!endDate) {
        // Fallback: 1 day rental
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 1)
    }

    // Extract carId here as it was missed in previous patch
    const carId = formData.get('carId') as string
    
    // ... rest of the code
    
    // Also, if session is null, we need to handle userId.
    // If we want to allow guest bookings, we need to change the schema or create a placeholder user.
    // For now, let's assume auth is required as per the check.
    
    // IF NO USER ID (Guest Checkout scenario which might be happening if auth check was relaxed in page.tsx)
    // We need to either create a user or have optional userId in schema.
    // Assuming schema requires userId, we must return error if not logged in.
    if (!session?.user?.id) {
         // return { error: 'You must be logged in to create a booking.' }
         // To fix the crash, we return an error message instead of letting it crash later if userId is null
         return { error: 'Please sign in to complete your booking.' }
    }
    const userId = session.user.id
    
    const pickupLocation = formData.get('pickupLocation') as string
    const dropoffLocation = formData.get('dropoffLocation') as string
    const totalPrice = Number(formData.get('totalPrice'))
    
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const flightNumber = formData.get('flightNumber') as string
    const comments = formData.get('comments') as string
    
    const isCompany = formData.get('isCompany') === 'true'
    const companyName = formData.get('companyName') as string
    const companyAddress = formData.get('companyAddress') as string
    const companyTaxId = formData.get('companyTaxId') as string
    
    const fullInsurance = formData.get('fullInsurance') === 'true'
    const paymentMethod = formData.get('paymentMethod') as string
    const selectedExtras = JSON.parse(formData.get('selectedExtras') as string) as string[]

    // 2. Create Booking
    const booking = await prisma.booking.create({
      data: {
        startDate,
        endDate,
        totalPrice,
        pickupLocation,
        dropoffLocation,
        status: 'PENDING',
        userId,
        carId,
        firstName,
        lastName,
        email,
        phone,
        flightNumber,
        comments,
        isCompany,
        companyName: isCompany ? companyName : null,
        companyAddress: isCompany ? companyAddress : null,
        companyTaxId: isCompany ? companyTaxId : null,
        fullInsurance,
        paymentMethod,
        extras: {
          connect: selectedExtras.map(id => ({ id }))
        }
      },
      include: {
        car: true
      }
    })

    // 3. Send Confirmation Email (Async, don't block response)
    // We await it here to ensure it works, but in high load you might offload it.
    await sendBookingConfirmationEmail(booking)

    // 4. Sync to Renteon (Fire and forget, or log errors)
    // We don't await this to fail the request, but we log the output
    syncBookingToRenteon(booking).catch(err => console.error("Background Renteon Sync Failed:", err))

    return { success: true, bookingId: booking.id }
    
  } catch (error) {
    console.error('Booking creation failed:', error)
    return { error: 'Failed to create booking. Please try again.' }
  }
}
