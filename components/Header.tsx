"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import styles from "./Header.module.css";
import KitsuneWordmark from "./KitsuneWordmark";
import { ShoppingBag } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; description: string }[];
};

const navLinks: NavItem[] = [
  {
    label: "Beer",
    href: "/#tap-list",
    children: [
      { label: "What’s on Tap", href: "/#tap-list", description: "See the current taproom beer list" },
      { label: "Our Brewery", href: "/#discover", description: "Independent beer brewed in North Phoenix" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Upcoming Events", href: "/events", description: "Taproom gatherings, tournaments, and special releases" },
      { label: "Calendar", href: "/calendar", description: "Browse the complete Kitsune schedule" },
      { label: "MTG & More", href: "/mtg-and-more", description: "Magic nights and our tabletop community" },
      { label: "Commander Nights", href: "/commander-nights", description: "Weekly casual Commander at the brewery" },
      { label: "Magic Mamas Pre-Release", href: "/pre-release", description: "Upcoming Magic set launch events" },
      { label: "Private Events", href: "/private-events", description: "Host your gathering at the taproom" },
    ],
  },
  {
    label: "Play Magic",
    href: "/mtg-and-more",
  },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "Brewery Merchandise", href: "/shop", description: "Kitsune apparel, glassware, and taproom goods" },
      { label: "Magic Card Shop", href: "/card-shop", description: "Browse singles and sealed Magic products" },
    ],
  },
  {
    label: "Visit",
    href: "/contact",
    children: [
      { label: "Hours & Location", href: "/contact", description: "Plan your visit to the North Phoenix taproom" },
      { label: "Contact Us", href: "/contact", description: "Questions, partnerships, and general inquiries" },
    ],
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const isHome = pathname === "/";
  const isHolding = pathname === "/pre-release";
  const itemIsActive = (item: NavItem) =>
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(`${item.href}/`)) ||
    Boolean(item.children?.some((child) =>
      pathname === child.href || pathname.startsWith(`${child.href}/`)
    ));

  return (
    <header className={`${styles.header} ${isHome ? styles.headerHome : ""} ${isHolding ? styles.headerHolding : ""}`}>
      <div className={styles.communityStrip}><span>Independent beer. Everyone welcome.</span><span>North Phoenix, Arizona</span></div>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.headerLogo} aria-label="Kitsune Brewing Co — Home">
          <Image
            src="/images/logo.png"
            alt=""
            width={40}
            height={40}
            className={styles.homeFoxLogo}
            aria-hidden="true"
            priority
          />
          <span className={styles.homeWordmark} data-site-wordmark>
            <KitsuneWordmark decorative className={styles.wordmarkArt} /><small>Brewing Company</small>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.headerNav} aria-label="Main navigation">
          {navLinks.map((item) => item.children ? (
            <div className={styles.navDropdown} key={item.label}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${styles.navDropdownTrigger} ${item.label === "Visit" ? styles.visitCta : ""} ${itemIsActive(item) ? styles.navLinkActive : ""}`}
              >
                {item.label}
                <svg className={styles.dropdownChevron} width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
                  <path d="m1 1 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </Link>
              <ul className={styles.navDropdownMenu}>
                {item.children.map((child) => (
                  <li key={`${child.label}-${child.href}`}>
                    <Link
                      href={child.href}
                      className={`${styles.navDropdownLink} ${pathname === child.href || pathname.startsWith(`${child.href}/`) ? styles.navDropdownLinkActive : ""}`}
                    >
                      <strong>{child.label}</strong>
                      <span>{child.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${itemIsActive(item) ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <button
            className={`${styles.navLink} ${styles.cartLink}`}
            onClick={openCart}
            aria-label={`Open cart — ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
          >
            CART ({totalCount})
          </button>
        </nav>

        <div className={styles.mobileControls}>
        <button
          type="button"
          className={styles.mobileCartButton}
          onClick={() => { setMenuOpen(false); openCart(); }}
          aria-label={`Open cart — ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
        >
          <ShoppingBag size={23} strokeWidth={1.6} aria-hidden="true" />
          {totalCount > 0 && <span className={styles.cartCount} aria-hidden="true">{totalCount}</span>}
        </button>
        <button
          className={styles.hamburger}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
        </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <>
          <button
            type="button"
            className={styles.mobileBackdrop}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <nav id="mobile-navigation" className={styles.mobileNav} aria-label="Mobile navigation">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${itemIsActive(item) ? styles.mobileNavLinkActive : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              className={`${styles.mobileNavLink} ${styles.mobileCartLink}`}
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              aria-label={`Open cart — ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
            >
              CART ({totalCount})
            </button>
          </nav>
        </>
      )}
    </header>
  );
}
