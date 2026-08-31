"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AddressBar from "./AddressBar";
import CartDrawer from "./mtg/CartDrawer";
import ThemeTransition from "./ThemeTransition";
import ThemeThreshold from "./ThemeThreshold";
import { CartProvider } from "@/lib/cart-context";
import {
  DEFAULT_SITE_APPEARANCE,
  isOverlayTransition,
  type SiteAppearance,
} from "@/lib/site-appearance";

const CHECKOUT_PATH = "/checkout";

export default function SiteShell({
  children,
  appearance = DEFAULT_SITE_APPEARANCE,
}: {
  children: ReactNode;
  appearance?: SiteAppearance;
}) {
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
  const useThreshold = appearance.transition === "threshold";
  const useOverlay = isOverlayTransition(appearance.transition);
  const chromeArcane = isArcane && !useThreshold;

  return (
    <div
      className="publicSite"
      data-site-theme="editorial"
      data-route={pathname}
      data-theme-mode={chromeArcane ? "arcane" : useThreshold && isArcane ? "threshold" : "editorial"}
    >
      <CartProvider>
        {useOverlay && (
          <ThemeTransition
            arcane={isArcane}
            effect={appearance.transition}
            speed={appearance.speed}
          />
        )}
        <Header arcane={chromeArcane} />
        {useThreshold && isArcane && <ThemeThreshold variant="dusk" speed={appearance.speed} />}
        <main key={pathname}>{children}</main>
        {useThreshold && isArcane && <ThemeThreshold variant="dawn" speed={appearance.speed} />}
        {showAddressBar && <AddressBar />}
        {!isCheckout && <Footer showHours={!isHome} editorial arcane={chromeArcane} />}
        <CartDrawer />
      </CartProvider>
    </div>
  );
}
