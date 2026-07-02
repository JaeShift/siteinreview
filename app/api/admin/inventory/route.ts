import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSinglesStore, addSingle } from "@/lib/store";
import type { SingleCard } from "@/lib/singles-data";
import { normalizeRarity } from "@/lib/singles-data";

export async function GET() {
  return NextResponse.json(getSinglesStore());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Partial<SingleCard> | null;

  if (!body?.name || !body?.set || !body?.price === undefined || !body?.quantity === undefined) {
    return NextResponse.json({ error: "Missing required fields: name, set, price, quantity" }, { status: 400 });
  }

  const card: SingleCard = {
    id: body.id ?? `card-${Date.now()}`,
    name: body.name,
    set: body.set,
    setCode: body.setCode ?? body.set.slice(0, 3).toUpperCase(),
    collectorNumber: body.collectorNumber,
    condition: body.condition ?? "NM",
    foil: body.foil ?? false,
    price: Number(body.price),
    quantity: Number(body.quantity),
    imageUrl: body.imageUrl ?? "",
    color: body.color ?? "Colorless",
    type: body.type ?? "Creature",
    rarity: normalizeRarity(body.rarity ?? "Common"),
    manaCost: body.manaCost,
    colorIdentity: body.colorIdentity,
    power: body.power,
    toughness: body.toughness,
    cmc: body.cmc !== undefined ? Number(body.cmc) : undefined,
    oracleText: body.oracleText,
    availability: body.availability ?? "In Stock",
    formats: body.formats,
  };

  const cards = addSingle(card);
  revalidatePath("/card-shop");
  revalidatePath("/card-shop-singles");
  revalidatePath("/admin/inventory");
  return NextResponse.json(card, { status: 201 });
}
