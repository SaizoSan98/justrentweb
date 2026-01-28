'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export async function createBooking(prevState: any, formData: FormData) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
        return { error: 'You must be logged in to create a booking.' }
    }

    // Extract data from formData
    const carId = formData.get('carId') as string
    const startDate = new Date(formData.get('startDate') as string)
    const endDate = new Date(formData.get('endDate') as string)
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

    // Use logged in user ID
    const userId = session.user.id

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
      }
    })

    return { success: true, bookingId: booking.id }
    
  } catch (error) {
    console.error('Booking creation failed:', error)
    return { error: 'Failed to create booking. Please try again.' }
  }
}
