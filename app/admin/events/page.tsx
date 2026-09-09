import type { Metadata } from "next";
import { getEventsStore, getPrereleaseEventStore } from "@/lib/store";
import EventsAdminClient from "./EventsAdminClient";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = getEventsStore();
  const prerelease = await getPrereleaseEventStore();
  const mergedEvents = prerelease
    ? [...events.filter((event) => event.format !== "Prerelease"), prerelease]
    : events;
  return <EventsAdminClient initialEvents={mergedEvents} />;
}
