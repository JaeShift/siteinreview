import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import type { CartItem } from "@/lib/cart-context";
import { getMerchandiseStore, getSinglesStore } from "@/lib/store";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const CONDITION_LABELS: Record<string, string> = {
  NM: "Near Mint",
  LP: "Lightly Played",
  MP: "Moderately Played",
  HP: "Heavily Played",
  DMG: "Damaged",
};

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await request.json().catch(() => null);
  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const requestedItems = body.items as CartItem[];
  const cards = getSinglesStore();
  const merchandise = getMerchandiseStore();
  const items: CartItem[] = [];
  for (const requested of requestedItems) {
    const quantity = Math.max(1, Math.floor(Number(requested.quantity)));
    if ("category" in requested.card) {
      const product = merchandise.find((item) => item.id === (requested.card.inventoryId ?? requested.card.id));
      const size = requested.card.selectedSize;
      if (!product?.active || product.quantity < quantity || (product.sizes.length > 0 && (!size || !product.sizes.includes(size)))) {
        return NextResponse.json({ error: `${requested.card.name} is no longer available.` }, { status: 409 });
      }
      items.push({ card: { ...product, id: requested.card.id, inventoryId: product.id, selectedSize: size }, quantity });
    } else {
      const card = cards.find((item) => item.id === requested.card.id);
      if (!card || card.hidden || card.quantity < quantity) {
        return NextResponse.json({ error: `${requested.card.name} is no longer available.` }, { status: 409 });
      }
      items.push({ card, quantity });
    }
  }

  const line_items = items.map(({ card, quantity }) => {
    const detailParts = "category" in card
      ? [card.category, card.description]
      : [
          card.set,
          card.type,
          card.rarity,
          CONDITION_LABELS[card.condition] ?? card.condition,
          card.foil ? "Foil" : null,
        ];

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: card.name,
          description: detailParts.join(" · "),
          // Stripe displays the card art image on the checkout page
          ...(card.imageUrl?.startsWith("https://") ? { images: [card.imageUrl] } : {}),
        },
        unit_amount: Math.round(card.price * 100),
      },
      quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    shipping_address_collection: {
      allowed_countries: ["US"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: "In-Store Pickup",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 3 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 599, currency: "usd" },
          display_name: "Standard Shipping (USPS)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 1299, currency: "usd" },
          display_name: "Priority Shipping (USPS)",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 3 },
          },
        },
      },
    ],
    custom_text: {
      shipping_address: {
        message: "Enter your shipping address, or choose in-store pickup at checkout.",
      },
      submit: {
        message: "Your order will be confirmed via email. In-store pickup available at Kitsune Brewing Co.",
      },
    },
    metadata: {
      orderType: "singles",
      itemCount: String(items.reduce((sum, i) => sum + i.quantity, 0)),
      itemSummary: items
        .map((item) => {
          const detail = "category" in item.card
            ? [item.card.category, item.card.selectedSize ? `Size ${item.card.selectedSize}` : null].filter(Boolean).join(" · ")
            : `${item.card.condition}${item.card.foil ? " Foil" : ""}`;
          return `${item.card.name} (${detail}) x${item.quantity}`;
        })
        .join(", ")
        .slice(0, 490),
      cartItems: JSON.stringify(items.map((item) => ({ id: item.card.inventoryId ?? item.card.id, qty: item.quantity }))).slice(0, 490),
    },
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${siteUrl}/shop?cancelled=true`,
  });

  return NextResponse.json({ url: session.url });
}
