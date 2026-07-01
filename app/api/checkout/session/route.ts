import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventsStore } from "@/lib/store";
import type { CartItem } from "@/lib/cart-context";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const CONDITION_LABELS: Record<string, string> = {
  NM: "Near Mint", LP: "Lightly Played",
  MP: "Moderately Played", HP: "Heavily Played", DMG: "Damaged",
};

/** POST /api/checkout/session
 * Body: { type: "cart", items: CartItem[] }
 *    OR { type: "event", eventSlug, firstName, lastName, email, phone, notes? }
 * Returns: { clientSecret }
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

  const returnUrl = `${siteUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;

  // ── Cart checkout ────────────────────────────────────────────────────────
  if (body.type === "cart") {
    const items = body.items as CartItem[];
    if (!items?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const line_items = items.map(({ card, quantity }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: card.name,
          description: [card.set, card.type, card.rarity, CONDITION_LABELS[card.condition] ?? card.condition, card.foil ? "Foil" : null].filter(Boolean).join(" · "),
          ...(card.imageUrl?.startsWith("https://") ? { images: [card.imageUrl] } : {}),
        },
        unit_amount: Math.round(card.price * 100),
      },
      quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            display_name: "In-Store Pickup",
            delivery_estimate: { minimum: { unit: "business_day", value: 1 }, maximum: { unit: "business_day", value: 3 } },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 599, currency: "usd" },
            display_name: "Standard Shipping (USPS)",
            delivery_estimate: { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 7 } },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1299, currency: "usd" },
            display_name: "Priority Shipping (USPS)",
            delivery_estimate: { minimum: { unit: "business_day", value: 1 }, maximum: { unit: "business_day", value: 3 } },
          },
        },
      ],
      custom_text: {
        submit: { message: "Your order will be confirmed via email. In-store pickup available at Kitsune Brewing Co." },
      },
      metadata: {
        orderType: "singles",
        itemCount: String(items.reduce((s, i) => s + i.quantity, 0)),
        itemSummary: items.map((i) => `${i.card.name} (${i.card.condition})${i.card.foil ? " Foil" : ""} x${i.quantity}`).join(", ").slice(0, 490),
      },
      return_url: returnUrl,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  }

  // ── Event checkout ───────────────────────────────────────────────────────
  if (body.type === "event") {
    const { eventSlug, firstName, lastName, email, phone, notes } = body;
    if (!eventSlug) return NextResponse.json({ error: "Missing eventSlug" }, { status: 400 });

    const event = getEventsStore().find((e) => e.slug === eventSlug);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (event.entryFee === 0) return NextResponse.json({ error: "Event is free" }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title,
            description: `${event.format} — ${event.date} at ${event.time} · Kitsune Brewing Co.`,
          },
          unit_amount: event.entryFee * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      customer_email: email,
      billing_address_collection: "required",
      custom_text: {
        submit: { message: "You'll receive a confirmation email. Please bring it to the event at Kitsune Brewing Co." },
      },
      metadata: {
        orderType: "event",
        eventSlug, eventTitle: event.title, eventDate: event.date, eventFormat: event.format,
        firstName, lastName, email, phone, notes: notes ?? "",
      },
      return_url: returnUrl,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
