import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { addOrder, getOrdersStore, getEventsStore, saveEventsStore } from "@/lib/store";
import styles from "../success/success.module.css";
import ClearCartOnSuccess from "./ClearCartOnSuccess";

export const metadata: Metadata = { title: "Order Confirmed" };

interface Props {
  searchParams: { session_id?: string };
}

export default async function CheckoutReturnPage({ searchParams }: Props) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let headline   = "Order Confirmed!";
  let subline    = "";
  let amountPaid = "";
  let email      = "";
  let isCart     = false;
  let isPaid     = false;

  if (searchParams.session_id) {
    try {
      const session: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(
        searchParams.session_id,
        { expand: ["line_items", "shipping_cost.shipping_rate"] }
      );

      isPaid  = session.payment_status === "paid";
      const meta = session.metadata ?? {};
      isCart  = meta.orderType === "singles";
      email   = session.customer_email ?? session.customer_details?.email ?? meta.email ?? "";
      amountPaid = session.amount_total
        ? `$${(session.amount_total / 100).toFixed(2)}`
        : "";

      if (isCart) {
        headline = "Purchase Confirmed!";
        subline  = meta.itemSummary ?? "";
      } else {
        const firstName = meta.firstName ?? "";
        headline = firstName ? `You're in, ${firstName}!` : "Registration Confirmed!";
        const parts = [meta.eventTitle ?? meta.eventSlug ?? "Event Registration"];
        if (meta.eventDate)   parts.push(meta.eventDate);
        if (meta.eventFormat) parts.push(meta.eventFormat);
        subline = parts.join(" · ");
      }

      if (isPaid) {
        const alreadyExists = getOrdersStore().some((o) => o.stripeSessionId === session.id);

        if (!alreadyExists) {
          const shippingRateObj = session.shipping_cost?.shipping_rate;
          const shippingMethod  = typeof shippingRateObj === "object" && shippingRateObj
            ? (shippingRateObj as Stripe.ShippingRate).display_name ?? ""
            : "";

          const customerName = isCart
            ? session.customer_details?.name ?? "Customer"
            : meta.firstName && meta.lastName ? `${meta.firstName} ${meta.lastName}` : session.customer_details?.name ?? "Unknown";

          addOrder({
            id: session.id, stripeSessionId: session.id,
            customerName, customerEmail: email,
            description: isCart ? `Singles: ${subline}` : subline,
            amountTotal: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            status: "paid",
            metadata: { ...meta, shippingMethod },
            createdAt: new Date().toISOString(),
          });

          if (!isCart && meta.eventSlug) {
            const events = getEventsStore();
            saveEventsStore(events.map((e) =>
              e.slug === meta.eventSlug ? { ...e, registeredCount: e.registeredCount + 1 } : e
            ));
          }
        }
      }
    } catch {
      // still show page
    }
  }

  return (
    <div className={styles.page}>
      {/* Clear the cart client-side after a successful purchase */}
      {isPaid && isCart && <ClearCartOnSuccess />}

      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" stroke="#22c55e" strokeWidth="2" />
            <path d="M16 28l8 8 16-16" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className={styles.title}>{headline}</h1>
        {subline    && <p className={styles.eventName}><strong>{subline}</strong></p>}
        {amountPaid && <p className={styles.amount}>Amount paid: <strong>{amountPaid}</strong></p>}
        {email      && <p className={styles.email}>A confirmation receipt has been sent to <strong>{email}</strong>.</p>}

        <p className={styles.note}>
          {isCart
            ? "Thank you for your purchase! We'll have your cards ready for pickup at Kitsune Brewing Co."
            : "Please bring this confirmation to the event. See you at Kitsune Brewing Co.!"}
        </p>

        <div className={styles.actions}>
          {isCart ? (
            <>
              <Link href="/card-shop" className="btn btn-primary">Continue Shopping</Link>
              <Link href="/" className="btn btn-outline">Back to Home</Link>
            </>
          ) : (
            <>
              <Link href="/events" className="btn btn-primary">View All Events</Link>
              <Link href="/" className="btn btn-outline">Back to Home</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
