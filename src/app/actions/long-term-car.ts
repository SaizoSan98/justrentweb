
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { FuelType, Transmission } from "@prisma/client"
import { redirect } from "next/navigation"
import { put } from "@vercel/blob"
import sharp from "sharp"

const TARGET_WIDTH = 1200
const TARGET_HEIGHT = 800

async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null

  // Process image with Sharp
  let buffer: Buffer
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pipeline = sharp(Buffer.from(arrayBuffer))
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })

    buffer = await pipeline.toBuffer()
  } catch (error: any) {
    console.error("Image processing failed:", error)
    // Fallback to original buffer if sharp fails
    buffer = Buffer.from(await file.arrayBuffer())
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (blobToken) {
    try {
      const blob = await put(file.name, buffer, { 
        access: 'public',
        token: blobToken,
        addRandomSuffix: true
      })
      return blob.url
    } catch (error: any) {
      console.error("Vercel Blob upload failed:", error)
    }
  }

  return null
}

export async function createLongTermCar(formData: FormData) {
  let make = formData.get("make") as string
  if (make === "Other") {
    make = formData.get("customMake") as string
  }

  let model = formData.get("model") as string
  if (model === "Other") {
    model = formData.get("customModel") as string
  }

  const year = parseInt(formData.get("year") as string)
  let imageUrl = formData.get("imageUrl") as string
  const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string)
  const price1to3 = parseFloat(formData.get("price1to3") as string) || 0
  const price4to6 = parseFloat(formData.get("price4to6") as string) || 0
  const price7plus = parseFloat(formData.get("price7plus") as string) || 0
  const deposit = parseFloat(formData.get("deposit") as string)
  const description = formData.get("description") as string
  const transmission = formData.get("transmission") as Transmission
  const fuelType = formData.get("fuelType") as FuelType
  const seats = parseInt(formData.get("seats") as string)
  
  const imageFile = formData.get("imageFile") as File
  if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImage(imageFile)
      if (uploadedUrl) imageUrl = uploadedUrl
  }

  // Features are comma separated
  const featuresRaw = formData.get("features") as string
  const features = featuresRaw ? featuresRaw.split(",").map(f => f.trim()).filter(f => f !== "") : []

  if (!make || !model || !year || !monthlyPrice) {
    return { error: "Missing required fields" }
  }

  try {
    await prisma.longTermCar.create({
      data: {
        make,
        model,
        year,
        imageUrl,
        monthlyPrice,
        price1to3,
        price4to6,
        price7plus,
        deposit: deposit || 0,
        description,
        transmission: transmission || "MANUAL",
        fuelType: fuelType || "PETROL",
        seats: seats || 5,
        features,
        isAvailable: true
      }
    })
    
    revalidatePath("/admin/long-term")
    return { success: true }
  } catch (error) {
    console.error("Failed to create long term car:", error)
    return { error: "Failed to create car" }
  }
}

export async function updateLongTermCar(id: string, formData: FormData) {
  let make = formData.get("make") as string
  if (make === "Other") {
    make = formData.get("customMake") as string
  }

  let model = formData.get("model") as string
  if (model === "Other") {
    model = formData.get("customModel") as string
  }

  const year = parseInt(formData.get("year") as string)
  let imageUrl = formData.get("imageUrl") as string
  const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string)
  const price1to3 = parseFloat(formData.get("price1to3") as string) || 0
  const price4to6 = parseFloat(formData.get("price4to6") as string) || 0
  const price7plus = parseFloat(formData.get("price7plus") as string) || 0
  const deposit = parseFloat(formData.get("deposit") as string)
  const description = formData.get("description") as string
  const transmission = formData.get("transmission") as Transmission
  const fuelType = formData.get("fuelType") as FuelType
  const seats = parseInt(formData.get("seats") as string)
  const isAvailable = formData.get("isAvailable") === "on"
  
  const imageFile = formData.get("imageFile") as File
  if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadImage(imageFile)
      if (uploadedUrl) imageUrl = uploadedUrl
  }

  const featuresRaw = formData.get("features") as string
  const features = featuresRaw ? featuresRaw.split(",").map(f => f.trim()).filter(f => f !== "") : []

  try {
    await prisma.longTermCar.update({
      where: { id },
      data: {
        make,
        model,
        year,
        imageUrl,
        monthlyPrice,
        price1to3,
        price4to6,
        price7plus,
        deposit,
        description,
        transmission,
        fuelType,
        seats,
        features,
        isAvailable
      }
    })
    
    revalidatePath("/admin/long-term")
    return { success: true }
  } catch (error) {
    console.error("Failed to update long term car:", error)
    return { error: "Failed to update car" }
  }
}

export async function deleteLongTermCar(id: string) {
  try {
    await prisma.longTermCar.delete({
      where: { id }
    })
    revalidatePath("/admin/long-term")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete long term car:", error)
    return { error: "Failed to delete car" }
  }
}

export async function toggleLongTermAvailability(id: string, isAvailable: boolean) {
    try {
        await prisma.longTermCar.update({
            where: { id },
            data: { isAvailable }
        })
        revalidatePath("/admin/long-term")
        return { success: true }
    } catch (error) {
        return { error: "Failed to update status" }
    }
}
