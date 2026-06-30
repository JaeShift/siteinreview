import type { CalendarProvider } from "./types";
import { MockCalendarProvider } from "./mock-provider";
import { GoogleCalendarProvider } from "./google-provider";

/**
 * Factory that returns the correct CalendarProvider based on environment.
 *
 * - If GOOGLE_EVENTS_CALENDAR_ID and GOOGLE_FOODTRUCK_CALENDAR_ID are both set,
 *   returns a GoogleCalendarProvider (real Google Calendar integration).
 * - Otherwise falls back to MockCalendarProvider (static mock data).
 *
 * Usage in server components / API routes:
 *   const provider = getCalendarProvider();
 *   const events = await provider.getEvents(from, to);
 */
export function getCalendarProvider(): CalendarProvider {
  const eventsId = process.env.GOOGLE_EVENTS_CALENDAR_ID;
  const truckId = process.env.GOOGLE_FOODTRUCK_CALENDAR_ID;

  if (eventsId && truckId) {
    return new GoogleCalendarProvider(eventsId, truckId);
  }

  return new MockCalendarProvider();
}

export type { CalendarProvider, CalendarEvent, CalendarEventType, MonthCalendarData, CalendarDay } from "./types";
