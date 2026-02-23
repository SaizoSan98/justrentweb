"use server"

import { Resend } from 'resend'
import { ContactEmail } from '@/components/emails/ContactEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContactForm(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  if (!name || !email || !message) {
    return { error: "Please fill in all required fields" }
  }

  try {
    // Check if API key is present
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is missing")
      // In dev mode, simulate success if key is missing
      if (process.env.NODE_ENV === 'development') {
          console.log("Dev mode (no key): Simulated email sending success")
          return { success: true }
      }
      return { error: "Server configuration error (missing email key)" }
    }

    // Use EMAIL_FROM to match src/lib/email.tsx convention
    const fromEmail = process.env.EMAIL_FROM || 'JustRent <booking@jrandtrans.com>'
    // Use hardcoded admin email as in src/lib/email.tsx for consistency, or env var
    const adminEmail = process.env.ADMIN_EMAIL || 'booking@jrandtrans.com'

    // Send email to admin
    await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `New Contact Message: ${subject}`,
      replyTo: email,
      react: <ContactEmail 
        name={name}
        email={email}
        phone={phone}
        subject={subject}
        message={message}
        type="ADMIN"
      />
    })

    // Send confirmation to user
    await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `We received your message: ${subject}`,
      react: <ContactEmail 
        name={name}
        email={email}
        phone={phone}
        subject={subject}
        message={message}
        type="CUSTOMER"
      />
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send contact email:", error)
    // Return the actual error in dev mode for debugging
    if (process.env.NODE_ENV === 'development') {
        return { error: `Dev Error: ${(error as Error).message}` }
    }
    return { error: "Failed to send message. Please try again later." }
  }
}
