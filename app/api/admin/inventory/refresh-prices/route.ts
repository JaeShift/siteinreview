import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSinglesStore, saveSinglesStore } from "@/lib/store";

const DELAY_MS = 120; // stay well under Scryfall's 10 req/s limit

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchScryfallPrice(
  name: string,
  setCode: string,
  collectorNumber?: string,
  foil?: boolean
): Promise<number | null> {
  try {
    let url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&set=${setCode.toLowerCase()}`;
    if (collectorNumber) {
      // Prefer collector number lookup — most precise
      url = `https://api.scryfall.com/cards/${setCode.toLowerCase()}/${collectorNumber}`;
    }
    const res = await fetch(url, { headers: { "User-Agent": "KitsuneBrewingCo/1.0" } });
    if (!res.ok) return null;
    const card = await res.json();
    const raw = foil ? (card.prices?.usd_foil ?? card.prices?.usd) : (card.prices?.usd ?? card.prices?.usd_foil);
    return raw ? parseFloat(raw) : null;
  } catch {
    return null;
  }
}

export async function POST() {
  const cards = getSinglesStore();
  let updated = 0;
  let failed = 0;

  const refreshed = [...cards];

  for (let i = 0; i < refreshed.length; i++) {
    const card = refreshed[i];
    await sleep(DELAY_MS);
    const price = await fetchScryfallPrice(card.name, card.setCode, card.collectorNumber, card.foil);
    if (price !== null) {
      refreshed[i] = { ...card, marketPrice: price };
      updated++;
    } else {
      failed++;
    }
  }

  saveSinglesStore(refreshed);
  revalidatePath("/admin/inventory");
  revalidatePath("/card-shop");
  revalidatePath("/card-shop-singles");

  return NextResponse.json({ updated, failed, total: cards.length });
}
