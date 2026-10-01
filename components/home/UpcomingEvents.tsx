import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import CalendarEmbed from "@/components/CalendarEmbed";
import type { MtgEvent } from "@/lib/events-data";
import { TAPROOM_TIME_ZONE } from "@/lib/taproom-hours";
import Reveal from "./Reveal";
import MobileEventsCalendar from "./MobileEventsCalendar";
import styles from "./UpcomingEvents.module.css";

const displayTime = (value: string) => value.trim().replace(/\s*(AM|PM)$/i, " $1");

export default function UpcomingEvents({ events }: { events: MtgEvent[] }) {
  return (
    <>
      <MobileEventsCalendar featuredEvents={events} />
      <div className={styles.desktop}>
      <Reveal>
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Play at Kitsune</p>
            <h2 id="events-title">Events & game nights.</h2>
            <p className={styles.intro}>Find your next match. Make a night of it.</p>
          </div>
          <Link href="/events" className={styles.allEvents}>Browse all events <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </header>
        <article className={styles.commander} aria-labelledby="commander-feature-title">
          <div className={styles.commanderPhoto}>
            <Image src="/images/uploads/beer and magic.png" alt="A Kitsune beer alongside Commander decks and Magic cards on a taproom table" fill sizes="(max-width: 680px) 100vw, 55vw" />
            <span>Magic: The Gathering</span>
          </div>
          <div className={styles.commanderCopy}>
            <p>There’s a seat at the table</p>
            <h3 id="commander-feature-title">Commander<br />nights.</h3>
            <span>Bring a deck, grab a pint, and find your pod.</span>
            <Link href="/commander-nights">Explore Commander <ArrowUpRight size={20} aria-hidden="true" /></Link>
          </div>
        </article>
        {events.length > 0 && <div className={styles.board}>
          <div className={styles.boardHeading}>
            <span><CalendarDays size={18} aria-hidden="true" /> Upcoming Magic events</span>
            <a href="#taproom-calendar">Full calendar <ArrowDown size={15} aria-hidden="true" /></a>
          </div>
          <div className={styles.eventList}>
            {events.map(event => {
              const date = new Date(`${event.date}T12:00:00-07:00`);
              const formatDate = (options: Intl.DateTimeFormatOptions) => date.toLocaleDateString("en-US", { ...options, timeZone: TAPROOM_TIME_ZONE });
              const dateLabel = formatDate({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
              const href = event.format === "Prerelease" ? "/pre-release" : `/events/${event.slug}`;
              const excerpt = event.shortDescription?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
              return (
                <article key={event.slug} className={styles.event} aria-label={`${event.title}, ${dateLabel}`}>
                  <time dateTime={event.date} className={styles.date} aria-label={dateLabel}>
                    <span>{formatDate({ month: "short" })}</span>
                    <strong>{formatDate({ day: "numeric" })}</strong>
                    <span>{formatDate({ weekday: "short" })}</span>
                  </time>
                  <Link href={href} className={styles.artwork} aria-label={`View ${event.title}`}>
                    {event.bannerImageUrl || event.imageUrl ? <Image src={event.bannerImageUrl || event.imageUrl} alt="" fill sizes="(max-width: 680px) 100vw, 280px" /> : <CalendarDays size={52} aria-hidden="true" />}
                    <span className={styles.artworkLabel}>Magic: The Gathering</span>
                  </Link>
                  <div className={styles.details}>
                    <span className={styles.format}>{event.format}</span>
                    <h3><Link href={href}>{event.title}</Link></h3>
                    <p className={styles.time}><Clock3 size={15} aria-hidden="true" />{displayTime(event.time)}{event.endTime && ` – ${displayTime(event.endTime)}`}<span> · Phoenix time</span></p>
                    {excerpt && <p className={styles.description}>{excerpt}</p>}
                    {event.location && <p className={styles.location}><MapPin size={14} aria-hidden="true" /><span>{event.location}</span></p>}
                  </div>
                  <div className={styles.purchase}>
                    <div><span className={styles.priceLabel}>Event entry</span><strong className={styles.price}>{event.entryFee === 0 ? "Free" : Number.isFinite(event.entryFee) ? `$${event.entryFee.toFixed(2)}` : "See details"}</strong>{Number.isFinite(event.entryFee) && event.entryFee > 0 && <span className={styles.perPlayer}>per player</span>}</div>
                    <Link href={href} className={styles.eventAction}>Event details <ArrowUpRight size={18} aria-hidden="true" /></Link>
                    <span className={styles.registrationNote}>Registration & event info</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>}
      </Reveal>
      <div id="taproom-calendar" className={styles.calendar}>
        <CalendarEmbed presentation="live" compact heading="Taproom calendar" description="Game nights, food trucks, and brewery happenings. Find your next reason to stop by." />
      </div>
      </div>
    </>
  );
}
