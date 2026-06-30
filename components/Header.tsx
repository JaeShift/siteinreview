"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

type ChildLink = { label: string; href: string };
type NavItem =
  | { label: string; href: string; children?: never }
  | { label: string; href?: never; children: ChildLink[] };

const navLinks: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Casino Night", href: "/casino-night" },
  {
    label: "MTG & Gaming",
    children: [
      { label: "MTG and More", href: "/mtg-and-more" },
      { label: "Events", href: "/events" },
      { label: "Singles", href: "/singles" },
      { label: "Magic Mamas Pre-Release", href: "/magic-mamas-pre-release" },
    ],
  },
  { label: "Calendar", href: "/calendar" },
  { label: "Contact Us", href: "/contact" },
];

const cartCount = 0;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [gamingOpen, setGamingOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    setGamingOpen(false);
  }, [pathname]);

  const gamingLinks = (navLinks.find((n) => n.children) as Extract<NavItem, { children: ChildLink[] }>).children;
  const gamingActive = gamingLinks.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.headerLogo} aria-label="Kitsune Brewing Co — Home">
          <Image src="/images/logo.png" alt="Kitsune" width={160} height={100} priority />
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.headerNav} aria-label="Main navigation">
          {navLinks.map((item) => {
            if (item.children) {
              return (
                <div key="mtg-gaming" className={styles.navDropdown}>
                  <span className={`${styles.navLink} ${styles.navDropdownTrigger} ${gamingActive ? styles.navLinkActive : ""}`}>
                    {item.label}
                    <svg className={styles.dropdownChevron} width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <ul className={styles.navDropdownMenu} role="menu">
                    {item.children.map((child) => (
                      <li key={child.href} role="none">
                        <Link
                          href={child.href}
                          role="menuitem"
                          className={`${styles.navDropdownLink} ${pathname === child.href ? styles.navDropdownLinkActive : ""}`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/cart" className={`${styles.navLink} ${styles.cartLink}`}>
            CART [{cartCount}]
          </Link>
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
          {navLinks.map((item) => {
            if (item.children) {
              return (
                <div key="mtg-gaming-mobile">
                  <button
                    className={`${styles.mobileNavLink} ${styles.mobileNavGroupBtn} ${gamingActive ? styles.mobileNavLinkActive : ""}`}
                    onClick={() => setGamingOpen((v) => !v)}
                    aria-expanded={gamingOpen}
                  >
                    {item.label}
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" style={{ transition: "transform 0.2s", transform: gamingOpen ? "rotate(180deg)" : "none" }}>
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {gamingOpen && (
                    <div className={styles.mobileSubMenu}>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`${styles.mobileNavLink} ${styles.mobileNavSubLink} ${pathname === child.href ? styles.mobileNavLinkActive : ""}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${pathname === item.href ? styles.mobileNavLinkActive : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
