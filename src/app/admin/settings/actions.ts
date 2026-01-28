'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: "settings" }
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "settings",
        openingTime: "08:00",
        closingTime: "18:00"
      }
    })
  }

  return settings
}

export async function updateSettings(formData: FormData) {
  const openingTime = formData.get("openingTime") as string
  const closingTime = formData.get("closingTime") as string

  await prisma.settings.upsert({
    where: { id: "settings" },
    update: { openingTime, closingTime },
    create: { id: "settings", openingTime, closingTime }
  })

  revalidatePath("/admin/settings")
  return { success: true }
}
