import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getEventsStore, addEvent } from "@/lib/store";
import type { MtgEvent } from "@/lib/events-data";

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
  if (existing.some((e) => e.slug === event.slug)) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  const events = addEvent(event);
  revalidatePath("/events");
  revalidatePath("/calendar");
  revalidatePath("/admin/events");
  return NextResponse.json(events, { status: 201 });
}
