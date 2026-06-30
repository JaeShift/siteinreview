"use client";

import CalendarView from "@/components/mtg/CalendarView";
import type { CalendarEvent } from "@/lib/calendar/types";

interface SerializedEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: "event" | "foodtruck";
  description?: string;
  location?: string;
  color?: string;
  slug?: string;
}

interface Props {
  events: SerializedEvent[];
}

export default function CalendarPageClient({ events }: Props) {
  const deserialized: CalendarEvent[] = events.map((e) => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));

  return <CalendarView events={deserialized} />;
}
