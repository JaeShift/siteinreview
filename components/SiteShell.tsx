"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./mtg/CartDrawer";
import { CartProvider } from "@/lib/cart-context";

const CHECKOUT_PATH = "/checkout";

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  const isHome = pathname === "/";
  const isCheckout = pathname === CHECKOUT_PATH || pathname.startsWith(`${CHECKOUT_PATH}/`);
  return (
    <div
      className="publicSite"
      data-site-theme="taproom"
      data-route={pathname}
    >
      <CartProvider>
        <a className="skipLink" href="#main-content">Skip to content</a>
        <Header />
        <main id="main-content" key={pathname}>{children}</main>
        {!isCheckout && <Footer showHours editorial={isHome} />}
        <CartDrawer />
      </CartProvider>
    </div>
  );
}
