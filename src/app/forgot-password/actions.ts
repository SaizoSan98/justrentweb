
'use server'

import { prisma } from "@/lib/prisma"
import { sendForgotPasswordEmail } from "@/lib/email"
import { encrypt } from "@/lib/auth"

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user not found to prevent enumeration
      return { success: true }
    }

    // Generate a secure token valid for 1 hour
    const token = await encrypt({ 
      sub: user.id, 
      type: 'password-reset',
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    })

    await sendForgotPasswordEmail(user, token)

    return { success: true }
  } catch (error) {
    console.error("Password reset request failed:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
