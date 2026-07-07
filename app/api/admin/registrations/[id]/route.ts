import { NextRequest, NextResponse } from "next/server";
import {
  updateRegistration,
  deleteRegistration,
  getRegistrationsStore,
  getEventsStore,
  saveEventsStore,
} from "@/lib/store";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.checkedIn !== undefined) {
    patch.checkedIn = Boolean(body.checkedIn);
    patch.checkedInAt = body.checkedIn ? new Date().toISOString() : undefined;
  }
  if (body.status !== undefined) patch.status = body.status;
  if (body.tableAssignment !== undefined) patch.tableAssignment = body.tableAssignment;
  if (body.notes !== undefined) patch.notes = body.notes;

  const all = updateRegistration(id, patch);
  const updated = all.find((r) => r.id === id);
  if (!updated) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  // Sync event registeredCount when status changes
  if (patch.status !== undefined) {
    const events = getEventsStore();
    const eventRegs = all.filter((r) => r.eventSlug === updated.eventSlug);
    const confirmedCount = eventRegs.filter((r) => r.status === "confirmed").length;
    saveEventsStore(
      events.map((e) =>
        e.slug === updated.eventSlug ? { ...e, registeredCount: confirmedCount } : e
      )
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = params;
  const registration = getRegistrationsStore().find((r) => r.id === id);
  if (!registration) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  const all = deleteRegistration(id);

  // Sync event registeredCount
  const events = getEventsStore();
  const eventRegs = all.filter((r) => r.eventSlug === registration.eventSlug);
  const confirmedCount = eventRegs.filter((r) => r.status === "confirmed").length;
  saveEventsStore(
    events.map((e) =>
      e.slug === registration.eventSlug ? { ...e, registeredCount: confirmedCount } : e
    )
  );

  return NextResponse.json({ success: true });
}
