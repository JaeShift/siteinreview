import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventsStore, saveEventsStore, addOrder } from "@/lib/store";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(body, sig, webhookSecret)
      : (JSON.parse(body) as Stripe.Event);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
    const { eventSlug, eventTitle, eventDate, eventFormat, firstName, lastName, phone, notes } = meta;

    // ── 1. Increment registered count for the event ─────────────────────────
    if (eventSlug) {
      const events = getEventsStore();
      const updated = events.map((e) =>
        e.slug === eventSlug
          ? { ...e, registeredCount: e.registeredCount + 1 }
          : e
      );
      saveEventsStore(updated);
    }

    // ── 2. Build a human-readable description ────────────────────────────────
    const parts = [eventTitle ?? eventSlug ?? "Event Registration"];
    if (eventDate) parts.push(eventDate);
    if (eventFormat) parts.push(eventFormat);
    const description = parts.join(" · ");

    // ── 3. Save the order ────────────────────────────────────────────────────
    const customerName =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : session.customer_details?.name ?? "Unknown";

    addOrder({
      id: session.id,
      stripeSessionId: session.id,
      customerName,
      customerEmail:
        session.customer_email ??
        session.customer_details?.email ??
        meta.email ??
        "",
      description,
      amountTotal: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      status: "paid",
      metadata: {
        ...meta,
        phone: phone ?? "",
        notes: notes ?? "",
      },
      createdAt: new Date(event.created * 1000).toISOString(),
    });

    console.log(`✓ Order saved — ${customerName} | ${description} | $${((session.amount_total ?? 0) / 100).toFixed(2)}`);
  }

  return NextResponse.json({ received: true });
}
