"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import styles from "./Header.module.css";

type NavItem = { label: string; href: string };

const navLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "MTG AND MORE", href: "/mtg-and-more" },
  { label: "Magic Mamas Pre-Release", href: "/pre-release" },
  { label: "Contact Us", href: "/contact" },
];

export default function Header({ arcane = false }: { arcane?: boolean }) {
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

  const isHolding = pathname === "/pre-release";

  return (
    <header className={`${styles.header} ${styles.headerHome} ${isHolding ? styles.headerHolding : ""} ${arcane ? styles.headerArcane : ""}`}>
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
            Kitsune Brewing Co.
          </span>
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
        <>
          <button
            type="button"
            className={styles.mobileBackdrop}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
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
        </>
      )}
    </header>
  );
}
