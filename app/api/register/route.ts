import { NextRequest, NextResponse } from "next/server";
import {
  getEventsStore,
  saveEventsStore,
  addRegistration,
  getRegistrationsByEvent,
  type Registration,
} from "@/lib/store";
import {
  sendEventConfirmationEmail,
  sendAdminRegistrationNotification,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.eventSlug || !body?.firstName || !body?.lastName || !body?.email || !body?.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { eventSlug, firstName, lastName, email, phone, notes, customAnswers, selectedAddOns } =
    body as {
      eventSlug: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      notes?: string;
      customAnswers?: Record<string, string>;
      selectedAddOns?: string[];
    };

  const events = getEventsStore();
  const event = events.find((e) => e.slug === eventSlug);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (event.registrationOpen === false) {
    return NextResponse.json({ error: "Registration is closed for this event." }, { status: 403 });
  }

  // Check for duplicate registration by email or phone
  const TEST_EMAILS = ["kitsune@test.com", "ryleejae1009@gmail.com"];
  const TEST_PHONE = "6149551111";
  const normalizedPhone = phone.replace(/\D/g, "");
  const isTestAccount =
    TEST_EMAILS.includes(email.toLowerCase()) || normalizedPhone === TEST_PHONE;

  const existingRegistrations = getRegistrationsByEvent(eventSlug);

  if (!isTestAccount) {
    const duplicate = existingRegistrations.find(
      (r) =>
        r.status !== "cancelled" &&
        (r.email.toLowerCase() === email.toLowerCase() ||
          r.phone.replace(/\D/g, "") === normalizedPhone)
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "duplicate", message: "It looks like you're already registered for this event using that email or phone number." },
        { status: 409 }
      );
    }
  }

  // Check capacity
  const confirmedCount = existingRegistrations.filter(
    (r) => r.status === "confirmed"
  ).length;

  const isFull = event.playerLimit > 0 && confirmedCount >= event.playerLimit;
  const status: Registration["status"] = isFull ? "waitlisted" : "confirmed";

  const registration: Registration = {
    id: crypto.randomUUID(),
    eventSlug,
    firstName,
    lastName,
    email,
    phone,
    notes: notes ?? undefined,
    status,
    checkedIn: false,
    customAnswers: customAnswers ?? undefined,
    selectedAddOns: selectedAddOns ?? undefined,
    createdAt: new Date().toISOString(),
  };

  addRegistration(registration);

  // Sync registeredCount on event from actual confirmed count
  if (status === "confirmed") {
    const updatedEvents = events.map((e) =>
      e.slug === eventSlug
        ? { ...e, registeredCount: confirmedCount + 1 }
        : e
    );
    saveEventsStore(updatedEvents);
  }

  // Send emails (non-blocking, don't fail the request if email fails)
  Promise.all([
    sendEventConfirmationEmail(registration, event),
    sendAdminRegistrationNotification(registration, event),
  ]).catch((err) => console.error("Registration email error:", err));

  const confirmationNumber = Math.random().toString(36).slice(2, 8).toUpperCase();

  return NextResponse.json({
    confirmationNumber,
    status,
    message:
      status === "waitlisted"
        ? "Event is full — you've been added to the waitlist."
        : "Registration confirmed!",
  });
}
