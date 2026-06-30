import type { Metadata } from "next";
import { getEventsStore } from "@/lib/store";
import EventsAdminClient from "./EventsAdminClient";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  const events = getEventsStore();
  return <EventsAdminClient initialEvents={events} />;
}
