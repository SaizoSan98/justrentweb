'use server'

import { prisma } from "@/lib/prisma"
import { login } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  // 2. Validate credentials
  if (!user || user.password !== password) {
    redirect("/login?error=invalid_credentials")
  }

  // 3. Create session
  try {
    await login({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
  } catch (err) {
    console.error("Session creation failed:", err)
    throw err
  }

  // 4. Redirect based on role
  if (user.role === 'ADMIN') {
    redirect("/admin")
  } else {
    redirect("/dashboard")
  }
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  // 1. Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existingUser) {
    redirect("/login?error=email_taken&tab=register")
  }
  
  // 2. Create user
  try {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production hash this!
        role: 'USER'
      }
    })
    
    // 3. Auto login
    await login({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    })
    
  } catch (err) {
    console.error("Registration failed:", err)
    redirect("/login?error=registration_failed&tab=register")
  }
  
  redirect("/dashboard")
}
