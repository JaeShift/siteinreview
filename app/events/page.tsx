import type { Metadata } from "next";
import { getEventsStore } from "@/lib/store";
import EventsClient from "./EventsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MTG Events",
  description:
    "Browse upcoming Magic: The Gathering events at Kitsune Brewing Co. — tournaments, drafts, Commander nights, prereleases, and more in Phoenix, AZ.",
};

export default function EventsPage() {
  const events = getEventsStore();
  return <EventsClient events={events} />;
}
