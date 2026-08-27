/**
 * POST /api/admin/prerelease/import
 *
 * Triggered by Vercel Cron (weekly) or manually from the admin UI.
 * Pipeline:
 *   1. Fetch upcoming MTG sets from Scryfall.
 *   2. Cross-reference against drafts already created so we skip known sets.
 *   3. Scrape the public WPN products listing to find each set's product page.
 *   4. Fetch the product page og:image (official Contentful CDN banner art).
 *   5. Download and save the image to /public/images/uploads/.
 *   6. Create a "pending" draft for admin review.
 *
 * No WPN credentials required — the products listing and product pages are public.
 *
 * The cron secret header guards the route:
 *   CRON_SECRET — must match Authorization: Bearer <secret>
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDrafts, upsertDraft, type PrereleaseDraft } from "@/lib/prerelease-drafts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "uploads");
const WPN_PRODUCTS_URL = "https://wpn.wizards.com/en/products";
const SCRYFALL_UA = "KitsuneBrewingCo/1.0 (prerelease-importer; contact@kitsunebeerco.com)";

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split("T")[0];
}

function slugId(code: string) {
  return `wpn-${code}-${todayStr()}`;
}

function safeFilename(name: string, ext: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${base}-prerelease.${ext}`;
}

function ensureUploadsDir() {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// ── Scryfall ─────────────────────────────────────────────────────────────────

interface ScryfallSet {
  code: string;
  name: string;
  released_at: string;
  set_type: string;
}

async function fetchUpcomingSets(): Promise<ScryfallSet[]> {
  const res = await fetch("https://api.scryfall.com/sets", {
    cache: "no-store",
    headers: { "User-Agent": SCRYFALL_UA },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Scryfall error: ${res.status} — ${body.slice(0, 200)}`);
  }
  const { data } = (await res.json()) as { data: ScryfallSet[] };
  const today = todayStr();
  return data
    .filter((s) => ["expansion", "core"].includes(s.set_type) && s.released_at >= today)
    .sort((a, b) => a.released_at.localeCompare(b.released_at));
}

// ── WPN product scraper ───────────────────────────────────────────────────────

interface WpnProduct {
  url: string;
  name: string;
  releaseDate: string; // YYYY-MM-DD
}

/**
 * Parse the WPN products listing HTML to extract product cards.
 * Products use Nuxt SSR so the data is in the initial HTML.
 */
function parseWpnProductCards(html: string): WpnProduct[] {
  const products: WpnProduct[] = [];

  // Each card: <a href="…">…name…</a> … <em class="…">Release Date Mon DD, YYYY</em>
  // Walk through href + name + release date together via card boundaries
  const cardRe = /<div class="[^"]*_card_[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  let cardMatch: RegExpExecArray | null;

  while ((cardMatch = cardRe.exec(html)) !== null) {
    const card = cardMatch[1];

    // Extract href and link text (set name)
    const hrefMatch = card.match(/href="([^"]+)"/);
    const nameMatch = card.match(/<a[^>]+>([^<]+)<\/a>/);
    // Release date like "Release Date Oct 2, 2026"
    const dateMatch = card.match(/Release Date\s+(\w+ \d+,\s+\d{4})/i);

    if (!hrefMatch || !nameMatch || !dateMatch) continue;

    const rawUrl = hrefMatch[1];
    const url = rawUrl.startsWith("http") ? rawUrl : `https://wpn.wizards.com${rawUrl}`;
    const name = nameMatch[1].replace(/®|™/g, "").replace(/Magic: The Gathering\s*\|\s*/i, "").trim();

    // Parse "Oct 2, 2026" → "2026-10-02"
    const d = new Date(dateMatch[1]);
    if (isNaN(d.getTime())) continue;
    const releaseDate = d.toISOString().split("T")[0];

    products.push({ url, name, releaseDate });
  }

  return products;
}

/** Fetch the WPN products listing and find the card matching a given release date. */
async function findWpnProductPage(releaseDate: string): Promise<string | null> {
  const res = await fetch(WPN_PRODUCTS_URL, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const products = parseWpnProductCards(html);
  const match = products.find((p) => p.releaseDate === releaseDate);
  return match?.url ?? null;
}

/**
 * Fetch a WPN product page and extract the og:image URL.
 * The og:image is the official set banner art served from Contentful CDN.
 */
async function fetchWpnOgImage(productUrl: string): Promise<string | null> {
  const res = await fetch(productUrl, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)" },
  });
  if (!res.ok) return null;
  const html = await res.text();

  // og:image content — may start with // (protocol-relative)
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  if (!ogMatch) return null;

  const raw = ogMatch[1];
  return raw.startsWith("//") ? `https:${raw}` : raw;
}

// ── Download image and save locally ──────────────────────────────────────────

async function downloadAndSaveImage(imageUrl: string, setName: string): Promise<string | null> {
  ensureUploadsDir();

  const res = await fetch(imageUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)" },
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") ?? "image/png";
  const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg"
    : contentType.includes("webp") ? "webp"
    : "png";

  const filename = safeFilename(setName, ext);
  const dest = path.join(IMAGES_DIR, filename);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);

  return `/images/uploads/${filename}`;
}

// ── Fallback: Scryfall art crop ───────────────────────────────────────────────

async function fetchScryfallArtCrop(code: string): Promise<string> {
  const headers = { "User-Agent": SCRYFALL_UA };
  for (const rarity of ["m", "r"]) {
    try {
      const res = await fetch(
        `https://api.scryfall.com/cards/search?q=set:${code}+rarity:${rarity}&order=released&dir=asc&page=1`,
        { cache: "no-store", headers }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const card = data.data?.[0];
      const url = card?.image_uris?.art_crop ?? card?.card_faces?.[0]?.image_uris?.art_crop;
      if (url) return url;
    } catch { /* try next rarity */ }
  }
  return "";
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const log: string[] = [];
  const created: PrereleaseDraft[] = [];
  const skipped: string[] = [];

  try {
    const sets = await fetchUpcomingSets();
    log.push(`Scryfall: found ${sets.length} upcoming sets`);

    const existingCodes = new Set(getDrafts().map((d) => d.scryfallCode));

    for (const set of sets) {
      if (existingCodes.has(set.code)) {
        skipped.push(set.code);
        continue;
      }

      log.push(`Processing: ${set.name} (${set.code}) — release ${set.released_at}`);

      let imageUrl = "";
      let imageSourceUrl = "";
      let source: PrereleaseDraft["source"] = "scryfall";

      // 1. Try WPN official banner (public, no login needed)
      try {
        const productPageUrl = await findWpnProductPage(set.released_at);
        if (productPageUrl) {
          log.push(`  WPN product page: ${productPageUrl}`);
          const ogImage = await fetchWpnOgImage(productPageUrl);
          if (ogImage) {
            log.push(`  WPN og:image: ${ogImage}`);
            imageSourceUrl = ogImage;
            const local = await downloadAndSaveImage(ogImage, set.name);
            if (local) {
              imageUrl = local;
              source = "wpn";
              log.push(`  Saved WPN image → ${local}`);
            }
          } else {
            log.push(`  WPN: no og:image found on product page`);
          }
        } else {
          log.push(`  WPN: no product page found for release date ${set.released_at}`);
        }
      } catch (err) {
        log.push(`  WPN error: ${err instanceof Error ? err.message : String(err)}`);
      }

      // 2. Fallback: Scryfall art crop (remote URL, not downloaded)
      if (!imageUrl) {
        const artCrop = await fetchScryfallArtCrop(set.code);
        imageUrl = artCrop;
        imageSourceUrl = artCrop;
        source = "scryfall";
        log.push(`  Fallback: Scryfall art crop ${artCrop ? "found" : "not found"}`);
      }

      const draft: PrereleaseDraft = {
        id: slugId(set.code),
        createdAt: new Date().toISOString(),
        source,
        scryfallCode: set.code,
        setName: set.name,
        releaseDate: set.released_at,
        prereleaseDate: subtractDays(set.released_at, 7),
        imageUrl,
        imageSourceUrl,
        tagline: "",
        status: "pending",
      };

      upsertDraft(draft);
      created.push(draft);
      log.push(`  Draft created: ${draft.id}`);
    }

    return NextResponse.json({ ok: true, created: created.length, skipped: skipped.length, log });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), log },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
