import type { Metadata } from "next";
import Link from "next/link";
import PageSection from "@/components/PageSection";
import PageHero from "@/components/ui/PageHero";
import CalendarEmbed from "@/components/CalendarEmbed";
import styles from "./calendar.module.css";

export const metadata: Metadata = {
  title: "Calendar",
  description:
    "See brewery happenings, game nights, and upcoming events at Kitsune Brewing Co. in Phoenix, AZ.",
};

export default function CalendarPage() {
  return (
    <>
      <PageHero kicker="Make a night of it" title="Events and schedule" />

      <PageSection surface="cream" size="md">
        <div className={styles.introRow}>
          <p className={styles.intro}>
            Game nights, brewery happenings, and good reasons to get together. Select an event in our live calendar for the details.
          </p>
          <Link href="/events" className="btn btn-outline">Browse event details →</Link>
        </div>
        <CalendarEmbed presentation="live" />
      </PageSection>
    </>
  );
}
