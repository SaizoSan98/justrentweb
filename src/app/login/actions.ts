'use server'

import { prisma } from "@/lib/prisma"
import { login } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  console.log("Login action started")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
  console.log("Attempting login for:", email)

  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  console.log("User found:", user ? "yes" : "no")

  // 2. Validate credentials (using plain text for demo as requested by current seed setup)
  // In production, use bcrypt.compare(password, user.password)
  if (!user || user.password !== password) {
    console.log("Invalid credentials")
    // In a real app, we should return an error to display on the form
    // For now, we just redirect back to login (could add query param for error)
    redirect("/login?error=invalid_credentials")
  }

  // 3. Create session
  // Only allow admin access for now based on requirement "admin page-t köss be"
  if (user.role !== 'ADMIN') {
      console.log("Unauthorized role:", user.role)
      redirect("/login?error=unauthorized")
  }

  console.log("Credentials valid, creating session...")
  try {
    await login({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })
    console.log("Session created successfully")
  } catch (err) {
    console.error("Session creation failed:", err)
    throw err
  }

  console.log("Redirecting to /admin")
  redirect("/admin")
}
