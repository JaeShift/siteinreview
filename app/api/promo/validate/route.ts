import { NextRequest, NextResponse } from "next/server";
import { getPromoCodesStore, updatePromoCode } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.code) {
    return NextResponse.json({ error: "Missing promo code" }, { status: 400 });
  }

  const { code, eventSlug } = body as { code: string; eventSlug?: string };
  const codes = getPromoCodesStore();
  const promo = codes.find(
    (c) => c.code.toLowerCase() === code.toLowerCase()
  );

  if (!promo) {
    return NextResponse.json({ valid: false, error: "Code not found" });
  }
  if (!promo.active) {
    return NextResponse.json({ valid: false, error: "Code is inactive" });
  }
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, error: "Code has expired" });
  }
  if (promo.maxUses !== undefined && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ valid: false, error: "Code has reached its usage limit" });
  }
  if (promo.eventSlugs && promo.eventSlugs.length > 0 && eventSlug && !promo.eventSlugs.includes(eventSlug)) {
    return NextResponse.json({ valid: false, error: "Code not valid for this event" });
  }

  return NextResponse.json({
    valid: true,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    code: promo.code,
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  // Increment usedCount
  updatePromoCode(body.code, { usedCount: (getPromoCodesStore().find((c) => c.code === body.code)?.usedCount ?? 0) + 1 });
  return NextResponse.json({ success: true });
}
