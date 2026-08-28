import type { Metadata } from "next";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import LiveClock from "@/components/admin/LiveClock";
import { getEventsStore, getOrdersStore, getRegistrationsStore } from "@/lib/store";
import styles from "./dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function formatAmount(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export default function AdminDashboardPage() {
  const events = getEventsStore();
  const orders = getOrdersStore();
  const registrations = getRegistrationsStore();

  const today = new Date().toISOString().split("T")[0];
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  const endOfWeekStr = endOfWeek.toISOString().split("T")[0];
  const in30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const eventsThisWeek = events.filter((e) => e.date >= today && e.date <= endOfWeekStr);
  const eventsNext30 = events.filter((e) => e.date >= today && e.date <= in30DaysStr);

  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const recentOrders = orders.slice(0, 5);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const ordersLast30 = orders.filter((o) => o.createdAt >= thirtyDaysAgo);
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const waitlistedPlayers = registrations.filter((registration) => registration.status === "waitlisted").length;
  const nearlyFullEvents = eventsNext30.filter((event) => {
    const seatsRemaining = event.playerLimit - event.registeredCount;
    return seatsRemaining > 0 && seatsRemaining <= Math.max(3, Math.ceil(event.playerLimit * 0.2));
  }).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "America/Phoenix" })}
          </p>
        </div>
        <LiveClock />
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatsCard
          label="Orders (Last 30 Days)"
          value={ordersLast30.length}
          subtext={ordersLast30.length > 0 ? "orders placed" : "no orders yet"}
          icon={<OrderIcon />}
          accent
        />
        <StatsCard
          label="Events This Week"
          value={eventsThisWeek.length}
          subtext={eventsThisWeek.length > 0 ? "happening this week" : "nothing this week"}
          icon={<CalendarIcon />}
        />
        <StatsCard
          label="Upcoming Events (Next 30 Days)"
          value={eventsNext30.length}
          subtext={eventsNext30.length > 0 ? "coming up" : "nothing scheduled"}
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

      <div className={styles.attentionPanel}>
        <div className={styles.attentionHeader}>
          <div>
            <p className={styles.attentionEyebrow}>Operations</p>
            <h2 className={styles.attentionTitle}>Needs Attention</h2>
          </div>
          <p className={styles.attentionNote}>Items that may need a follow-up.</p>
        </div>
        <div className={styles.attentionGrid}>
          <AttentionItem
            count={pendingOrders}
            label="Pending Orders"
            detail={pendingOrders === 0 ? "All orders are settled" : "Review payment status"}
            href="/admin/orders"
          />
          <AttentionItem
            count={waitlistedPlayers}
            label="Waitlisted Players"
            detail={waitlistedPlayers === 0 ? "No players are waiting" : "Check for available seats"}
            href="/admin/registrations"
          />
          <AttentionItem
            count={nearlyFullEvents}
            label="Nearly Full Events"
            detail={nearlyFullEvents === 0 ? "Event capacity looks good" : "20% or fewer seats remain"}
            href="/admin/events"
          />
        </div>
      </div>
    </div>
  );
}

function AttentionItem({ count, label, detail, href, status }: { count: number; label: string; detail: string; href: string; status?: "live" | "holding" }) {
  const badgeClass = status === "live"
    ? styles.attentionCountLive
    : status === "holding"
      ? styles.attentionCountHolding
      : count > 0
        ? styles.attentionCountActive
        : "";

  const badge = status === "live" ? "●" : status === "holding" ? "⏸" : count;

  return (
    <Link href={href} className={styles.attentionItem}>
      <span className={`${styles.attentionCount} ${badgeClass}`}>{badge}</span>
      <span className={styles.attentionCopy}>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      <span className={styles.attentionArrow} aria-hidden="true">→</span>
    </Link>
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
