'use server'

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function setLanguage(formData: FormData) {
  const lang = formData.get("lang") as string
  if (lang === 'he' || lang === 'en') {
    (await cookies()).set("NEXT_LOCALE", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 })
  }
  
  // Get the current path from the Referer header to stay on the same page
  // We can't easily get it directly here without passing it, but usually this is called from a component
  // For now, redirect to home or use revalidatePath if we knew the path. 
  // A simple redirect to the referer is best if possible, or just back to /
  // Let's rely on the client component to refresh or the server action to redirect.
}
