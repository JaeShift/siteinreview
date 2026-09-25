"use client";

import { useEffect, useId, useState } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { getGoogleCalendarEmbedUrl, GOOGLE_CALENDAR_URL } from "@/lib/calendar-embed";
import styles from "./CalendarEmbed.module.css";

type CalendarEmbedProps = {
  compact?: boolean;
  minimal?: boolean;
  presentation?: "default" | "live";
  heading?: string;
  description?: string;
};

export default function CalendarEmbed({ compact = false, minimal = false, presentation = "default", heading = "Taproom calendar", description }: CalendarEmbedProps) {
  const [expanded, setExpanded] = useState(false);
  const [mobile, setMobile] = useState(false);
  const calendarId = useId();
  const live = presentation === "live";

  useEffect(() => {
    if (!live) return;
    const query = window.matchMedia("(max-width: 759px)");
    const updateView = () => setMobile(query.matches);
    updateView();
    query.addEventListener("change", updateView);
    return () => query.removeEventListener("change", updateView);
  }, [live]);

  if (live) {
    return (
      <section className={`${styles.calendarWrapper} ${styles.live}`} aria-labelledby={`${calendarId}-heading`}>
        <div className={styles.liveHeader}>
          <div className={styles.liveTitle}>
            <CalendarDays size={23} strokeWidth={1.5} aria-hidden="true" />
            <h2 id={`${calendarId}-heading`}>{heading}</h2>
          </div>
          <a className={styles.externalLink} href={GOOGLE_CALENDAR_URL} target="_blank" rel="noreferrer">
            Open in Google Calendar <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        {description && <p className={styles.liveDescription}>{description}</p>}
        <div className={styles.liveFrame}>
          <iframe
            src={getGoogleCalendarEmbedUrl(mobile ? "AGENDA" : "MONTH")}
            title="Kitsune taproom events — Google Calendar"
            loading="eager"
            className={styles.calendarIframe}
          />
        </div>
        <p className={styles.timeZone}>All times are local to Phoenix, Arizona.</p>
      </section>
    );
  }

  return (
    <div className={`${styles.calendarWrapper} ${compact ? styles.compact : ""} ${minimal ? styles.minimal : ""}`}>
      {compact && <div className={styles.calendarIntro}>
        {minimal ? <p className={styles.calendarLabel}>More happening at the brewery</p> : <div><p className={styles.calendarLabel}>Your next night out</p><h3>Check the taproom calendar.</h3><p>Find dates for game nights, brewery events, and neighborhood hangs.</p></div>}
        <div className={styles.calendarActions}>
          <button type="button" aria-expanded={expanded} aria-controls={calendarId} onClick={() => setExpanded(!expanded)}>{expanded ? "Hide calendar" : "Show live calendar"}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
          <a href={GOOGLE_CALENDAR_URL} target="_blank" rel="noreferrer">Open in Google Calendar <span aria-hidden="true">↗</span></a>
        </div>
      </div>}
      <div id={calendarId} hidden={compact && !expanded}>
      {(!compact || expanded) && <iframe
        src={getGoogleCalendarEmbedUrl(compact ? "AGENDA" : "MONTH")}
        title="Kitsune Calendar"
        loading="lazy"
        className={styles.calendarIframe}
      />}
      </div>
    </div>
  );
}
