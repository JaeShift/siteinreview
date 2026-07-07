import type { Metadata } from "next";
import CartReviewClient from "./CartReviewClient";

export const metadata: Metadata = { title: "Your Cart — Kitsune Brewing Co." };

export default function CheckoutPage() {
  return <CartReviewClient />;
}
