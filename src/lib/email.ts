import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
// Note: You need to add RESEND_API_KEY to your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmationEmail(booking: any) {
  // detailed logging for debugging
  console.log("Attempting to send email to:", booking.email);
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is missing in environment variables. Email sending skipped.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    // In development/testing without a custom domain, you can only send to your own verified email on Resend
    // For production, you need to verify your domain
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: booking.email,
      subject: `Booking Confirmation - ${booking.car.make} ${booking.car.model}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000;">Booking Confirmation</h1>
          <p>Dear ${booking.firstName},</p>
          <p>Thank you for choosing JustRent! We have received your booking request.</p>
          
          <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Reference ID:</strong> ${booking.id.slice(-8).toUpperCase()}</p>
            <p><strong>Vehicle:</strong> ${booking.car.make} ${booking.car.model}</p>
            <p><strong>Pick-up:</strong> ${new Date(booking.startDate).toLocaleString()} (${booking.pickupLocation})</p>
            <p><strong>Drop-off:</strong> ${new Date(booking.endDate).toLocaleString()} (${booking.dropoffLocation})</p>
            <p><strong>Total Price:</strong> €${Number(booking.totalPrice).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${booking.paymentMethod.replace(/_/g, ' ')}</p>
          </div>

          <p>We will review your request and contact you shortly to confirm availability.</p>
          
          <p>Best regards,<br/>The JustRent Team</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
