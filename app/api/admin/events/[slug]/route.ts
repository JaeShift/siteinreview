import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getEventsStore, saveEventsStore, updateEvent, deleteEvent } from "@/lib/store";
import type { MtgEvent } from "@/lib/events-data";
import { expandRecurringEvent } from "@/lib/event-recurrence";

interface Params { params: { slug: string } }

export async function PUT(request: NextRequest, { params }: Params) {
  const event = await request.json().catch(() => null) as MtgEvent | null;
  if (!event) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const existing = getEventsStore();
  const savedEvent = existing.find((item) => item.slug === params.slug);
  if (!savedEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    const managesSeries =
      Boolean(event.recurring) ||
      savedEvent.recurrenceGroupId === params.slug;
    let events: MtgEvent[];

    if (managesSeries) {
      const seriesId = params.slug;
      const rootEvent: MtgEvent = event.recurring
        ? { ...event, slug: params.slug, recurrenceGroupId: seriesId }
        : {
            ...event,
            slug: params.slug,
            recurringUntil: undefined,
            recurrenceGroupId: undefined,
          };
      const occurrences = expandRecurringEvent(rootEvent);
      const remaining = existing.filter(
        (item) =>
          item.slug !== params.slug &&
          item.recurrenceGroupId !== seriesId
      );
      const conflict = occurrences.find((occurrence) =>
        remaining.some((item) => item.slug === occurrence.slug)
      );
      if (conflict) {
        return NextResponse.json(
          { error: `An event already uses the slug "${conflict.slug}"` },
          { status: 409 }
        );
      }
      events = [...remaining, ...occurrences];
      saveEventsStore(events);
    } else {
      events = updateEvent(params.slug, { ...event, slug: params.slug });
    }

    revalidatePath("/events");
    revalidatePath(`/events/${params.slug}`);
    revalidatePath("/calendar");
    revalidatePath("/pre-release");
    return NextResponse.json(events);
  } catch (error) {
    console.error("[api/admin/events] Failed to update event:", error);
    return NextResponse.json(
      { error: "Unable to save the event. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const events = deleteEvent(params.slug);
  revalidatePath("/events");
  revalidatePath("/calendar");
  return NextResponse.json(events);
}
