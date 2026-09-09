import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { addMerchandise, getMerchandiseStore } from "@/lib/store";
import type {
  MerchandiseCategory,
  MerchandiseProduct,
} from "@/lib/merchandise-data";

const categories: MerchandiseCategory[] = ["Apparel", "Drinkware", "Accessories", "Other"];

export async function GET() {
  return NextResponse.json(getMerchandiseStore());
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<MerchandiseProduct> | null;
  if (!body?.name || body.price === undefined || body.quantity === undefined) {
    return NextResponse.json(
      { error: "Name, price, and quantity are required." },
      { status: 400 }
    );
  }

  const category = categories.includes(body.category as MerchandiseCategory)
    ? (body.category as MerchandiseCategory)
    : "Other";
  const product: MerchandiseProduct = {
    id: body.id ?? `merch-${Date.now()}`,
    name: body.name.trim(),
    description: body.description?.trim() ?? "",
    category,
    price: Math.max(0, Number(body.price)),
    quantity: Math.max(0, Math.floor(Number(body.quantity))),
    imageUrl: body.imageUrl?.trim() ?? "",
    sizes: Array.isArray(body.sizes) ? body.sizes.map(String).filter(Boolean) : [],
    active: body.active ?? true,
  };

  addMerchandise(product);
  revalidatePath("/shop");
  revalidatePath("/admin/inventory");
  return NextResponse.json(product, { status: 201 });
}
