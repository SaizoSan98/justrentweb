
'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sendWelcomeUserEmail } from "@/lib/email"

export async function createUser(formData: FormData) {
  const session = await getSession()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string || 'USER'

  if (!email || !password || !name) {
    return { error: 'Missing required fields' }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password, // Storing as plain text per current system implementation
        role: role as any,
      }
    })

    // Send Welcome Email with credentials
    await sendWelcomeUserEmail(newUser, password)

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to create user:", error)
    return { error: 'Failed to create user' }
  }
}
