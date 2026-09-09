import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getEventsStore, getMerchandiseStore, getSinglesStore } from "@/lib/store";
import type { CartItem } from "@/lib/cart-context";

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
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.json().catch(() => null);
  if (!body?.type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

  // Use the request origin so the return URL always matches where the user actually is
  const origin = request.headers.get("origin") ?? request.headers.get("referer")?.replace(/\/[^/]*$/, "") ?? siteUrl;
  const returnUrl = `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;

  // ── Cart checkout ────────────────────────────────────────────────────────
  if (body.type === "cart") {
    const requestedItems = body.items as CartItem[];
    if (!requestedItems?.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    const cards = getSinglesStore();
    const merchandise = getMerchandiseStore();
    const items: CartItem[] = [];
    for (const requested of requestedItems) {
      const quantity = Math.max(1, Math.floor(Number(requested.quantity)));
      if ("category" in requested.card) {
        const product = merchandise.find((item) => item.id === (requested.card.inventoryId ?? requested.card.id));
        if (!product?.active || product.quantity < quantity) {
          return NextResponse.json({ error: `${requested.card.name} is no longer available in that quantity.` }, { status: 409 });
        }
        const selectedSize = requested.card.selectedSize;
        if (product.sizes.length && (!selectedSize || !product.sizes.includes(selectedSize))) {
          return NextResponse.json({ error: `Select an available size for ${product.name}.` }, { status: 400 });
        }
        items.push({ card: { ...product, id: requested.card.id, inventoryId: product.id, selectedSize }, quantity });
      } else {
        const card = cards.find((item) => item.id === requested.card.id);
        if (!card || card.hidden || card.quantity < quantity) {
          return NextResponse.json({ error: `${requested.card.name} is no longer available in that quantity.` }, { status: 409 });
        }
        items.push({ card, quantity });
      }
    }
    for (const product of merchandise) {
      const requestedQuantity = items
        .filter((item) => item.card.inventoryId === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      if (requestedQuantity > product.quantity) {
        return NextResponse.json({ error: `${product.name} is no longer available in that quantity.` }, { status: 409 });
      }
    }

    const line_items = items.map(({ card, quantity }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: card.name,
          description: "category" in card
            ? [card.category, card.description].filter(Boolean).join(" · ")
            : [card.set, card.type, card.rarity, CONDITION_LABELS[card.condition] ?? card.condition, card.foil ? "Foil" : null].filter(Boolean).join(" · "),
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
      custom_text: {
        submit: { message: "You'll receive an order confirmation email. In-store pickup is available at Kitsune Brewing Co. — 3321 E Bell Rd Suite B-5, Phoenix, AZ 85032." },
      },
      metadata: {
        orderType: "singles",
        category: items.every((item) => "category" in item.card) ? "merchandise" : "shop",
        itemCount: String(items.reduce((s, i) => s + i.quantity, 0)),
        itemSummary: items.map((item) => {
          const detail = "category" in item.card
            ? [item.card.category, item.card.selectedSize ? `Size ${item.card.selectedSize}` : null].filter(Boolean).join(" · ")
            : `${item.card.condition}${item.card.foil ? " Foil" : ""}`;
          return `${item.card.name} (${detail}) x${item.quantity}`;
        }).join(", ").slice(0, 490),
        // compact array of {id, qty} for inventory decrement on fulfillment
        cartItems: JSON.stringify(items.map((i) => ({ id: i.card.inventoryId ?? i.card.id, qty: i.quantity }))).slice(0, 490),
      },
      return_url: returnUrl,
    });

    return NextResponse.json({ clientSecret: session.client_secret, sessionId: session.id });
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
