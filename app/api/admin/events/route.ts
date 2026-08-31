import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getEventsStore, saveEventsStore, updateEvent } from "@/lib/store";
import type { MtgEvent } from "@/lib/events-data";
import { expandRecurringEvent } from "@/lib/event-recurrence";

export async function GET() {
  return NextResponse.json(getEventsStore());
}

export async function POST(request: NextRequest) {
  const event = await request.json().catch(() => null) as MtgEvent | null;
  if (!event?.slug || !event?.title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Ensure slug is unique
  const existing = getEventsStore();
  const existingPrerelease =
    event.format === "Prerelease"
      ? existing.find((item) => item.format === "Prerelease")
      : undefined;

  // Pre-release is a singleton. If stale client state sends POST for the
  // existing event, update it instead of failing with a duplicate-slug error.
  if (existingPrerelease) {
    const events = updateEvent(existingPrerelease.slug, {
      ...event,
      slug: existingPrerelease.slug,
    });
    revalidatePath("/events");
    revalidatePath("/calendar");
    revalidatePath("/admin/events");
    revalidatePath("/pre-release");
    return NextResponse.json(events);
  }

  let occurrences: MtgEvent[];
  try {
    occurrences = expandRecurringEvent(event);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid recurrence" },
      { status: 400 }
    );
  }

  const conflictingSlug = occurrences.find((occurrence) =>
    existing.some((item) => item.slug === occurrence.slug)
  );
  if (conflictingSlug) {
    return NextResponse.json(
      { error: `An event already uses the slug "${conflictingSlug.slug}"` },
      { status: 409 }
    );
  }

  const events = [...existing, ...occurrences];
  saveEventsStore(events);
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/admin/events");
  revalidatePath("/pre-release");
  return NextResponse.json(events, { status: 201 });
}
