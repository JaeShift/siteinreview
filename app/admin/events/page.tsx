import type { Metadata } from "next";
import { getEventsStore, getPrereleaseConfig } from "@/lib/store";
import EventsAdminClient from "./EventsAdminClient";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  const events = getEventsStore();
  const prerelease = getPrereleaseConfig();
  return <EventsAdminClient initialEvents={events} initialPrerelease={prerelease} />;
}
