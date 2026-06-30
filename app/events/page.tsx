import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "MTG Events",
  description:
    "Browse upcoming Magic: The Gathering events at Kitsune Brewing Co. — tournaments, drafts, Commander nights, prereleases, and more in Phoenix, AZ.",
};

export default function EventsPage() {
  return <EventsClient />;
}
