/** Shared, serializable calendar data. Dates and times always belong to Phoenix. */
export type TaproomEventKind = "games" | "food" | "music" | "taproom";
export type TaproomEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  date: string;
  endDate: string;
  allDay: boolean;
  kind: TaproomEventKind;
};

export function phoenixDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function startOfWeek(date: string): string {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return addDays(date, -((weekday + 6) % 7));
}

export function shiftMonth(month: string, amount: number): string {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7);
}

export function eventsOnDate(events: TaproomEvent[], date: string): TaproomEvent[] {
  // endDate is inclusive; the feed's exclusive all-day end is normalized on the server.
  return events.filter(event => event.date <= date && event.endDate >= date);
}

/** The weekly lineup never includes ended events or a week before Phoenix's current week. */
export function upcomingWeekEvents(events: TaproomEvent[], week: string, now: number): TaproomEvent[] {
  if (!week || !now || week < startOfWeek(phoenixDate(new Date(now)))) return [];
  const weekEnd = addDays(week, 6);
  return events.filter(event => event.date <= weekEnd && event.endDate >= week && Date.parse(event.end) > now);
}

export function eventKind(title: string): TaproomEventKind {
  if (/commander|magic|bingo|trivia|game|draft|prerelease|tournament|feud|quiz/i.test(title)) return "games";
  if (/food|truck|chicken|taco|bbq|pizza|kitchen|eats/i.test(title)) return "food";
  if (/music|acoustic|concert|live set|karaoke|\bdj\b/i.test(title)) return "music";
  return "taproom";
}

export function eventTime(event: TaproomEvent): string {
  if (event.allDay) return "All day";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix", hour: "numeric", minute: "2-digit",
  }).format(new Date(event.start)).replace(":00", "");
}
