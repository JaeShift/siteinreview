import styles from "./CalendarEmbed.module.css";

export default function CalendarEmbed() {
  return (
    <div className={styles.calendarWrapper}>
      <iframe
        src="https://calendar.google.com/calendar/embed?src=7eb090bc4a91af6d615fe6016391bb579a2d189e3a07c5e365713a50c2073d0d%40group.calendar.google.com&ctz=America%2FPhoenix&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0&mode=MONTH"
        title="Kitsune Calendar"
        loading="lazy"
        className={styles.calendarIframe}
      />
    </div>
  );
}
