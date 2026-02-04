
'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateInsurancePlan(id: string, formData: FormData) {
  const description = formData.get("description") as string
  
  await prisma.insurancePlan.update({
    where: { id },
    data: { description }
  })
  
  revalidatePath("/admin/insurances")
}
