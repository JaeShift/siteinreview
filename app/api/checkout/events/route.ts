import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventsStore } from "@/lib/store";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.json().catch(() => null);
  if (!body?.eventSlug) {
    return NextResponse.json({ error: "Missing eventSlug" }, { status: 400 });
  }

  const { eventSlug, firstName, lastName, email, phone, notes } = body as {
    eventSlug: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  };

  const events = getEventsStore();
  const event = events.find((e) => e.slug === eventSlug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  if (!event.entryFee || event.entryFee < 0.5) {
    return NextResponse.json({ error: "Event is free or below minimum charge — no payment needed" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title,
            description: `${event.format} — ${event.date} at ${event.time} · Kitsune Brewing Co.`,
          },
          unit_amount: event.entryFee * 100, // cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    customer_email: email,
    billing_address_collection: "required",
    custom_text: {
      submit: {
        message: "You'll receive a confirmation email. Please bring it to the event at Kitsune Brewing Co.",
      },
    },
    metadata: {
      eventSlug,
      eventTitle: event.title,
      eventDate: event.date,
      eventFormat: event.format,
      firstName,
      lastName,
      email,
      phone,
      notes: notes ?? "",
    },
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/events/${eventSlug}?cancelled=true`,
  });

  return NextResponse.json({ url: session.url });
}
