import type { Metadata } from "next";
import Link from "next/link";
import PageSection from "@/components/PageSection";
import CalendarPageClient from "./CalendarPageClient";
import AddressBar from "@/components/AddressBar";
import { getCalendarProvider } from "@/lib/calendar";
import styles from "./calendar.module.css";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "View all upcoming MTG events at Kitsune Brewing Co. in Phoenix, AZ.",
};

export default async function CalendarPage() {
  const provider = getCalendarProvider();

  const from = new Date();
  from.setDate(1);
  const to = new Date(from.getFullYear(), from.getMonth() + 3, 0);

  const allEvents = await provider.getAllEvents(from, to);
  const events = allEvents.filter((e) => e.type === "event");

  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    type: e.type,
    description: e.description,
    location: e.location,
    color: e.color,
    slug: e.slug,
  }));

  return (
    <>
      <div className="page-banner">
        <h1>Events &amp; Schedule</h1>
      </div>

      <PageSection background="white">
        <p className={styles.intro}>
          All upcoming MTG events at Kitsune Brewing Co. Click any entry to see details.
        </p>
        <CalendarPageClient events={serializedEvents} />
      </PageSection>

      <section className={styles.quickSection}>
        <div className="container">
          <h2 className={styles.quickHeading}>Quick Links</h2>
          <div className={styles.quickLinks}>
            <Link href="/events" className="btn btn-outline">View All Events →</Link>
          </div>
        </div>
      </section>
      <AddressBar />
    </>
  );
}
