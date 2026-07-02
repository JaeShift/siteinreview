"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import AddressBar from "./AddressBar";
import CartDrawer from "./mtg/CartDrawer";
import { CartProvider } from "@/lib/cart-context";

const MTG_PATHS = [
  "/mtg-and-more",
  "/pre-release",
  "/card-shop",
  "/card-shop-singles",
  "/events",
  "/magic-mamas-pre-release",
  "/private-events",
  "/commander-nights",
];

const NO_FOOTER_PATHS = ["/casino-night", "/contact", "/calendar", "/mtg-and-more", "/card-shop", "/card-shop-singles", "/pre-release", "/private-events", "/commander-nights"];

function isMtgPage(pathname: string) {
  return MTG_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isNoFooterPage(pathname: string) {
  return NO_FOOTER_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  const showAddressBar = !isMtgPage(pathname) && !isNoFooterPage(pathname);
  const isHome = pathname === "/";
  const showFooter = !isHome && !isNoFooterPage(pathname);

  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      {showAddressBar && <AddressBar />}
      {isHome ? (
        <div style={{ textAlign: "right", padding: "16px 24px", backgroundColor: "#fafafa" }}>
          <Link href="/admin" style={{ fontFamily: "var(--font-heading)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#666666", textDecoration: "none" }}>
            Admin
          </Link>
        </div>
      ) : showFooter ? (
        <Footer />
      ) : null}
      <CartDrawer />
    </CartProvider>
  );
}
