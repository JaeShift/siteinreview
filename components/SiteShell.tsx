"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import AddressBar from "./AddressBar";
import CartDrawer from "./mtg/CartDrawer";
import { CartProvider } from "@/lib/cart-context";

const CHECKOUT_PATH = "/checkout";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  const isHome = pathname === "/";
  const isCheckout = pathname === CHECKOUT_PATH || pathname.startsWith(`${CHECKOUT_PATH}/`);
  const showAddressBar = pathname === "/food-trucks";

  return (
    <div className="publicSite" data-site-theme="editorial" data-route={pathname}>
      <CartProvider>
        <Header />
        <main>{children}</main>
        {showAddressBar && <AddressBar />}
        {!isCheckout && <Footer showHours={!isHome} editorial />}
        <CartDrawer />
      </CartProvider>
    </div>
  );
}
