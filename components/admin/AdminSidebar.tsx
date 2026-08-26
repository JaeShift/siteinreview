"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./AdminSidebar.module.css";

const STORAGE_KNOWN = "kitsune_orders_known_count";

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/menu",
    label: "Menu (On Tap)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="2" width="14" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 6h14M5 1v2M11 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    badge: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 2h2l2 7h6l1.5-5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="13" r="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11" cy="13" r="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/registrations",
    label: "Registrations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 14c0-3 2-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 10l1.5 1.5L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="5" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="2" width="5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [newOrderCount, setNewOrderCount] = useState(0);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Poll for new orders — compare live count to last-known count stored in localStorage
  useEffect(() => {
    let cancelled = false;

    async function checkCount() {
      try {
        const res = await fetch("/api/admin/orders/count");
        if (!res.ok || cancelled) return;
        const { count } = await res.json() as { count: number };
        const known = parseInt(localStorage.getItem(STORAGE_KNOWN) ?? "0", 10);
        setNewOrderCount(Math.max(0, count - known));
      } catch { /* ignore network errors */ }
    }

    checkCount();
    const id = setInterval(checkCount, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  // When the user navigates to /admin/orders, reset the badge
  useEffect(() => {
    if (!pathname.startsWith("/admin/orders")) return;
    async function resetBadge() {
      try {
        const res = await fetch("/api/admin/orders/count");
        if (!res.ok) return;
        const { count } = await res.json() as { count: number };
        localStorage.setItem(STORAGE_KNOWN, String(count));
        setNewOrderCount(0);
      } catch { /* ignore */ }
    }
    resetBadge();
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoText}>ADMIN</span>
        <span className={styles.logoSub}>Kitsune Brewing</span>
      </div>

      <nav className={styles.nav} aria-label="Admin navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.navLinkLabel}>{item.label}</span>
            {item.badge && newOrderCount > 0 && (
              <span className={styles.navBadge}>{newOrderCount > 99 ? "99+" : newOrderCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          ← Back to Site
        </Link>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </aside>
  );
}
