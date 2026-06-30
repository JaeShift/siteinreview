import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMenuStore, addMenuItem } from "@/lib/store";
import type { MenuItem, MenuCategory } from "@/lib/menu-data";

/** GET /api/admin/menu — return full menu */
export async function GET() {
  const menu = getMenuStore();
  return NextResponse.json(menu);
}

/** POST /api/admin/menu — add an item to a category */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !body.category || !body.item) {
    return NextResponse.json({ error: "Missing category or item" }, { status: 400 });
  }
  const { category, item } = body as { category: MenuCategory; item: MenuItem };
  const menu = addMenuItem(category, item);
  revalidatePath("/");
  return NextResponse.json(menu);
}
