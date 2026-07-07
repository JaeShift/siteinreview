import type { Metadata } from "next";
import EmbeddedCheckoutClient from "../EmbeddedCheckoutClient";

export const metadata: Metadata = { title: "Payment — Kitsune Brewing Co." };

export default function PaymentPage() {
  return <EmbeddedCheckoutClient />;
}
