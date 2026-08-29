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
  const isArcane =
    pathname === "/mtg-and-more" ||
    pathname.startsWith("/mtg-and-more/") ||
    pathname === "/card-shop" ||
    pathname.startsWith("/card-shop/") ||
    pathname === "/card-shop-singles" ||
    pathname.startsWith("/card-shop-singles/") ||
    pathname === "/pre-release" ||
    pathname.startsWith("/pre-release/");
  const showAddressBar = pathname === "/food-trucks";

  return (
    <div className="publicSite" data-site-theme="editorial" data-route={pathname}>
      <CartProvider>
        <Header />
        <main>{children}</main>
        {showAddressBar && <AddressBar />}
        {!isCheckout && <Footer showHours={!isHome} editorial arcane={isArcane} />}
        <CartDrawer />
      </CartProvider>
    </div>
  );
}
