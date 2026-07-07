import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getEventsStore,
  saveEventsStore,
  addOrder,
  addRegistration,
  getRegistrationsByEvent,
  type Registration,
} from "@/lib/store";
import {
  sendEventConfirmationEmail,
  sendAdminRegistrationNotification,
} from "@/lib/email";

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
    const { eventSlug, eventTitle, eventDate, eventFormat, firstName, lastName, phone, notes } =
      meta;

    // ── 1. Save registration for paid event registrations ────────────────────
    if (eventSlug && session.payment_status === "paid") {
      const events = getEventsStore();
      const mtgEvent = events.find((e) => e.slug === eventSlug);
      const email =
        session.customer_email ??
        session.customer_details?.email ??
        meta.email ??
        "";

      // Guard against double-fire: check if stripeSessionId already recorded
      const existing = getRegistrationsByEvent(eventSlug);
      const alreadyRegistered = existing.some(
        (r) => r.stripeSessionId === session.id
      );

      if (!alreadyRegistered) {
        const confirmedCount = existing.filter((r) => r.status === "confirmed").length;
        const isFull =
          mtgEvent && mtgEvent.playerLimit > 0 && confirmedCount >= mtgEvent.playerLimit;

        const registration: Registration = {
          id: crypto.randomUUID(),
          eventSlug,
          firstName: firstName ?? "",
          lastName: lastName ?? "",
          email,
          phone: phone ?? "",
          notes: notes ?? undefined,
          status: isFull ? "waitlisted" : "confirmed",
          stripeSessionId: session.id,
          amountPaid: session.amount_total ?? undefined,
          checkedIn: false,
          createdAt: new Date(event.created * 1000).toISOString(),
        };

        addRegistration(registration);

        // Sync registeredCount from actual confirmed registrations
        if (!isFull) {
          const updatedEvents = events.map((e) =>
            e.slug === eventSlug
              ? { ...e, registeredCount: confirmedCount + 1 }
              : e
          );
          saveEventsStore(updatedEvents);
        }

        // Send confirmation emails
        if (mtgEvent) {
          Promise.all([
            sendEventConfirmationEmail(registration, mtgEvent),
            sendAdminRegistrationNotification(registration, mtgEvent),
          ]).catch((err) => console.error("Webhook email error:", err));
        }

        console.log(
          `✓ Registration saved — ${registration.firstName} ${registration.lastName} | ${eventTitle} | ${registration.status}`
        );
      }
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

    console.log(
      `✓ Order saved — ${customerName} | ${description} | $${((session.amount_total ?? 0) / 100).toFixed(2)}`
    );
  }

  return NextResponse.json({ received: true });
}
