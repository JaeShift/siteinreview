import { NextRequest, NextResponse } from "next/server";
import { getOrdersStore, saveOrdersStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null) as { id: string; category: string } | null;
  if (!body?.id || !body?.category) {
    return NextResponse.json({ error: "Missing id or category" }, { status: 400 });
  }

  const orders = getOrdersStore();
  const idx = orders.findIndex((o) => o.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  orders[idx] = {
    ...orders[idx],
    metadata: { ...orders[idx].metadata, category: body.category },
  };

  saveOrdersStore(orders);
  return NextResponse.json({ success: true });
}
