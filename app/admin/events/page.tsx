import type { Metadata } from "next";
import { getEventsStore } from "@/lib/store";
import EventsAdminClient from "./EventsAdminClient";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  const events = getEventsStore();
  const today = new Date().toISOString().split("T")[0];
  const currentPrerelease = events
    .filter((e) => e.format === "Prerelease" && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  return <EventsAdminClient initialEvents={events} currentPrerelease={currentPrerelease} />;
}
