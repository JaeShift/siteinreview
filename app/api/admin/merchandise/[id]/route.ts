import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteMerchandise,
  getMerchandiseStore,
  updateMerchandise,
} from "@/lib/store";
import type { MerchandiseProduct } from "@/lib/merchandise-data";

function refresh() {
  revalidatePath("/shop");
  revalidatePath("/admin/inventory");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const patch = (await request.json().catch(() => null)) as Partial<MerchandiseProduct> | null;
  if (!patch) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const existing = getMerchandiseStore().find((product) => product.id === params.id);
  if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const normalized: Partial<MerchandiseProduct> = {
    ...patch,
    ...(patch.price !== undefined ? { price: Math.max(0, Number(patch.price)) } : {}),
    ...(patch.quantity !== undefined
      ? { quantity: Math.max(0, Math.floor(Number(patch.quantity))) }
      : {}),
  };
  const products = updateMerchandise(params.id, normalized);
  refresh();
  return NextResponse.json(products.find((product) => product.id === params.id));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!getMerchandiseStore().some((product) => product.id === params.id)) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }
  deleteMerchandise(params.id);
  refresh();
  return NextResponse.json({ ok: true });
}
