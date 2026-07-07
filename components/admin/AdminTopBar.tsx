"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./AdminTopBar.module.css";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/registrations", label: "Registrations" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render the nav bar on the login page
  if (pathname === "/admin/login") return null;

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className={styles.topBar}>
      <div className={styles.inner}>
        <span className={styles.brand}>ADMIN</span>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/" className={styles.siteLink}>← Back to Site</Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </header>
  );
}
