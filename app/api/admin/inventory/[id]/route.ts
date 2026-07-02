import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSinglesStore, deleteSingle, updateSingle } from "@/lib/store";

function revalidateAll() {
  revalidatePath("/card-shop");
  revalidatePath("/card-shop-singles");
  revalidatePath("/admin/inventory");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = getSinglesStore();
  if (!existing.some((c) => c.id === params.id)) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  const patch = await req.json().catch(() => ({}));
  const cards = updateSingle(params.id, patch);
  const updated = cards.find((c) => c.id === params.id);
  revalidateAll();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = getSinglesStore();
  if (!existing.some((c) => c.id === params.id)) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const cards = deleteSingle(params.id);
  revalidateAll();
  return NextResponse.json({ success: true, remaining: cards.length });
}
