import * as React from 'react';
import { Resend } from 'resend';
import { BookingEmail } from '@/components/emails/BookingEmail';
import { WelcomeUserEmail } from '@/components/emails/WelcomeUserEmail';
import { WelcomeClientEmail } from '@/components/emails/WelcomeClientEmail';
import { ForgotPasswordEmail } from '@/components/emails/ForgotPasswordEmail';

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'JustRent <onboarding@resend.dev>';

// Helper to send email safely
async function sendEmail({ to, subject, component }: { to: string, subject: string, component: React.ReactElement }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing. Email skipped:", subject);
    return { success: false, error: "Missing API Key" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react: component
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }
    
    console.log(`Email sent to ${to}: ${subject}`);
    return { success: true, data };
  } catch (error) {
    console.error("Email Exception:", error);
    return { success: false, error };
  }
}

export async function sendBookingConfirmationEmail(booking: any) {
  return sendEmail({
    to: booking.email,
    subject: `Booking Confirmed - ${booking.car.make} ${booking.car.model}`,
    component: <BookingEmail booking={booking} type="CONFIRMATION" />
  });
}

export async function sendBookingCancellationEmail(booking: any) {
  return sendEmail({
    to: booking.email,
    subject: `Booking Cancelled - ${booking.car.make} ${booking.car.model}`,
    component: <BookingEmail booking={booking} type="CANCELLATION" />
  });
}

export async function sendBookingModificationEmail(booking: any) {
  return sendEmail({
    to: booking.email,
    subject: `Booking Updated - ${booking.car.make} ${booking.car.model}`,
    component: <BookingEmail booking={booking} type="MODIFICATION" />
  });
}

export async function sendBookingCompletedEmail(booking: any) {
  return sendEmail({
    to: booking.email,
    subject: `Receipt for your rental - ${booking.car.make} ${booking.car.model}`,
    component: <BookingEmail booking={booking} type="COMPLETED" />
  });
}

export async function sendWelcomeUserEmail(user: any, password?: string) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to JustRent Partner Program',
    component: <WelcomeUserEmail 
      name={user.name || 'Partner'}
      email={user.email}
      password={password}
      loginUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'https://justrentandtrans.com'}/login`}
    />
  });
}

export async function sendWelcomeClientEmail(user: any) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to JustRent!',
    component: <WelcomeClientEmail 
      name={user.name || 'User'}
      loginUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'https://justrentandtrans.com'}/dashboard`}
    />
  });
}

export async function sendForgotPasswordEmail(user: any, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://justrentandtrans.com'}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password',
    component: <ForgotPasswordEmail 
      name={user.name || 'User'}
      resetLink={resetLink}
    />
  });
}
