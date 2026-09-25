import { TAPROOM_TIME_ZONE } from "./taproom-hours";

export const GOOGLE_CALENDAR_ID = "7eb090bc4a91af6d615fe6016391bb579a2d189e3a07c5e365713a50c2073d0d@group.calendar.google.com";

export type GoogleCalendarView = "MONTH" | "AGENDA";

export function getGoogleCalendarEmbedUrl(view: GoogleCalendarView = "MONTH") {
  const params = new URLSearchParams({
    src: GOOGLE_CALENDAR_ID,
    ctz: TAPROOM_TIME_ZONE,
    mode: view,
    showTitle: "0",
    showNav: "1",
    showDate: "1",
    showPrint: "0",
    showTabs: "0",
    showCalendars: "0",
    showTz: "0",
  });
  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
}

export const GOOGLE_CALENDAR_URL = `https://calendar.google.com/calendar/embed?${new URLSearchParams({
  src: GOOGLE_CALENDAR_ID,
  ctz: TAPROOM_TIME_ZONE,
}).toString()}`;
