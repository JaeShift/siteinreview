import type { MtgEvent } from "./events-data";
import type { SingleCard } from "./singles-data";

/** The store appends additions; use that order without claiming arrival dates. */
export function selectFeaturedProducts(cards: SingleCard[], limit = 4): SingleCard[] {
  const names = new Set<string>();
  return [...cards].reverse().filter(card => {
    if (!card.id?.trim() || !card.name?.trim() || !card.imageUrl?.trim() ||
        card.hidden || card.availability === "Presale" ||
        !Number.isInteger(card.quantity) || card.quantity <= 0 ||
        !Number.isFinite(card.price) || card.price <= 0) return false;
    const name = card.name.trim().toLocaleLowerCase("en-US");
    if (names.has(name)) return false;
    names.add(name);
    return true;
  }).slice(0, limit);
}

function eventHasNotEnded(event: MtgEvent, now: Date): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return false;
  const date = new Date(`${event.date}T12:00:00-07:00`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== event.date) return false;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find(value => value.type === type)?.value ?? "";
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  if (event.date !== today) return event.date > today;
  const end = event.endTime?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!end || +end[1] < 1 || +end[1] > 12 || +end[2] > 59) return true;
  const endMinutes = (+end[1] % 12 + (end[3].toUpperCase() === "PM" ? 12 : 0)) * 60 + +end[2];
  return +part("hour") * 60 + +part("minute") < endMinutes;
}

/** Prerelease registration has its own authoritative source. Never invent recurrences. */
export function selectUpcomingEvents(events: MtgEvent[], prerelease: MtgEvent | null, now = new Date()): MtgEvent[] {
  const candidates = [...events.filter(event => event.format !== "Prerelease"), ...(prerelease ? [prerelease] : [])];
  const seen = new Set<string>();
  return candidates.filter(event => {
    if (event.hidden || !event.slug || !event.title?.trim() || !eventHasNotEnded(event, now) || seen.has(event.slug)) return false;
    seen.add(event.slug);
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title)).slice(0, 2);
}
