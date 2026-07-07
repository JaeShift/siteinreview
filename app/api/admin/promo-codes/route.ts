import { NextRequest, NextResponse } from "next/server";
import {
  getPromoCodesStore,
  addPromoCode,
  updatePromoCode,
  deletePromoCode,
  type PromoCode,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPromoCodesStore());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.code || body.discountType === undefined || body.discountValue === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const codes = getPromoCodesStore();
  if (codes.some((c) => c.code.toLowerCase() === body.code.toLowerCase())) {
    return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  }

  const promo: PromoCode = {
    code: body.code.toUpperCase(),
    discountType: body.discountType,
    discountValue: body.discountValue,
    maxUses: body.maxUses ?? undefined,
    usedCount: 0,
    eventSlugs: body.eventSlugs ?? undefined,
    expiresAt: body.expiresAt ?? undefined,
    active: body.active !== false,
  };

  const all = addPromoCode(promo);
  return NextResponse.json(all, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const { code, ...patch } = body;
  const all = updatePromoCode(code, patch);
  return NextResponse.json(all);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const all = deletePromoCode(code);
  return NextResponse.json(all);
}
