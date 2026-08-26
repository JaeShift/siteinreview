import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addOrder, getOrdersStore, type Order } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "STRIPE_SECRET_KEY not configured" }, { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const existingIds = new Set(getOrdersStore().map((o) => o.stripeSessionId));

  let imported = 0;
  let skipped = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  // Page through all completed checkout sessions (up to 10 pages / 1000 sessions)
  for (let page = 0; page < 10 && hasMore; page++) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: "complete",
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const session of sessions.data) {
      if (existingIds.has(session.id)) {
        skipped++;
        continue;
      }

      const meta = session.metadata ?? {};
      const { eventTitle, eventDate, eventFormat, eventSlug, firstName, lastName } = meta;

      const customerName =
        firstName && lastName
          ? `${firstName} ${lastName}`
          : session.customer_details?.name ?? "Unknown";

      const parts = [eventTitle ?? eventSlug ?? meta.itemSummary ?? "Order"];
      if (eventDate) parts.push(eventDate);
      if (eventFormat) parts.push(eventFormat);
      const description = parts.join(" · ").slice(0, 200);

      const paymentStatus = session.payment_status;
      const status: Order["status"] =
        paymentStatus === "paid" ? "paid" : "pending";

      const order: Order = {
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
        status,
        metadata: meta as Record<string, string>,
        createdAt: new Date(session.created * 1000).toISOString(),
      };

      addOrder(order);
      existingIds.add(session.id);
      imported++;
    }

    hasMore = sessions.has_more;
    if (sessions.data.length > 0) {
      startingAfter = sessions.data[sessions.data.length - 1].id;
    }
  }

  return NextResponse.json({ imported, skipped });
}
