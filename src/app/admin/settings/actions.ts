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

export async function updateSettings(weeklyHours: any) {
  // If we receive FormData (from old form), handle it, but we prefer object now
  // Actually let's just support the object call from client component
  
  await prisma.settings.upsert({
    where: { id: "settings" },
    update: { weeklyHours },
    create: { 
      id: "settings", 
      weeklyHours,
      openingTime: "08:00", // Fallback
      closingTime: "18:00"
    }
  })

  revalidatePath("/admin/settings")
}
