import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { amount, currency = "eur" } = await request.json();

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      // In the future, you can add metadata here (e.g. orderId)
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
