import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getEventsStore,
  getPrereleaseEventStore,
  saveEventsStore,
  savePrereleaseEventStore,
} from "@/lib/store";
import type { MtgEvent } from "@/lib/events-data";
import { expandRecurringEvent } from "@/lib/event-recurrence";

export async function GET() {
  const events = getEventsStore();
  const prerelease = await getPrereleaseEventStore();
  return NextResponse.json(
    prerelease
      ? [...events.filter((event) => event.format !== "Prerelease"), prerelease]
      : events
  );
}

export async function POST(request: NextRequest) {
  const event = await request.json().catch(() => null) as MtgEvent | null;
  if (!event?.slug || !event?.title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = getEventsStore();

  // Pre-release is a singleton stored persistently outside the serverless filesystem.
  if (event.format === "Prerelease") {
    try {
      const existingPrerelease = await getPrereleaseEventStore();
      const saved = await savePrereleaseEventStore({
        ...event,
        slug: existingPrerelease?.slug ?? event.slug,
      });
      const events = [
        ...existing.filter((item) => item.format !== "Prerelease"),
        saved,
      ];
      revalidatePath("/events");
      revalidatePath("/calendar");
      revalidatePath("/admin/events");
      revalidatePath("/pre-release");
      return NextResponse.json(events, { status: existingPrerelease ? 200 : 201 });
    } catch (error) {
      console.error("[api/admin/events] Failed to persist pre-release event:", error);
      return NextResponse.json(
        { error: "Unable to save the pre-release status. Check persistent storage configuration." },
        { status: 500 }
      );
    }
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
