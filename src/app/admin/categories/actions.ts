'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
})

export async function createCategory(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
    }

    const validated = categorySchema.parse(data)

    await prisma.category.create({
      data: validated
    })

    revalidatePath("/admin/categories")
    // return { success: true }
  } catch (error) {
    // return { error: "Failed to create category" }
    console.error("Failed to create category:", error)
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories")
    // return { success: true }
  } catch (error) {
    // return { error: "Failed to delete category" }
    console.error("Failed to delete category:", error)
  }
}
