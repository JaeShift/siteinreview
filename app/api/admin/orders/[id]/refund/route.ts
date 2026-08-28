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
  const orders = getOrdersStore();
  const order = orders.find((item) => item.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status === "refunded") {
    return NextResponse.json({ error: "This order has already been refunded" }, { status: 409 });
  }
  if (!order.stripeSessionId?.startsWith("cs_")) {
    return NextResponse.json(
      { error: "This order is not connected to a refundable Stripe checkout" },
      { status: 400 }
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "No completed Stripe payment was found for this order" },
        { status: 400 }
      );
    }

    const refund = await stripe.refunds.create(
      { payment_intent: paymentIntentId },
      { idempotencyKey: `order-refund-${order.id}` }
    );

    if (refund.status === "failed" || refund.status === "canceled") {
      return NextResponse.json(
        { error: "Stripe could not complete the refund" },
        { status: 502 }
      );
    }

    saveOrdersStore(
      orders.map((item) =>
        item.id === order.id ? { ...item, status: "refunded" as const } : item
      )
    );

    const registration = getRegistrationsStore().find(
      (item) => item.stripeSessionId === order.stripeSessionId
    );
    if (registration) {
      const registrations = updateRegistration(registration.id, {
        status: "refunded",
        checkedIn: false,
        checkedInAt: undefined,
      });
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
    }

    let emailSent = true;
    try {
      await sendRefundNotificationEmail({
        email: order.customerEmail,
        customerName: order.customerName,
        amount: refund.amount,
        currency: refund.currency,
        description: order.description,
        refundId: refund.id,
      });
    } catch (emailError) {
      emailSent = false;
      console.error("Order refund notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      refundStatus: refund.status,
      emailSent,
      warning: emailSent
        ? undefined
        : "The refund was issued, but the notification email could not be sent.",
    });
  } catch (error) {
    console.error("Stripe order refund failed:", error);
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to issue refund";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
