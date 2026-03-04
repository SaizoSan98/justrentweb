"use server"

import { Resend } from 'resend'
import { LongTermInquiryEmail } from '@/components/emails/LongTermInquiryEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitLongTermInquiry(formData: FormData) {
  const carName = formData.get("carName") as string
  const duration = formData.get("duration") as string
  const monthlyPrice = formData.get("monthlyPrice") as string

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const message = formData.get("message") as string
  const honeypot = formData.get("lastName") as string

  // Spam protection: if the honeypot field is filled, it's a bot.
  if (honeypot) {
    console.log(`Honeypot triggered by potentially malicious bot submission. Car: ${carName}`)
    // Return early but simulate success to trick the bot
    return { success: true }
  }

  if (!name || !email || !phone) {
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
      subject: `New Long Term Inquiry: ${carName}`,
      replyTo: email,
      react: <LongTermInquiryEmail
        carName={carName}
        duration={duration}
        monthlyPrice={monthlyPrice}
        customerName={name}
        customerEmail={email}
        customerPhone={phone}
        message={message}
        type="ADMIN"
      />
    })

    // Send confirmation to user
    await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Inquiry Received: ${carName}`,
      react: <LongTermInquiryEmail
        carName={carName}
        duration={duration}
        monthlyPrice={monthlyPrice}
        customerName={name}
        customerEmail={email}
        customerPhone={phone}
        message={message}
        type="CUSTOMER"
      />
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send inquiry email:", error)
    // Return the actual error in dev mode for debugging
    if (process.env.NODE_ENV === 'development') {
      return { error: `Dev Error: ${(error as Error).message}` }
    }
    return { error: "Failed to send inquiry. Please try again later." }
  }
}
