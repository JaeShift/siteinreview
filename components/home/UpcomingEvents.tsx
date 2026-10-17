import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CalendarEmbed from "@/components/CalendarEmbed";
import type { MtgEvent } from "@/lib/events-data";
import MobileEventsCalendar from "./MobileEventsCalendar";
import styles from "./UpcomingEvents.module.css";

export default function UpcomingEvents({ events }: { events: MtgEvent[] }) {
  return <>
    <MobileEventsCalendar featuredEvents={events}>
      <article className={styles.commander} aria-labelledby="commander-feature-title">
        <div className={styles.commanderPhoto}>
          <Image src="/images/uploads/beer and magic.png" alt="A Kitsune beer alongside Commander decks and Magic cards on a taproom table" fill sizes="(max-width: 760px) 0px, (max-width: 1100px) 40vw, 500px" />
        </div>
        <div className={styles.commanderCopy}>
          <p>There’s a seat at the table</p>
          <h3 id="commander-feature-title">Commander nights.</h3>
          <span>Bring a deck, grab a pint, and find your pod.</span>
          <Link href="/commander-nights">Explore Commander <ArrowRight size={20} aria-hidden="true" /></Link>
        </div>
      </article>
    </MobileEventsCalendar>
    <div id="taproom-calendar" className={styles.calendar}>
      <CalendarEmbed presentation="live" compact heading="Taproom calendar" description="Game nights, food trucks, and brewery happenings. Find your next reason to stop by." />
    </div>
  </>;
}
