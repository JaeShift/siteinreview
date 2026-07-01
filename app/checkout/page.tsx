import type { Metadata } from "next";
import EmbeddedCheckoutClient from "./EmbeddedCheckoutClient";

export const metadata: Metadata = { title: "Checkout — Kitsune Brewing Co." };

export default function CheckoutPage() {
  return <EmbeddedCheckoutClient />;
}
