import type { Metadata } from "next";
import Link from "next/link";
import PageSection from "@/components/PageSection";
import PageHero from "@/components/ui/PageHero";
import CalendarPageClient from "./CalendarPageClient";
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
      <PageHero kicker="Make a night of it" title="Events and schedule" />

      <PageSection surface="cream" size="md">
        <div className={styles.introRow}>
          <p className={styles.intro}>
            All upcoming MTG events at Kitsune Brewing Co. Click any entry to see details.
          </p>
          <Link href="/events" className="btn btn-outline">Browse event details →</Link>
        </div>
        <CalendarPageClient events={serializedEvents} />
      </PageSection>
    </>
  );
}
