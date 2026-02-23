"use server"

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitLongTermInquiry(formData: FormData) {
  const carName = formData.get("carName") as string
  const duration = formData.get("duration") as string
  const monthlyPrice = formData.get("monthlyPrice") as string
  
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const message = formData.get("message") as string

  if (!name || !email || !phone) {
    return { error: "Please fill in all required fields" }
  }

  try {
    // Send email to admin
    await resend.emails.send({
      from: 'JustRent Inquiry <noreply@justrent.hu>', // Adjust domain
      to: ['booking@jrandtrans.com'], // Or env var
      subject: `New Long Term Inquiry: ${carName}`,
      html: `
        <h2>New Long Term Rental Inquiry</h2>
        <p><strong>Vehicle:</strong> ${carName}</p>
        <p><strong>Duration:</strong> ${duration} months</p>
        <p><strong>Monthly Price:</strong> €${monthlyPrice}</p>
        <br/>
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <br/>
        <h3>Message</h3>
        <p>${message || "No additional message."}</p>
      `
    })

    // Send confirmation to user
    await resend.emails.send({
      from: 'JustRent <noreply@justrent.hu>',
      to: [email],
      subject: `Inquiry Received: ${carName}`,
      html: `
        <h2>Thank you for your inquiry, ${name}!</h2>
        <p>We have received your request for the <strong>${carName}</strong>.</p>
        <p>Our team will review your request and get back to you shortly regarding availability and next steps.</p>
        <br/>
        <p>Best regards,<br/>JustRent Team</p>
      `
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send inquiry email:", error)
    // In dev mode without API key, simulate success
    if (process.env.NODE_ENV === 'development') {
        console.log("Dev mode: Simulated email sending success")
        return { success: true }
    }
    return { error: "Failed to send inquiry. Please try again later." }
  }
}
