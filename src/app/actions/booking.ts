'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sendBookingConfirmationEmail, sendWelcomeUserEmail } from "@/lib/email"
import { syncBookingToRenteon } from "@/lib/renteon"
import { login } from "@/lib/auth"

export async function createBooking(prevState: any, formData: FormData) {
  try {
    const session = await getSession()
    
    // ... Date parsing logic ...
    const startDateStr = formData.get('startDate') as string
    const endDateStr = formData.get('endDate') as string
    
    if (!startDateStr || startDateStr === 'undefined') {
        throw new Error("Invalid Start Date")
    }
    
    const startDate = new Date(startDateStr)
    let endDate = endDateStr && endDateStr !== 'undefined' ? new Date(endDateStr) : undefined
    
    if (!endDate) {
        // Fallback: 1 day rental
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 1)
    }

    const carId = formData.get('carId') as string
    
    // --- USER HANDLING ---
    let userId = session?.user?.id
    let isNewUser = false
    let autoPassword = ""

    const email = formData.get('email') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string

    // If not logged in, find or create user
    if (!userId) {
      // 1. Check if email exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        // If user exists but not logged in, we link the booking to them.
        // Optionally: we could require login, but for better conversion we allow it.
        // Ideally we should flag this booking or user verification?
        // For now: Just link it.
        userId = existingUser.id
      } else {
        // 2. Create new user (Guest -> User)
        isNewUser = true
        // Generate random password (8 chars)
        autoPassword = Math.random().toString(36).slice(-8)
        
        const newUser = await prisma.user.create({
          data: {
            email,
            name: `${firstName} ${lastName}`,
            phone,
            password: autoPassword, // In production, hash this!
            role: 'USER'
          }
        })
        
        userId = newUser.id

        // Auto-login the new user so they land on dashboard authenticated
        await login({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        })
      }
    }
    
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
    // We wrap this in a try-catch to ensure it doesn't crash the main flow if email fails
    try {
      await sendBookingConfirmationEmail(booking)
      
      // If new user, send welcome email with credentials
      if (isNewUser) {
        await sendWelcomeUserEmail(booking.user, autoPassword)
      }
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
    }

    // 4. Sync to Renteon (Fire and forget, or log errors)
    // We don't await this to fail the request, but we log the output
    syncBookingToRenteon(booking).catch(err => console.error("Background Renteon Sync Failed:", err))

    return { success: true, bookingId: booking.id }
    
  } catch (error) {
    console.error('Booking creation failed:', error)
    // Return a clean error message to the client instead of crashing
    return { error: 'Something went wrong while creating your booking. Please try again.' }
  }
}
