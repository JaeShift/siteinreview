import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSinglesStore, saveSinglesStore } from "@/lib/store";
import type { SingleCard } from "@/lib/singles-data";
import { normalizeRarity } from "@/lib/singles-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Partial<SingleCard>[] | null;

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ error: "Expected a non-empty array of cards" }, { status: 400 });
  }

  const existing = getSinglesStore();
  const created: SingleCard[] = [];
  const errors: { index: number; name: string; error: string }[] = [];

  for (let i = 0; i < body.length; i++) {
    const row = body[i];
    if (!row.name?.trim() || !row.set?.trim()) {
      errors.push({ index: i, name: row.name ?? "(unknown)", error: "Missing name or set" });
      continue;
    }
    if (row.price === undefined || row.price === null || isNaN(Number(row.price))) {
      errors.push({ index: i, name: row.name, error: "Missing or invalid price" });
      continue;
    }

    const card: SingleCard = {
      id: `card-${Date.now()}-${i}`,
      name: row.name.trim(),
      set: row.set.trim(),
      setCode: row.setCode ?? row.set.slice(0, 3).toUpperCase(),
      collectorNumber: row.collectorNumber,
      condition: row.condition ?? "NM",
      foil: row.foil ?? false,
      price: Number(row.price),
      quantity: Number(row.quantity ?? 1),
      imageUrl: row.imageUrl ?? "",
      color: row.color ?? "Colorless",
      type: row.type ?? "Creature",
      rarity: normalizeRarity(row.rarity ?? "Common"),
      manaCost: row.manaCost,
      colorIdentity: row.colorIdentity,
      power: row.power,
      toughness: row.toughness,
      cmc: row.cmc !== undefined ? Number(row.cmc) : undefined,
      oracleText: row.oracleText,
      availability: row.availability ?? "In Stock",
      formats: row.formats,
      marketPrice: row.marketPrice !== undefined ? Number(row.marketPrice) : undefined,
      backImageUrl: row.backImageUrl,
      hidden: false,
    };
    created.push(card);
  }

  saveSinglesStore([...existing, ...created]);
  revalidatePath("/card-shop");
  revalidatePath("/card-shop-singles");
  revalidatePath("/admin/inventory");

  return NextResponse.json({ created: created.length, errors });
}
