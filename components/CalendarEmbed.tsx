"use client";

import { useState } from "react";
import styles from "./CalendarEmbed.module.css";

const calendarId = "7eb090bc4a91af6d615fe6016391bb579a2d189e3a07c5e365713a50c2073d0d%40group.calendar.google.com";

export default function CalendarEmbed({ compact = false }: { compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`${styles.calendarWrapper} ${compact ? styles.compact : ""}`}>
      {compact && <div className={styles.calendarIntro}>
        <div><p className={styles.calendarLabel}>Your next night out</p><h3>Check the taproom calendar.</h3><p>Find dates for game nights, brewery events, and neighborhood hangs.</p></div>
        <div className={styles.calendarActions}>
          <button type="button" aria-expanded={expanded} aria-controls="home-live-calendar" onClick={() => setExpanded(!expanded)}>{expanded ? "Hide calendar" : "Show live calendar"}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>
          <a href={`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=America%2FPhoenix`} target="_blank" rel="noreferrer">Open in Google Calendar <span aria-hidden="true">↗</span></a>
        </div>
      </div>}
      <div id={compact ? "home-live-calendar" : undefined} hidden={compact && !expanded}>
      {(!compact || expanded) && <iframe
        src={`https://calendar.google.com/calendar/embed?src=${calendarId}&ctz=America%2FPhoenix&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=${compact ? "AGENDA" : "MONTH"}`}
        title="Kitsune Calendar"
        loading="lazy"
        className={styles.calendarIframe}
      />}
      </div>
    </div>
  );
}
