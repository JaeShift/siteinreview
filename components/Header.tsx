"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import styles from "./Header.module.css";

type NavItem = { label: string; href: string };

const navLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Casino Night", href: "/casino-night" },
  { label: "MTG AND MORE", href: "/mtg-and-more" },
  { label: "Magic Mamas Pre-Release", href: "/magic-mamas-pre-release" },
  { label: "Contact Us", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.headerLogo} aria-label="Kitsune Brewing Co — Home">
          <Image src="/images/logo.png" alt="Kitsune" width={160} height={100} priority />
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.headerNav} aria-label="Main navigation">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/")) ? styles.navLinkActive : ""}`}
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

        <button
          className={styles.hamburger}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
          <span className={styles.hamburgerBar} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/")) ? styles.mobileNavLinkActive : ""}`}
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
      )}
    </header>
  );
}
