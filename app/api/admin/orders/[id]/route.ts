import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteOrder, getOrdersStore } from "@/lib/store";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = params;
  const order = getOrdersStore().find((o) => o.id === id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  deleteOrder(id);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return NextResponse.json({ success: true });
}
