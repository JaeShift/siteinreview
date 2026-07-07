import { NextRequest, NextResponse } from "next/server";
import {
  getEventCreditsStore,
  addEventCredit,
  updateEventCredit,
  type EventCredit,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getEventCreditsStore());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.customerEmail || body.balance === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const credit: EventCredit = {
    code: `KC-${Date.now().toString(36).toUpperCase()}`,
    balance: body.balance,
    customerEmail: body.customerEmail,
    expiresAt: body.expiresAt ?? undefined,
    issuedAt: new Date().toISOString(),
    issuedBy: body.issuedBy ?? "admin",
  };

  const all = addEventCredit(credit);
  return NextResponse.json(all, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const { code, ...patch } = body;
  const all = updateEventCredit(code, patch);
  return NextResponse.json(all);
}
