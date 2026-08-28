import { NextRequest, NextResponse } from "next/server";
import {
  addRegistration,
  getEventsStore,
  getRegistrationsStore,
  saveEventsStore,
  type Registration,
} from "@/lib/store";

export const dynamic = "force-dynamic";

const VALID_STATUSES: Registration["status"][] = [
  "confirmed",
  "waitlisted",
  "cancelled",
  "refunded",
];

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Registration | null;

  if (
    !body?.id ||
    !body.eventSlug ||
    !body.firstName ||
    !body.lastName ||
    !body.email ||
    !body.phone ||
    !body.createdAt ||
    !VALID_STATUSES.includes(body.status)
  ) {
    return NextResponse.json({ error: "Invalid registration" }, { status: 400 });
  }

  if (getRegistrationsStore().some((registration) => registration.id === body.id)) {
    return NextResponse.json({ error: "Registration already exists" }, { status: 409 });
  }

  const events = getEventsStore();
  if (!events.some((event) => event.slug === body.eventSlug)) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const registration: Registration = {
    ...body,
    checkedIn: Boolean(body.checkedIn),
  };
  const all = addRegistration(registration);

  const confirmedCount = all.filter(
    (item) => item.eventSlug === registration.eventSlug && item.status === "confirmed"
  ).length;
  saveEventsStore(
    events.map((event) =>
      event.slug === registration.eventSlug
        ? { ...event, registeredCount: confirmedCount }
        : event
    )
  );

  return NextResponse.json(registration, { status: 201 });
}
