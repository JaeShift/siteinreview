"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

/** Clears the cart client-side after a successful purchase. */
export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();
  useEffect(() => { clearCart(); }, [clearCart]);
  return null;
}
