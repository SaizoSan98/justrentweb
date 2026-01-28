'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"
import { logout, login } from "@/lib/auth"
import fs from "fs"
import path from "path"
import { writeFile, mkdir } from "fs/promises"

// Helper to upload image (Vercel Blob OR Local Fallback)
async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null

  // 1. Try Vercel Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(file.name, file, { 
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      })
      return blob.url
    } catch (error) {
      console.error("Vercel Blob upload failed, falling back to local storage:", error)
      // Fallback to local storage if blob fails
    }
  }

  // 2. Local Storage Fallback
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${safeName}`
    
    // Ensure upload dir exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    
    // Write file
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    // Return public URL
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Local file upload failed:", error)
    throw new Error("Failed to save image locally")
  }
}

export async function logoutAction() {
  await logout()
  redirect('/')
}

export async function deleteCar(id: string) {
  try {
    await prisma.car.delete({
      where: { id }
    })
    revalidatePath('/admin/cars')
  } catch (error) {
    console.error("Failed to delete car:", error)
  }
}

export async function createCar(formData: FormData) {
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = parseInt(formData.get('year') as string)
  const licensePlate = formData.get('licensePlate') as string
  const mileage = parseInt(formData.get('mileage') as string)
  const category = formData.get('category') as string
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string)
  const deposit = parseFloat(formData.get('deposit') as string)
  const fullInsurancePrice = parseFloat(formData.get('fullInsurancePrice') as string)
  const pickupAfterHoursPrice = parseFloat(formData.get('pickupAfterHoursPrice') as string) || 0
  const returnAfterHoursPrice = parseFloat(formData.get('returnAfterHoursPrice') as string) || 0
  const extraKmPrice = parseFloat(formData.get('extraKmPrice') as string) || 0
  const unlimitedMileagePrice = parseFloat(formData.get('unlimitedMileagePrice') as string) || 0
  
  const seats = parseInt(formData.get('seats') as string)
  const doors = parseInt(formData.get('doors') as string)
  const suitcases = parseInt(formData.get('suitcases') as string)
  const transmission = formData.get('transmission') as "MANUAL" | "AUTOMATIC"
  const fuelType = formData.get('fuelType') as "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID"
  
  const orSimilar = formData.get('orSimilar') === 'true'
  const airConditioning = formData.get('airConditioning') === 'true'
  const fuelPolicy = formData.get('fuelPolicy') as string
  const dailyMileageLimit = formData.get('dailyMileageLimit') ? parseInt(formData.get('dailyMileageLimit') as string) : null
  
  const featuresRaw = formData.get('features') as string
  const features = featuresRaw ? JSON.parse(featuresRaw) : []

  let imageUrl = formData.get('imageUrl') as string
  const imageFile = formData.get('image') as File
  const additionalImagesRaw = formData.get('additionalImages') // Expecting multiple files logic on client but here basic

  if (imageFile && imageFile.size > 0) {
    try {
      const uploadedUrl = await uploadImage(imageFile)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error)
      return { success: false, error: `Image upload failed: ${error.message}` }
    }
  }

  // Handle multiple images if implemented fully
  const imagesRaw = formData.get('images') as string
  const images = imagesRaw ? JSON.parse(imagesRaw) : []

  const pricingTiersRaw = formData.get('pricingTiers') as string
  const pricingTiers = pricingTiersRaw ? JSON.parse(pricingTiersRaw) : []

  try {
    await prisma.car.create({
      data: {
        make,
        model,
        year,
        licensePlate,
        mileage,
        category,
        pricePerDay,
        deposit,
        fullInsurancePrice,
        pickupAfterHoursPrice,
        returnAfterHoursPrice,
        extraKmPrice,
        unlimitedMileagePrice,
        seats,
        doors,
        suitcases,
        transmission,
        fuelType,
        orSimilar,
        airConditioning,
        fuelPolicy,
        dailyMileageLimit,
        features,
        imageUrl,
        images,
        status: 'AVAILABLE',
        pricingTiers: {
          create: pricingTiers.map((tier: any) => ({
            minDays: tier.minDays,
            maxDays: tier.maxDays,
            pricePerDay: tier.pricePerDay,
            deposit: tier.deposit
          }))
        }
      }
    })
    revalidatePath('/admin/cars')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to create car:", error)
    // Check for Prisma unique constraint error (P2002)
    if (error.code === 'P2002' && error.meta?.target?.includes('licensePlate')) {
      return { success: false, error: "A car with this license plate already exists." }
    }
    return { success: false, error: error.message || "Failed to create car" }
  }
}

export async function updateCar(formData: FormData) {
  const id = formData.get('id') as string
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = parseInt(formData.get('year') as string)
  const licensePlate = formData.get('licensePlate') as string
  const mileage = parseInt(formData.get('mileage') as string)
  const category = formData.get('category') as string
  const pricePerDay = parseFloat(formData.get('pricePerDay') as string)
  const deposit = parseFloat(formData.get('deposit') as string)
  const fullInsurancePrice = parseFloat(formData.get('fullInsurancePrice') as string)
  const pickupAfterHoursPrice = parseFloat(formData.get('pickupAfterHoursPrice') as string) || 0
  const returnAfterHoursPrice = parseFloat(formData.get('returnAfterHoursPrice') as string) || 0
  const extraKmPrice = parseFloat(formData.get('extraKmPrice') as string) || 0
  const unlimitedMileagePrice = parseFloat(formData.get('unlimitedMileagePrice') as string) || 0

  const seats = parseInt(formData.get('seats') as string)
  const doors = parseInt(formData.get('doors') as string)
  const suitcases = parseInt(formData.get('suitcases') as string)
  const transmission = formData.get('transmission') as "MANUAL" | "AUTOMATIC"
  const fuelType = formData.get('fuelType') as "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID"
  
  const orSimilar = formData.get('orSimilar') === 'true'
  const airConditioning = formData.get('airConditioning') === 'true'
  const fuelPolicy = formData.get('fuelPolicy') as string
  const dailyMileageLimit = formData.get('dailyMileageLimit') ? parseInt(formData.get('dailyMileageLimit') as string) : null
  
  const featuresRaw = formData.get('features') as string
  const features = featuresRaw ? JSON.parse(featuresRaw) : []
  
  let imageUrl = formData.get('imageUrl') as string // Existing URL if no new file
  const imageFile = formData.get('image') as File
  
  if (imageFile && imageFile.size > 0) {
    try {
      const uploadedUrl = await uploadImage(imageFile)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error)
      return { success: false, error: `Image upload failed: ${error.message}` }
    }
  }

  const imagesRaw = formData.get('images') as string
  const images = imagesRaw ? JSON.parse(imagesRaw) : []

  const pricingTiersRaw = formData.get('pricingTiers') as string
  const pricingTiers = pricingTiersRaw ? JSON.parse(pricingTiersRaw) : []

  try {
    await prisma.car.update({
      where: { id },
      data: {
        make,
        model,
        year,
        licensePlate,
        mileage,
        category,
        pricePerDay,
        deposit,
        fullInsurancePrice,
        pickupAfterHoursPrice,
        returnAfterHoursPrice,
        extraKmPrice,
        unlimitedMileagePrice,
        seats,
        doors,
        suitcases,
        transmission,
        fuelType,
        orSimilar,
        airConditioning,
        fuelPolicy,
        dailyMileageLimit,
        features,
        imageUrl,
        images,
        pricingTiers: {
          deleteMany: {}, // Remove existing tiers
          create: pricingTiers.map((tier: any) => ({
            minDays: tier.minDays,
            maxDays: tier.maxDays,
            pricePerDay: tier.pricePerDay,
            deposit: tier.deposit
          }))
        }
      }
    })
    revalidatePath('/admin/cars')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update car:", error)
    if (error.code === 'P2002' && error.meta?.target?.includes('licensePlate')) {
      return { success: false, error: "A car with this license plate already exists." }
    }
    return { success: false, error: error.message || "Failed to update car" }
  }
}

export async function deleteExtra(id: string) {
  try {
    await prisma.extra.delete({
      where: { id }
    })
    revalidatePath('/admin/extras')
  } catch (error) {
    console.error("Failed to delete extra:", error)
  }
}

export async function createExtra(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const priceType = formData.get('priceType') as string
  const icon = formData.get('icon') as string

  try {
    await prisma.extra.create({
      data: {
        name,
        description,
        price,
        priceType,
        icon
      }
    })
    revalidatePath('/admin/extras')
  } catch (error) {
    console.error("Failed to create extra:", error)
  }
}

export async function updateExtra(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const priceType = formData.get('priceType') as string
  const icon = formData.get('icon') as string

  try {
    await prisma.extra.update({
      where: { id },
      data: {
        name,
        description,
        price,
        priceType,
        icon
      }
    })
    revalidatePath('/admin/extras')
  } catch (error) {
    console.error("Failed to update extra:", error)
  }
}

export async function toggleUserRole(userId: string, currentRole: string) {
  // Logic: USER -> ADMIN -> USER. 
  // SUPERADMIN cannot be changed via this simple toggle (needs special handling if we want to downgrade superadmin)
  if (currentRole === 'SUPERADMIN') return

  const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any }
    })
    revalidatePath('/admin/users')
  } catch (error) {
    console.error("Failed to update user role:", error)
  }
}

export async function banUser(userId: string, reason: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, banReason: reason }
    })
    revalidatePath('/admin/users')
  } catch (error) {
    console.error("Failed to ban user:", error)
  }
}

export async function unbanUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, banReason: null }
    })
    revalidatePath('/admin/users')
  } catch (error) {
    console.error("Failed to unban user:", error)
  }
}

export async function updateUserByAdmin(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const taxId = formData.get('taxId') as string
  const password = formData.get('password') as string

  const data: any = { name, email, phone, taxId }
  if (password && password.trim() !== '') {
    data.password = password
  }

  try {
    await prisma.user.update({
      where: { id },
      data
    })
    revalidatePath('/admin/users')
  } catch (error) {
    console.error("Failed to update user:", error)
  }
}

export async function updateUserProfile(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const data: any = { name, email }
  if (password && password.trim() !== '') {
    data.password = password // In production, hash this!
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data
    })
    
    // Update session with new data
    await login({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role
    })

    revalidatePath('/admin/users')
    revalidatePath('/admin') // Refresh layout to show new name
  } catch (error) {
    console.error("Failed to update profile:", error)
  }
}

export async function toggleFeaturedCar(carId: string, isFeatured: boolean) {
  try {
    await prisma.car.update({
      where: { id: carId },
      data: { isFeatured }
    })
    revalidatePath('/admin/featured')
    revalidatePath('/') // Update homepage
  } catch (error) {
    console.error("Failed to toggle featured status:", error)
  }
}

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  const description = formData.get('description') as string
  const imageUrl = formData.get('imageUrl') as string

  try {
    await prisma.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl
      }
    })
    revalidatePath('/admin/categories')
  } catch (error) {
    console.error("Failed to create category:", error)
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id }
    })
    revalidatePath('/admin/categories')
  } catch (error) {
    console.error("Failed to delete category:", error)
  }
}
