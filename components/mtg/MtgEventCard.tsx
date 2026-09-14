import Image from "next/image";
import Link from "next/link";
import type { MtgEvent } from "@/lib/events-data";
import { formatEventDate, getSeatsRemaining, isEventSoldOut } from "@/lib/events-data";
import styles from "./MtgEventCard.module.css";

interface Props {
  event: MtgEvent;
}

const FORMAT_COLORS: Record<string, string> = {
  Commander:  "var(--color-cedar)",
  Draft:      "var(--color-action)",
  Standard:   "var(--color-ink)",
  Modern:     "var(--color-action)",
  Pioneer:    "var(--color-cedar)",
  Legacy:     "var(--color-ink)",
  Sealed:     "var(--color-action)",
  Prerelease: "var(--color-action)",
  RCQ:        "var(--color-ink)",
  Casual:     "var(--color-cedar)",
};

export default function MtgEventCard({ event }: Props) {
  const soldOut = isEventSoldOut(event);
  const seatsLeft = getSeatsRemaining(event);
  const formatColor = FORMAT_COLORS[event.format] ?? "var(--color-ink)";

  return (
    <article className={styles.card}>
      <Link href={`/events/${event.slug}`} className={styles.cardLink} aria-label={event.title}>
        <div className={styles.imageWrap}>
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            style={{ objectFit: "contain" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
          <span
            className={styles.formatBadge}
            style={{ backgroundColor: formatColor }}
          >
            {event.format}
          </span>
          {soldOut && <span className={styles.soldOutBadge}>SOLD OUT</span>}
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.description}>{event.shortDescription}</p>

          <div className={styles.meta}>
            <div className={styles.metaRow}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M1 5h12M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span>{formatEventDate(event.date)}</span>
            </div>
            <div className={styles.metaRow}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4v3.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span>{event.time} – {event.endTime}</span>
              {!soldOut && (
                <span className={`${styles.seats} ${seatsLeft <= 5 ? styles.seatsLow : ""}`}>
                  {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left
                </span>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            <div className={styles.feeSeats}>
              <span className={styles.fee}>
                {event.entryFee === 0 ? "FREE" : `$${event.entryFee}`}
              </span>
            </div>
            <span className={`btn btn-primary ${styles.cta} ${soldOut ? styles.ctaSoldOut : ""}`}>
              {soldOut ? "Sold Out" : "Register"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
