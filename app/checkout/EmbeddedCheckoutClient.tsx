"use client";

import { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import styles from "./checkout.module.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function EmbeddedCheckoutClient() {
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");

  // If cart is empty on arrival, redirect back
  useEffect(() => {
    if (items.length === 0) router.replace("/card-shop");
  }, [items, router]);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cart", items }),
    });
    const data = await res.json();
    if (!res.ok || !data.clientSecret) {
      setError(data.error ?? "Failed to start checkout.");
      throw new Error(data.error);
    }
    return data.clientSecret as string;
  }, [items]);

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p>{error}</p>
        <button className="btn btn-outline" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className={styles.checkoutPage}>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
