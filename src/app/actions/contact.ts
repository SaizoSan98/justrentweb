"use server"

import { Resend } from 'resend'

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

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const adminEmail = process.env.ADMIN_EMAIL || 'booking@jrandtrans.com'

    // Send email to admin
    await resend.emails.send({
      from: `JustRent Contact <${fromEmail}>`,
      to: [adminEmail],
      subject: `New Contact Message: ${subject}`,
      replyTo: email,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <br/>
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <br/>
        <h3>Message</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      `
    })

    // Send confirmation to user
    await resend.emails.send({
      from: `JustRent <${fromEmail}>`,
      to: [email],
      subject: `We received your message: ${subject}`,
      html: `
        <h2>Thank you for contacting us, ${name}!</h2>
        <p>We have received your message regarding "<strong>${subject}</strong>".</p>
        <p>Our team will review your inquiry and get back to you as soon as possible (usually within 24 hours).</p>
        <br/>
        <p>Best regards,<br/>JustRent Team</p>
      `
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
