
'use server'

import { prisma } from "@/lib/prisma"
import { login } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sendWelcomeClientEmail } from "@/lib/email"

export async function verifyAndCreateUser(formData: FormData) {
  const email = formData.get("email") as string
  const code = formData.get("code") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string
  const taxId = formData.get("taxId") as string

  // 1. Verify Code
  const verification = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token: code
      }
    }
  })

  if (!verification) {
    return { error: "Invalid verification code" }
  }

  if (new Date() > verification.expires) {
    return { error: "Verification code expired" }
  }

  // 2. Create User
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production hash this!
        phone,
        taxId: taxId || null,
        role: 'USER'
      }
    })

    // 3. Delete token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: code
        }
      }
    })

    // 4. Auto Login
    await login({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    })

    // 5. Send Welcome Email
    await sendWelcomeClientEmail(newUser)

    return { success: true }
  } catch (error) {
    console.error("Verification failed:", error)
    return { error: "Failed to create account" }
  }
}
