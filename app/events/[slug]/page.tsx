import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getEventsStore } from "@/lib/store";
import EventDetailClient from "./EventDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const events = getEventsStore();
  const event = events.find((e) => e.slug === params.slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.shortDescription,
  };
}

export default function EventDetailPage({ params }: Props) {
  const events = getEventsStore();
  const event = events.find((e) => e.slug === params.slug);
  if (!event) notFound();
  if (event.format === "Prerelease") redirect("/pre-release");
  return <EventDetailClient event={event} />;
}
