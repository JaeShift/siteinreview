import type { MtgEvent } from "./events-data";

const MAX_OCCURRENCES = 104;

function addInterval(date: Date, frequency: NonNullable<MtgEvent["recurring"]>) {
  const next = new Date(date);
  if (frequency === "weekly") next.setUTCDate(next.getUTCDate() + 7);
  if (frequency === "biweekly") next.setUTCDate(next.getUTCDate() + 14);
  if (frequency === "monthly") {
    const desiredDay = next.getUTCDate();
    next.setUTCDate(1);
    next.setUTCMonth(next.getUTCMonth() + 1);
    const lastDay = new Date(
      Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
    ).getUTCDate();
    next.setUTCDate(Math.min(desiredDay, lastDay));
  }
  return next;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function expandRecurringEvent(event: MtgEvent): MtgEvent[] {
  if (!event.recurring || !event.recurringUntil) return [event];
  if (event.recurringUntil < event.date) {
    throw new Error("Recurrence end date must be on or after the event date.");
  }

  const groupId = event.recurrenceGroupId ?? event.slug;
  const occurrences: MtgEvent[] = [
    { ...event, recurrenceGroupId: groupId },
  ];
  let date = new Date(`${event.date}T12:00:00Z`);

  while (occurrences.length < MAX_OCCURRENCES) {
    date = addInterval(date, event.recurring);
    const dateString = toDateString(date);
    if (dateString > event.recurringUntil) break;

    occurrences.push({
      ...event,
      slug: `${groupId}-${dateString}`,
      date: dateString,
      registeredCount: 0,
      recurring: undefined,
      recurringUntil: undefined,
      recurrenceGroupId: groupId,
    });
  }

  return occurrences;
}
