'use server'

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"

export async function createBooking(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session || !session.user?.id) {
    return { error: "You must be logged in to book a car." }
  }

  // Fetch full user data to get phone and name if needed
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    return { error: "User not found." }
  }

  let firstName = formData.get("firstName") as string
  let lastName = formData.get("lastName") as string
  let email = formData.get("email") as string
  let phone = formData.get("phone") as string
  const comments = formData.get("comments") as string

  // Fallback to user data if not provided
  if (!email) email = user.email
  if (!phone) phone = user.phone || ""
  
  if (!firstName || !lastName) {
    const nameParts = (user.name || "").split(" ")
    if (!firstName) firstName = nameParts[0] || ""
    if (!lastName) lastName = nameParts.slice(1).join(" ") || ""
  }

  // Validate required fields
  if (!firstName || !lastName || !email || !phone) {
    // Ideally we should return an error and ask user to fill profile, 
    // but for now let's try to proceed or return error.
    // If phone is missing from profile and form, we can't create booking.
    if (!phone) return { error: "Phone number is required. Please update your profile or provide it." }
  }

  const carId = formData.get("carId") as string
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const totalPrice = parseFloat(formData.get("totalPrice") as string)
  
  const extrasRaw = formData.get("extras") as string
  const extraIds = extrasRaw ? JSON.parse(extrasRaw) : []

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        carId,
        startDate: new Date(startDateStr),
        endDate: new Date(endDateStr),
        totalPrice,
        firstName,
        lastName,
        email,
        phone,
        comments,
        status: 'PENDING',
        extras: {
          connect: extraIds.map((id: string) => ({ id }))
        }
      }
    })
    
    // Redirect to dashboard with success message
    redirect("/dashboard?booking=success")
  } catch (error) {
    console.error("Booking creation failed:", error)
    // If it's a redirect error, rethrow it (Next.js handling)
    if ((error as any).message === "NEXT_REDIRECT") {
      throw error
    }
    return { error: "Failed to create booking. Please try again." }
  }
}
