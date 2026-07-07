import { NextRequest, NextResponse } from "next/server";
import {
  getRegistrationsStore,
  addRegistration,
  getEventsStore,
  saveEventsStore,
  type Registration,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get("eventSlug");

  const all = getRegistrationsStore();
  const result = eventSlug ? all.filter((r) => r.eventSlug === eventSlug) : all;
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.eventSlug || !body?.firstName || !body?.lastName || !body?.email || !body?.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const events = getEventsStore();
  const event = events.find((e) => e.slug === body.eventSlug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const registration: Registration = {
    id: crypto.randomUUID(),
    eventSlug: body.eventSlug,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    notes: body.notes ?? undefined,
    status: body.status ?? "confirmed",
    checkedIn: false,
    tableAssignment: body.tableAssignment ?? undefined,
    createdAt: new Date().toISOString(),
  };

  const all = addRegistration(registration);

  // Sync event registeredCount
  if (registration.status === "confirmed") {
    const confirmedCount = all.filter(
      (r) => r.eventSlug === body.eventSlug && r.status === "confirmed"
    ).length;
    saveEventsStore(
      events.map((e) =>
        e.slug === body.eventSlug ? { ...e, registeredCount: confirmedCount } : e
      )
    );
  }

  return NextResponse.json(registration, { status: 201 });
}
