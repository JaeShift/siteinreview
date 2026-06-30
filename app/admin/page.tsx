import type { Metadata } from "next";
import Link from "next/link";
import StatsCard from "@/components/admin/StatsCard";
import { mtgEvents, getUpcomingEvents } from "@/lib/events-data";
import { singles } from "@/lib/singles-data";
import { getTodaysTruck } from "@/lib/food-trucks-data";
import styles from "./dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard" };

// ── Mock registration data ────────────────────────────────────────────────────
const mockRegistrations = [
  { id: "R001", name: "Alex Chen",        event: "Friday Night Magic — Standard",    date: "2026-06-25", status: "Confirmed" },
  { id: "R002", name: "Maria Santos",     event: "Commander Night",                 date: "2026-06-24", status: "Confirmed" },
  { id: "R003", name: "James Powell",     event: "RCQ — Modern",                    date: "2026-06-24", status: "Confirmed" },
  { id: "R004", name: "Sarah Kim",        event: "Magic Mamas Commander Night",     date: "2026-06-23", status: "Confirmed" },
  { id: "R005", name: "Tyler Rodriguez",  event: "Aetherdrift Prerelease",          date: "2026-06-22", status: "Pending"   },
];

export default function AdminDashboardPage() {
  const upcoming = getUpcomingEvents(5);
  const today = getTodaysTruck();
  const totalRegistrations = mtgEvents.reduce((sum, e) => sum + e.registeredCount, 0);
  const totalInventory = singles.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        <StatsCard
          label="Upcoming Events"
          value={getUpcomingEvents().length}
          subtext="in the next 60 days"
          trend={{ direction: "up", label: "2 new this week" }}
          accent
          icon={<CalendarIcon />}
        />
        <StatsCard
          label="Total Registrations"
          value={totalRegistrations}
          subtext="across all events"
          trend={{ direction: "up", label: "12 this week" }}
          icon={<UserIcon />}
        />
        <StatsCard
          label="Singles Listed"
          value={totalInventory}
          subtext={`${singles.length} unique cards`}
          trend={{ direction: "neutral", label: "inventory stable" }}
          icon={<CardIcon />}
        />
        <StatsCard
          label="Food Trucks"
          value={today ? "1" : "0"}
          subtext={today ? `Tonight: ${today.name}` : "No truck tonight"}
          trend={{ direction: "neutral", label: "3 this week" }}
          icon={<TruckIcon />}
        />
      </div>

      <div className={styles.grid}>
        {/* Upcoming Events */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Upcoming Events</h2>
            <Link href="/admin/events" className={styles.panelLink}>View All →</Link>
          </div>
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
                <span className={styles.eventDate}>{new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className={styles.formatBadge}>{event.format}</span>
                <span className={styles.regCount}>{event.registeredCount}/{event.playerLimit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Registrations</h2>
            <Link href="/admin/registrations" className={styles.panelLink}>View All →</Link>
          </div>
          <div className={styles.table}>
            <div className={`${styles.tableRow} ${styles.tableHead}`}>
              <span>Player</span>
              <span>Event</span>
              <span>Status</span>
            </div>
            {mockRegistrations.map((reg) => (
              <div key={reg.id} className={styles.tableRow}>
                <span className={styles.playerName}>{reg.name}</span>
                <span className={styles.regEvent}>{reg.event}</span>
                <span className={`${styles.statusBadge} ${reg.status === "Confirmed" ? styles.statusConfirmed : styles.statusPending}`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Quick Actions</h2>
        </div>
        <div className={styles.quickActions}>
          <Link href="/admin/events" className={`btn btn-primary ${styles.actionBtn}`}>Manage Events</Link>
          <Link href="/admin/food-trucks" className={`btn btn-outline ${styles.actionBtn}`}>Food Truck Schedule</Link>
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

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 18c0-4 3-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="2" width="10" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="4" width="10" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="1" y="6" width="18" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 15v2M16 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="5" cy="17" r="1.5" fill="currentColor" />
      <circle cx="15" cy="17" r="1.5" fill="currentColor" />
      <path d="M5 6V4a1 1 0 011-1h8a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
