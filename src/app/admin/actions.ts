'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"

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
  
  let imageUrl = formData.get('imageUrl') as string
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
        imageUrl,
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
        imageUrl,
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

  try {
    await prisma.extra.create({
      data: {
        name,
        description,
        price,
        priceType
      }
    })
    revalidatePath('/admin/extras')
  } catch (error) {
    console.error("Failed to create extra:", error)
  }
}
