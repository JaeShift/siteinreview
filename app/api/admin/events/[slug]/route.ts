import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateEvent, deleteEvent } from "@/lib/store";
import type { MtgEvent } from "@/lib/events-data";

interface Params { params: { slug: string } }

export async function PUT(request: NextRequest, { params }: Params) {
  const event = await request.json().catch(() => null) as MtgEvent | null;
  if (!event) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const events = updateEvent(params.slug, event);
  revalidatePath("/events");
  revalidatePath(`/events/${params.slug}`);
  revalidatePath("/calendar");
  return NextResponse.json(events);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const events = deleteEvent(params.slug);
  revalidatePath("/events");
  revalidatePath("/calendar");
  return NextResponse.json(events);
}
