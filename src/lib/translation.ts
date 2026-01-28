'use server'

import { prisma } from "@/lib/prisma"

// @ts-ignore
import translate from "translate-google"

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return ""
  
  try {
    // translate-google uses the free web API. 
    // Note: This is an unofficial library and might be rate-limited.
    // Ideally, for production, switch to a paid API or an official key-based free tier.
    const res = await translate(text, { to: targetLang })
    return res
  } catch (err) {
    console.error("Translation failed:", err)
    // Fallback: append prefix if failed
    return `[${targetLang.toUpperCase()}] ${text}`
  }
}

export async function saveTranslation(entityId: string, entityType: string, field: string, language: string, value: string) {
  if (!value) return

  await prisma.translation.upsert({
    where: {
      entityId_entityType_field_language: {
        entityId,
        entityType,
        field,
        language
      }
    },
    update: { value },
    create: {
      entityId,
      entityType,
      field,
      language,
      value
    }
  })
}

export async function getTranslations(entityIds: string[], entityType: string, language: string) {
  const translations = await prisma.translation.findMany({
    where: {
      entityId: { in: entityIds },
      entityType,
      language
    }
  })
  
  return translations
}
