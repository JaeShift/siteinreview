import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMenuStore, saveMenuStore } from "@/lib/store";
import type { MenuItem, MenuCategory } from "@/lib/menu-data";

/** POST /api/admin/menu/reorder — replace a category's item order */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.category || !Array.isArray(body?.items)) {
    return NextResponse.json({ error: "Missing category or items" }, { status: 400 });
  }
  const { category, items } = body as { category: MenuCategory; items: MenuItem[] };
  const menu = getMenuStore();
  menu[category] = items;
  saveMenuStore(menu);
  revalidatePath("/");
  return NextResponse.json(menu);
}
