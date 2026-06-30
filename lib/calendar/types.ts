export type CalendarEventType = "event" | "foodtruck";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: CalendarEventType;
  description?: string;
  location?: string;
  color?: string;
  /** For event type: link to /events/[slug] */
  slug?: string;
  /** For foodtruck type: truck id for detail lookup */
  truckId?: string;
  /** Google Calendar event ID (when using real provider) */
  googleId?: string;
}

export interface CalendarProvider {
  /** Returns store events (MTG, etc.) in the given date range */
  getEvents(from: Date, to: Date): Promise<CalendarEvent[]>;
  /** Returns food truck schedule in the given date range */
  getFoodTruckSchedule(from: Date, to: Date): Promise<CalendarEvent[]>;
  /** Returns both types combined */
  getAllEvents(from: Date, to: Date): Promise<CalendarEvent[]>;
}

export interface MonthCalendarData {
  year: number;
  month: number;  // 0-indexed
  days: CalendarDay[];
}

export interface CalendarDay {
  date: Date;
  dateStr: string;  // "YYYY-MM-DD"
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
