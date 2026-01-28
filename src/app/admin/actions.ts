'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"
import { logout } from "@/lib/auth"

export async function logoutAction() {
  await logout()
  redirect('/login')
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
      const blob = await put(imageFile.name, imageFile, { 
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      })
      imageUrl = blob.url
    } catch (error) {
      console.error("Failed to upload image:", error)
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
  } catch (error) {
    console.error("Failed to create car:", error)
  }
  
  redirect('/admin/cars')
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
      const blob = await put(imageFile.name, imageFile, { 
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      })
      imageUrl = blob.url
    } catch (error) {
      console.error("Failed to upload image:", error)
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
  } catch (error) {
    console.error("Failed to update car:", error)
  }
  
  redirect('/admin/cars')
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
    await prisma.user.update({
      where: { id },
      data
    })
    revalidatePath('/admin/users')
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
