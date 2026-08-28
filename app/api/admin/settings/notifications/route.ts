import { NextRequest, NextResponse } from "next/server";
import {
  getNotificationSettingsStore,
  saveNotificationSettingsStore,
  type NotificationSettings,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getNotificationSettingsStore());
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as NotificationSettings | null;

  if (
    !body ||
    typeof body.email !== "string" ||
    (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) ||
    !body.triggers ||
    typeof body.triggers !== "object"
  ) {
    return NextResponse.json({ error: "Invalid notification settings" }, { status: 400 });
  }

  const triggers = Object.fromEntries(
    Object.entries(body.triggers).map(([key, enabled]) => [key, Boolean(enabled)])
  );
  const settings: NotificationSettings = {
    email: body.email.trim(),
    triggers,
  };
  saveNotificationSettingsStore(settings);

  return NextResponse.json(settings);
}
