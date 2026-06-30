import type { Metadata } from "next";
import { mtgEvents } from "@/lib/events-data";
import styles from "./admin-registrations.module.css";

export const metadata: Metadata = { title: "Registrations" };

// Mock registration data
const mockRegistrations = [
  { id: "KIT-A1B2C",  firstName: "Alex",    lastName: "Chen",      email: "alex@example.com",   phone: "(602) 555-0101", eventSlug: "rcq-modern-july-26",          notes: "Burn player",        submittedAt: "2026-06-20" },
  { id: "KIT-D3E4F",  firstName: "Maria",   lastName: "Santos",    email: "maria@example.com",  phone: "(480) 555-0202", eventSlug: "commander-night-july-2",      notes: "",                   submittedAt: "2026-06-21" },
  { id: "KIT-G5H6I",  firstName: "James",   lastName: "Powell",    email: "james@example.com",  phone: "(623) 555-0303", eventSlug: "rcq-modern-july-26",          notes: "Affinity list",      submittedAt: "2026-06-22" },
  { id: "KIT-J7K8L",  firstName: "Sarah",   lastName: "Kim",       email: "sarah@example.com",  phone: "(602) 555-0404", eventSlug: "magic-mamas-commander-july",  notes: "First time!",        submittedAt: "2026-06-22" },
  { id: "KIT-M9N0O",  firstName: "Tyler",   lastName: "Rodriguez", email: "tyler@example.com",  phone: "(480) 555-0505", eventSlug: "aetherdrift-prerelease",      notes: "",                   submittedAt: "2026-06-23" },
  { id: "KIT-P1Q2R",  firstName: "Jessica", lastName: "Wang",      email: "jess@example.com",   phone: "(602) 555-0606", eventSlug: "friday-night-magic-standard", notes: "Esper Midrange",     submittedAt: "2026-06-24" },
  { id: "KIT-S3T4U",  firstName: "Marcus",  lastName: "Davis",     email: "marcus@example.com", phone: "(623) 555-0707", eventSlug: "modern-showdown-july-11",     notes: "4-Color Omnath",     submittedAt: "2026-06-24" },
  { id: "KIT-V5W6X",  firstName: "Priya",   lastName: "Patel",     email: "priya@example.com",  phone: "(480) 555-0808", eventSlug: "commander-night-july-2",      notes: "Casual pod please",  submittedAt: "2026-06-25" },
  { id: "KIT-Y7Z8A",  firstName: "Derek",   lastName: "Thompson",  email: "derek@example.com",  phone: "(602) 555-0909", eventSlug: "bloomburrow-booster-draft",   notes: "",                   submittedAt: "2026-06-25" },
  { id: "KIT-B9C0D",  firstName: "Ashley",  lastName: "Brown",     email: "ash@example.com",    phone: "(480) 555-0110", eventSlug: "rcq-modern-july-26",          notes: "Living End",         submittedAt: "2026-06-25" },
];

export default function AdminRegistrationsPage() {
  const registrationsByEvent = mtgEvents.reduce<Record<string, typeof mockRegistrations>>((acc, event) => {
    acc[event.slug] = mockRegistrations.filter((r) => r.eventSlug === event.slug);
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Registrations</h1>
          <p className={styles.subtitle}>{mockRegistrations.length} total registrations</p>
        </div>
        <button className="btn btn-outline" disabled title="Export CSV (coming soon)">
          Export CSV
        </button>
      </div>

      {/* All registrations table */}
      <section>
        <h2 className={styles.sectionTitle}>All Registrations</h2>
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <span>Confirmation</span>
            <span>Name</span>
            <span>Email</span>
            <span>Phone</span>
            <span>Event</span>
            <span>Date</span>
            <span>Notes</span>
          </div>
          {mockRegistrations.map((reg) => {
            const event = mtgEvents.find((e) => e.slug === reg.eventSlug);
            return (
              <div key={reg.id} className={styles.tableRow}>
                <span className={styles.confirmNum}>{reg.id}</span>
                <span className={styles.playerName}>{reg.firstName} {reg.lastName}</span>
                <span className={styles.email}>{reg.email}</span>
                <span className={styles.phone}>{reg.phone}</span>
                <span className={styles.eventName}>{event?.title ?? reg.eventSlug}</span>
                <span className={styles.date}>{new Date(reg.submittedAt + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className={styles.notes}>{reg.notes || "—"}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* By event */}
      <section>
        <h2 className={styles.sectionTitle}>By Event</h2>
        <div className={styles.eventBreakdown}>
          {mtgEvents
            .filter((e) => (registrationsByEvent[e.slug]?.length ?? 0) > 0)
            .map((event) => {
              const regs = registrationsByEvent[event.slug] ?? [];
              return (
                <div key={event.slug} className={styles.eventGroup}>
                  <div className={styles.eventGroupHeader}>
                    <span className={styles.eventGroupTitle}>{event.title}</span>
                    <span className={styles.eventGroupCount}>{regs.length} registered</span>
                  </div>
                  <div className={styles.eventGroupList}>
                    {regs.map((r) => (
                      <div key={r.id} className={styles.regRow}>
                        <span>{r.firstName} {r.lastName}</span>
                        <span className={styles.regEmail}>{r.email}</span>
                        <span className={styles.regConf}>{r.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
}
