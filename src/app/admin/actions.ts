'use server'

import { prisma } from "@/lib/prisma"
import { saveTranslation, translateText } from "@/lib/translation"
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

  // 1. Try Vercel Blob if configured (or use fallback token provided by user)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_bitpGQyeJHd07dgO_icHpH8DSy5m2Ouz04tszzrEjZZNHMd"

  if (blobToken) {
    try {
      const blob = await put(file.name, file, { 
        access: 'public',
        token: blobToken,
        addRandomSuffix: true
      })
      return blob.url
    } catch (error: any) {
      console.error("Vercel Blob upload failed:", error)
      // If we are on Vercel, re-throw the error to inform the user
      // instead of falling back to local storage which will also fail.
      if (process.env.VERCEL) {
        throw new Error(`Vercel Blob upload failed: ${error.message}. Check your BLOB_READ_WRITE_TOKEN.`)
      }
      // Fallback to local storage if NOT on Vercel (e.g. local dev without internet/token)
      console.warn("Falling back to local storage due to Blob error.")
    }
  }

    // 2. Local Storage Fallback
    // WARNING: This will NOT work in Vercel Production environments.
    if (process.env.NODE_ENV === 'production') {
      console.warn("Vercel Blob is not configured. Falling back to local storage (ephemeral in production).")
    }

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create unique filename
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}-${safeName}`
      
      // Ensure upload dir exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      // Check if we are in a read-only environment (like Vercel production)
      // This is a basic check. Vercel doesn't allow writing to public/ at runtime.
      // But for local development, this works.
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (err: any) {
        if (err.code !== 'EEXIST') {
           console.error("Could not create upload directory:", err)
           
           // Check specifically for Vercel environment where filesystem is read-only
           if (process.env.VERCEL) {
             throw new Error("Vercel Blob is not configured and local filesystem is read-only on Vercel. Please configure BLOB_READ_WRITE_TOKEN in your Vercel project settings.")
           }
           
           // If we are local, allow the error to propagate (likely permission issue)
           throw err
        }
      }
      
      // Write file
      const filePath = path.join(uploadDir, filename)
      await writeFile(filePath, buffer)
      
      // Return public URL
      return `/uploads/${filename}`
    } catch (error: any) {
      console.error("Local file upload failed:", error)
      // If we are on Vercel, this will fail. We should probably return null or handle it better.
      // For now, let's give a more descriptive error.
      throw new Error(`Failed to save image locally (are you on Vercel? use Vercel Blob): ${error.message}`)
    }
}

export async function logoutAction() {
  await logout()
  redirect('/')
}

export async function deleteCar(id: string) {
  try {
    // Transaction delete to handle foreign keys if cascade is not set in DB
    // Or just try delete and catch specific error to explain
    
    // Deleting related records manually to be safe (if Prisma schema doesn't cascade)
    // Based on error: `PricingTier_carId_fkey (index)`
    await prisma.$transaction([
        prisma.pricingTier.deleteMany({ where: { carId: id } }),
        prisma.carInsurance.deleteMany({ where: { carId: id } }),
        prisma.availability.deleteMany({ where: { carId: id } }),
        // Note: Bookings might need to be kept or handled differently (e.g. set carId to null?)
        // Usually we don't delete cars with bookings, but if requested...
        // Let's check if there are active bookings?
        // For now, let's assume we can delete associated data.
        prisma.car.delete({ where: { id } })
    ])

    revalidatePath('/admin/cars')
    return { success: true }
  } catch (error: any) {
    console.error("Failed to delete car:", error)
    if (error.code === 'P2003') {
        return { error: "Cannot delete car because it has related records (e.g. bookings)." }
    }
    return { error: error.message || "Failed to delete car" }
  }
}

export async function createCar(formData: FormData) {
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const description = formData.get('description') as string
  const descriptionHe = formData.get('description_he') as string
  const year = parseInt(formData.get('year') as string)
  const licensePlate = formData.get('licensePlate') as string
  const mileage = parseInt(formData.get('mileage') as string)
  const categoriesRaw = formData.get('categories') as string
  const categoryNames = categoriesRaw ? JSON.parse(categoriesRaw) : []
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
  
  const insurancePlans = await prisma.insurancePlan.findMany()

  try {
    const car = await prisma.car.create({
      data: {
        make,
        model,
        description,
        year,
        licensePlate,
        mileage,
        categories: {
          connect: categoryNames.map((name: string) => ({ name }))
        },
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
        },
        insuranceOptions: {
            create: insurancePlans.map((plan: any) => ({
                planId: plan.id,
                pricePerDay: parseFloat(formData.get(`insurance_price_${plan.id}`) as string) || 0,
                deposit: parseFloat(formData.get(`insurance_deposit_${plan.id}`) as string) || 0
            }))
        }
      }
    })

    // Save translations
    if (description) {
      const finalHe = descriptionHe || await translateText(description, 'he')
      await saveTranslation(car.id, 'Car', 'description', 'he', finalHe)
    }

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
  const description = formData.get('description') as string
  const descriptionHe = formData.get('description_he') as string
  const year = parseInt(formData.get('year') as string)
  const licensePlate = formData.get('licensePlate') as string
  const mileage = parseInt(formData.get('mileage') as string)
  const categoriesRaw = formData.get('categories') as string
  const categoryNames = categoriesRaw ? JSON.parse(categoriesRaw) : []
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

  const insurancePlans = await prisma.insurancePlan.findMany()

  try {
    await prisma.car.update({
      where: { id },
      data: {
        make,
        model,
        description,
        year,
        licensePlate,
        mileage,
        categories: {
          set: categoryNames.map((name: string) => ({ name }))
        },
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
        },
        insuranceOptions: {
            deleteMany: {},
            create: insurancePlans.map((plan: any) => ({
                planId: plan.id,
                pricePerDay: parseFloat(formData.get(`insurance_price_${plan.id}`) as string) || 0,
                deposit: parseFloat(formData.get(`insurance_deposit_${plan.id}`) as string) || 0
            }))
        }
      }
    })

    // Save translations
    if (description) {
      const finalHe = descriptionHe || await translateText(description, 'he')
      await saveTranslation(id, 'Car', 'description', 'he', finalHe)
    }

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
  const nameHe = formData.get('name_he') as string
  const description = formData.get('description') as string
  const descriptionHe = formData.get('description_he') as string
  const price = parseFloat(formData.get('price') as string)
  const priceType = formData.get('priceType') as string
  const icon = formData.get('icon') as string

  try {
    const extra = await prisma.extra.create({
      data: {
        name,
        description,
        price,
        priceType,
        icon
      }
    })

    // Save Translations
    if (name) {
      const finalNameHe = nameHe || await translateText(name, 'he')
      await saveTranslation(extra.id, 'Extra', 'name', 'he', finalNameHe)
    }

    if (description) {
      const finalDescHe = descriptionHe || await translateText(description, 'he')
      await saveTranslation(extra.id, 'Extra', 'description', 'he', finalDescHe)
    }

    revalidatePath('/admin/extras')
  } catch (error) {
    console.error("Failed to create extra:", error)
  }
}

export async function updateExtra(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const nameHe = formData.get('name_he') as string
  const description = formData.get('description') as string
  const descriptionHe = formData.get('description_he') as string
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

    // Save Translations
    if (name) {
      const finalNameHe = nameHe || await translateText(name, 'he')
      await saveTranslation(id, 'Extra', 'name', 'he', finalNameHe)
    }

    if (description) {
      const finalDescHe = descriptionHe || await translateText(description, 'he')
      await saveTranslation(id, 'Extra', 'description', 'he', finalDescHe)
    }

    revalidatePath('/admin/extras')
  } catch (error) {
    console.error("Failed to update extra:", error)
  }
}

import { getSession } from "@/lib/auth"

export async function deleteUser(userId: string) {
  const session = await getSession()
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return { error: "Unauthorized" }
  }

  // Prevent self-deletion
  if (session.user.id === userId) {
    return { error: "You cannot delete your own account." }
  }

  try {
    // Check if user is Superadmin
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (targetUser?.role === 'SUPERADMIN') {
        return { error: "Cannot delete a Superadmin." }
    }

    // Delete user (cascade will handle bookings if configured, but let's be explicit if needed)
    // Prisma schema usually handles cascade delete on relations if defined.
    // Assuming Bookings have onDelete: Cascade or we need to delete them first.
    // Let's delete the user directly, assuming Prisma handles cascade.
    // If not, we might need to delete bookings manually.
    // Checking schema: Booking relation to User does NOT have onDelete: Cascade in the provided snippet earlier.
    // So we must delete related data first.
    
    // 1. Delete Bookings
    // We need to delete dependent records of bookings first if cascading is not set up correctly in DB
    // Booking has relations: CarInsurance, Extra (M-N via _BookingToExtra table)
    
    // Find all bookings for this user to get their IDs
    const userBookings = await prisma.booking.findMany({
      where: { userId },
      select: { id: true }
    })
    
    const bookingIds = userBookings.map(b => b.id)

    if (bookingIds.length > 0) {
      // Delete CarInsurance entries linked to these bookings (if any - wait, CarInsurance is linked to Car and Plan, not Booking directly in schema provided?)
      // Schema says: CarInsurance is linked to Car and Plan. 
      // Booking has `insurancePlanId`. 
      // But let's check `DamageReport`? 
      // DamageReport is linked to Car, but not Booking directly in schema provided? 
      // Let's re-read schema.
      // Schema: 
      // Booking has `extras`. 
      // _BookingToExtra table handles M-N. Prisma handles this automatically on delete of Booking usually.
      
      // Let's explicitly delete bookings.
      await prisma.booking.deleteMany({
        where: { userId }
      })
    }
    
    // 2. Delete Verification Tokens (if any)
    await prisma.verificationToken.deleteMany({
      where: { identifier: targetUser?.email }
    })

    // 3. Delete User
    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete user:", error)
    return { error: "Failed to delete user" }
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
