import ICAL from "ical.js";
import { eventKind, phoenixDate, type TaproomEvent } from "./taproom-calendar";

function plainText(value: string): string {
  return value.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").trim();
}

/** Expand the existing public feed, including exceptions and cancellations. */
export function parseTaproomCalendar(source: string, from: Date, to: Date): TaproomEvent[] {
  const calendar = new ICAL.Component(ICAL.parse(source));
  for (const zone of calendar.getAllSubcomponents("vtimezone")) ICAL.TimezoneService.register(zone);
  const components = calendar.getAllSubcomponents("vevent");
  const result = new Map<string, TaproomEvent>();
  const exceptions = components.filter(component => component.hasProperty("recurrence-id"));

  const add = (event: InstanceType<typeof ICAL.Event>, start: InstanceType<typeof ICAL.Time>, end: InstanceType<typeof ICAL.Time>) => {
    if (event.component.getFirstPropertyValue("status") === "CANCELLED") return;
    // Floating and date-only values in this taproom feed refer to Phoenix, never the server timezone.
    const asDate = (time: InstanceType<typeof ICAL.Time>) => time.isDate || time.zone.tzid === "floating"
      ? new Date(`${time.toString()}${time.isDate ? "T00:00:00" : ""}-07:00`)
      : time.toJSDate();
    const startDate = asDate(start);
    const endDate = asDate(end);
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) return;
    if (startDate >= to || (endDate <= from && startDate < from)) return;
    const title = plainText(event.summary || "Taproom event");
    const id = `${event.uid}:${startDate.toISOString()}`;
    result.set(id, {
      id, title, description: plainText(event.description || ""), location: plainText(event.location || ""),
      start: startDate.toISOString(), end: endDate.toISOString(), date: phoenixDate(startDate),
      endDate: phoenixDate(new Date(Math.max(startDate.getTime(), endDate.getTime() - 1))),
      allDay: start.isDate, kind: eventKind(title),
    });
  };

  for (const component of components) {
    if (component.hasProperty("recurrence-id") || !component.hasProperty("dtstart")) continue;
    const event = new ICAL.Event(component, { exceptions: exceptions.filter(exception => exception.getFirstPropertyValue("uid") === component.getFirstPropertyValue("uid")) });
    if (component.getFirstPropertyValue("status") === "CANCELLED") continue;
    if (!event.isRecurring()) { add(event, event.startDate, event.endDate); continue; }
    const iterator = event.iterator();
    let occurrence;
    let iterations = 0;
    while ((occurrence = iterator.next())) {
      // Bound work on malformed / unusually frequent feeds. Never return a silently partial month.
      if (++iterations > 25000) throw new Error("Calendar recurrence limit exceeded");
      if (occurrence.toJSDate().getTime() > to.getTime() + 86400000) break;
      const details = event.getOccurrenceDetails(occurrence);
      add(details.item, details.startDate, details.endDate);
    }
  }
  // Also include exceptions moved into this range from an occurrence outside it.
  for (const component of exceptions) {
    const master = components.find(candidate => !candidate.hasProperty("recurrence-id") && candidate.getFirstPropertyValue("uid") === component.getFirstPropertyValue("uid"));
    if (master?.getFirstPropertyValue("status") === "CANCELLED" || !component.hasProperty("dtstart")) continue;
    const event = new ICAL.Event(component);
    add(event, event.startDate, event.endDate);
  }
  return Array.from(result.values()).sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
}
