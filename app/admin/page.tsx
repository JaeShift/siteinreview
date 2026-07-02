import type { Metadata } from "next";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import { getEventsStore, getOrdersStore } from "@/lib/store";
import styles from "./dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function formatAmount(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function AdminDashboardPage() {
  const events = getEventsStore();
  const orders = getOrdersStore();

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const recentOrders = orders.slice(0, 5);
  const totalRevenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + o.amountTotal, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatsCard
          label="Total Orders"
          value={orders.length}
          subtext={orders.length > 0 ? `${formatAmount(totalRevenue)} collected` : "no orders yet"}
          icon={<OrderIcon />}
          accent
        />
        <StatsCard
          label="Upcoming Events"
          value={upcoming.length}
          subtext="scheduled ahead"
          icon={<CalendarIcon />}
        />
        <StatsCard
          label="Total Events"
          value={events.length}
          subtext="in the system"
          icon={<CalendarIcon />}
        />
      </div>

      <div className={styles.grid}>
        {/* Recent Orders — left */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Orders</h2>
            <Link href="/admin/orders" className={styles.panelLink}>View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No orders yet. When a customer checks out, their order will appear here.</p>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHead}`}>
                <span>Customer</span>
                <span>Description</span>
                <span>Amount</span>
                <span>Date</span>
              </div>
              {recentOrders.map((order) => (
                <div key={order.id} className={styles.tableRow}>
                  <span className={styles.eventName}>{order.customerName}</span>
                  <span className={styles.orderDesc}>{order.description}</span>
                  <span className={styles.orderAmount}>{formatAmount(order.amountTotal)}</span>
                  <span className={styles.eventDate}>
                    {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events — right */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Upcoming Events</h2>
            <Link href="/admin/events" className={styles.panelLink}>View All →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No upcoming events. Add one from the Events page.</p>
            </div>
          ) : (
            <div className={styles.table}>
              <div className={`${styles.tableRow} ${styles.tableHead}`}>
                <span>Event</span>
                <span>Date</span>
                <span>Format</span>
                <span>Reg.</span>
              </div>
              {upcoming.map((event) => (
                <div key={event.slug} className={styles.tableRow}>
                  <span className={styles.eventName}>{event.title}</span>
                  <span className={styles.eventDate}>
                    {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  <span className={styles.formatBadge}>{event.format}</span>
                  <span className={styles.regCount}>{event.registeredCount}/{event.playerLimit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Quick Actions</h2>
        </div>
        <div className={styles.quickActions}>
          <Link href="/admin/events" className={`btn btn-outline ${styles.actionBtn}`}>Manage Events</Link>
          <Link href="/admin/orders" className={`btn btn-outline ${styles.actionBtn}`}>View Orders</Link>
          <Link href="/admin/inventory" className={`btn btn-outline ${styles.actionBtn}`}>Singles Inventory</Link>
          <Link href="/admin/settings" className={`btn btn-outline ${styles.actionBtn}`}>Settings</Link>
          <Link href="/" className={`btn btn-outline ${styles.actionBtn}`} target="_blank">View Site ↗</Link>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7h16M6 1v3M14 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 3h2l2.5 9h7l2-6H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="16.5" r="1" fill="currentColor" />
      <circle cx="14" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}
