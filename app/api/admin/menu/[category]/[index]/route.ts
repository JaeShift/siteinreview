import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateMenuItem, deleteMenuItem } from "@/lib/store";
import type { MenuItem, MenuCategory } from "@/lib/menu-data";

interface Params {
  params: { category: string; index: string };
}

/** PUT /api/admin/menu/[category]/[index] — update an item */
export async function PUT(request: NextRequest, { params }: Params) {
  const category = decodeURIComponent(params.category) as MenuCategory;
  const index = parseInt(params.index, 10);
  const item = await request.json().catch(() => null) as MenuItem | null;
  if (!item || isNaN(index)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const menu = updateMenuItem(category, index, item);
  revalidatePath("/");
  return NextResponse.json(menu);
}

/** DELETE /api/admin/menu/[category]/[index] — delete an item */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const category = decodeURIComponent(params.category) as MenuCategory;
  const index = parseInt(params.index, 10);
  if (isNaN(index)) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400 });
  }
  const menu = deleteMenuItem(category, index);
  revalidatePath("/");
  return NextResponse.json(menu);
}
