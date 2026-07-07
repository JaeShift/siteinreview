"use client";

import { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import styles from "./checkout.module.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function EmbeddedCheckoutClient() {
  const { items, hydrated, clearCart } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");

  // Wait for localStorage to hydrate before checking cart — avoids false redirect
  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/checkout");
  }, [hydrated, items, router]);

  const [sessionId, setSessionId] = useState<string | null>(null);

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
    if (data.sessionId) setSessionId(data.sessionId);
    return data.clientSecret as string;
  }, [items]);

  // Fallback: if Stripe doesn't auto-redirect after payment, navigate manually
  function handleComplete() {
    clearCart();
    const dest = sessionId
      ? `/checkout/return?session_id=${sessionId}`
      : "/checkout/return";
    router.replace(dest);
  }

  if (error) {
    return (
      <div className={styles.errorPage}>
        <p>{error}</p>
        <button className="btn btn-outline" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  if (!hydrated || items.length === 0) return null;

  return (
    <div className={styles.checkoutPage}>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret, onComplete: handleComplete }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
