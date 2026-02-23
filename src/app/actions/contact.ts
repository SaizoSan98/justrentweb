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
    // Send email to admin
    await resend.emails.send({
      from: 'JustRent Contact <noreply@justrent.hu>',
      to: ['booking@jrandtrans.com'],
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
      from: 'JustRent <noreply@justrent.hu>',
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
    if (process.env.NODE_ENV === 'development') {
        console.log("Dev mode: Simulated email sending success")
        return { success: true }
    }
    return { error: "Failed to send message. Please try again later." }
  }
}
