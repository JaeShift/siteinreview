import type { CalendarProvider, CalendarEvent } from "./types";
import { mtgEvents } from "@/lib/events-data";
import { foodTrucks } from "@/lib/food-trucks-data";

function parseDate(dateStr: string, timeStr: string): Date {
  // Combine "YYYY-MM-DD" + "H:MM AM/PM" into a Date
  const [datePart] = [dateStr];
  const [time, period] = timeStr.split(" ");
  const [hourStr, minStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);

  if (period?.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period?.toUpperCase() === "AM" && hour === 12) hour = 0;

  const d = new Date(`${datePart}T00:00:00`);
  d.setHours(hour, min, 0, 0);
  return d;
}

function inRange(start: Date, end: Date, from: Date, to: Date): boolean {
  return start <= to && end >= from;
}

export class MockCalendarProvider implements CalendarProvider {
  async getEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    const results: CalendarEvent[] = [];

    for (const event of mtgEvents) {
      const start = parseDate(event.date, event.time);
      const end = parseDate(event.date, event.endTime);

      if (!inRange(start, end, from, to)) continue;

      results.push({
        id: `event-${event.slug}`,
        title: event.title,
        start,
        end,
        type: "event",
        description: event.shortDescription,
        location: event.location,
        color: "#ff0000",
        slug: event.slug,
      });
    }

    return results.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  async getFoodTruckSchedule(from: Date, to: Date): Promise<CalendarEvent[]> {
    const results: CalendarEvent[] = [];

    for (const truck of foodTrucks) {
      for (const entry of truck.schedule) {
        const start = parseDate(entry.date, entry.startTime);
        const end = parseDate(entry.date, entry.endTime);

        if (!inRange(start, end, from, to)) continue;

        results.push({
          id: `truck-${truck.id}-${entry.date}`,
          title: truck.name,
          start,
          end,
          type: "foodtruck",
          description: `${truck.cuisine} | ${entry.startTime} – ${entry.endTime}`,
          color: "#008000",
          truckId: truck.id,
        });
      }
    }

    return results.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  async getAllEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    const [events, trucks] = await Promise.all([
      this.getEvents(from, to),
      this.getFoodTruckSchedule(from, to),
    ]);
    return [...events, ...trucks].sort((a, b) => a.start.getTime() - b.start.getTime());
  }
}
