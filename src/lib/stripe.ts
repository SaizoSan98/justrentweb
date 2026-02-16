import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2026-01-28.clover' as any, // Forced for now until types align
  typescript: true,
});
