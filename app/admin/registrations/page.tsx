import type { Metadata } from "next";
import { getEventsStore, getRegistrationsStore } from "@/lib/store";
import RegistrationsAdminClient from "./RegistrationsAdminClient";

export const metadata: Metadata = { title: "Registrations" };
export const dynamic = "force-dynamic";

export default function AdminRegistrationsPage() {
  const events = getEventsStore();
  const registrations = getRegistrationsStore();

  return (
    <RegistrationsAdminClient
      initialRegistrations={registrations}
      events={events}
    />
  );
}
