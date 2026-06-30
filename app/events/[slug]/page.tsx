import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mtgEvents, getEventBySlug } from "@/lib/events-data";
import EventDetailClient from "./EventDetailClient";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return mtgEvents.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = getEventBySlug(params.slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.shortDescription,
  };
}

export default function EventDetailPage({ params }: Props) {
  const event = getEventBySlug(params.slug);
  if (!event) notFound();
  return <EventDetailClient event={event} />;
}
