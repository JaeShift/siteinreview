import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getEventsStore,
  getOrdersStore,
  getRegistrationsStore,
  saveEventsStore,
  saveOrdersStore,
  updateRegistration,
} from "@/lib/store";
import { sendRefundNotificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: Params) {
  const registration = getRegistrationsStore().find((item) => item.id === params.id);
  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  if (!registration.stripeSessionId || !registration.amountPaid) {
    return NextResponse.json(
      { error: "This registration does not have a Stripe payment to refund" },
      { status: 400 }
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(registration.stripeSessionId);
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "No completed Stripe payment was found for this registration" },
        { status: 400 }
      );
    }

    const refund = await stripe.refunds.create(
      { payment_intent: paymentIntentId },
      { idempotencyKey: `registration-refund-${registration.id}` }
    );

    if (refund.status === "failed" || refund.status === "canceled") {
      return NextResponse.json(
        { error: "Stripe could not complete the refund" },
        { status: 502 }
      );
    }

    const registrations = updateRegistration(registration.id, {
      status: "refunded",
      checkedIn: false,
      checkedInAt: undefined,
    });
    const updated = registrations.find((item) => item.id === registration.id);
    const events = getEventsStore();
    const confirmedCount = registrations.filter(
      (item) =>
        item.eventSlug === registration.eventSlug && item.status === "confirmed"
    ).length;
    saveEventsStore(
      events.map((event) =>
        event.slug === registration.eventSlug
          ? { ...event, registeredCount: confirmedCount }
          : event
      )
    );

    saveOrdersStore(
      getOrdersStore().map((order) =>
        order.stripeSessionId === registration.stripeSessionId
          ? { ...order, status: "refunded" as const }
          : order
      )
    );

    let emailSent = true;
    try {
      const eventTitle =
        events.find((event) => event.slug === registration.eventSlug)?.title ??
        registration.eventSlug;
      await sendRefundNotificationEmail({
        email: registration.email,
        customerName: `${registration.firstName} ${registration.lastName}`.trim(),
        amount: refund.amount,
        currency: refund.currency,
        description: eventTitle,
        refundId: refund.id,
      });
    } catch (emailError) {
      emailSent = false;
      console.error("Refund notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      refundStatus: refund.status,
      registration: updated,
      emailSent,
      warning: emailSent
        ? undefined
        : "The refund was issued, but the notification email could not be sent.",
    });
  } catch (error) {
    console.error("Stripe registration refund failed:", error);
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to issue refund";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
