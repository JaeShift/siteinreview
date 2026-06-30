/**
 * Google Calendar Provider (stub — not yet implemented)
 *
 * To activate:
 * 1. Set GOOGLE_EVENTS_CALENDAR_ID and GOOGLE_FOODTRUCK_CALENDAR_ID in .env.local
 * 2. Set GOOGLE_CALENDAR_CREDENTIALS (service account JSON stringified)
 * 3. Install: npm install googleapis
 * 4. Implement the methods below using the Google Calendar API
 *
 * The CalendarProvider interface in ./types.ts is the contract this must satisfy.
 * All page components consume only CalendarProvider — swapping this in requires
 * no changes to any page or UI component.
 */

import type { CalendarProvider, CalendarEvent } from "./types";

export class GoogleCalendarProvider implements CalendarProvider {
  private eventsCalendarId: string;
  private foodTruckCalendarId: string;

  constructor(eventsCalendarId: string, foodTruckCalendarId: string) {
    this.eventsCalendarId = eventsCalendarId;
    this.foodTruckCalendarId = foodTruckCalendarId;
  }

  async getEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    // TODO: implement with googleapis
    // const { google } = await import("googleapis");
    // const auth = new google.auth.GoogleAuth({ ... });
    // const calendar = google.calendar({ version: "v3", auth });
    // const res = await calendar.events.list({
    //   calendarId: this.eventsCalendarId,
    //   timeMin: from.toISOString(),
    //   timeMax: to.toISOString(),
    //   singleEvents: true,
    //   orderBy: "startTime",
    // });
    // return res.data.items?.map(mapGoogleEvent) ?? [];

    console.warn("[GoogleCalendarProvider] getEvents not yet implemented — returning empty array");
    return [];
  }

  async getFoodTruckSchedule(from: Date, to: Date): Promise<CalendarEvent[]> {
    // TODO: implement with googleapis — same pattern as getEvents but uses foodTruckCalendarId
    console.warn("[GoogleCalendarProvider] getFoodTruckSchedule not yet implemented — returning empty array");
    return [];
  }

  async getAllEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    const [events, trucks] = await Promise.all([
      this.getEvents(from, to),
      this.getFoodTruckSchedule(from, to),
    ]);
    return [...events, ...trucks].sort((a, b) => a.start.getTime() - b.start.getTime());
  }
}

// ─── Future: map a Google Calendar API event to our CalendarEvent type ────────
// function mapGoogleEvent(item: calendar_v3.Schema$Event): CalendarEvent {
//   return {
//     id: item.id ?? "",
//     title: item.summary ?? "Untitled",
//     start: new Date(item.start?.dateTime ?? item.start?.date ?? ""),
//     end: new Date(item.end?.dateTime ?? item.end?.date ?? ""),
//     type: "event",
//     description: item.description ?? undefined,
//     location: item.location ?? undefined,
//     googleId: item.id ?? undefined,
//   };
// }
