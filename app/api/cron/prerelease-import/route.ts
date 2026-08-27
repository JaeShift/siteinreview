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
 * Pairs product page URLs with release dates by extracting them in document order.
 */
function parseWpnProductCards(html: string): WpnProduct[] {
  const products: WpnProduct[] = [];

  // Find all product card blocks — each contains an anchor and a release date em
  // Split on card boundaries using the card class as delimiter
  const cardSections = html.split(/_card_/);

  for (const section of cardSections) {
    // Extract the first href pointing to a /products/ page
    const hrefMatch = section.match(/href="((?:https:\/\/wpn\.wizards\.com)?\/(?:en\/)?products\/[^"]+)"/);
    // Extract release date like "Release Date Oct 2, 2026"
    const dateMatch = section.match(/Release Date\s+(\w+\s+\d+,?\s+\d{4})/i);

    if (!hrefMatch || !dateMatch) continue;

    const rawUrl = hrefMatch[1];
    const url = rawUrl.startsWith("http") ? rawUrl : `https://wpn.wizards.com${rawUrl}`;

    // Skip non-product pages (like the /products filter pages)
    if (url.includes("?type=")) continue;

    // Parse "Oct 2, 2026" or "Oct 2 2026" → "2026-10-02"
    const d = new Date(dateMatch[1].replace(",", ""));
    if (isNaN(d.getTime())) continue;
    const releaseDate = d.toISOString().split("T")[0];

    // Extract set name from anchor text inside this section
    const nameMatch = section.match(/<a[^>]+\/products\/[^"]+[^>]*>([^<]+)<\/a>/);
    const name = nameMatch
      ? nameMatch[1].replace(/[®™]/g, "").replace(/^Magic:\s*The\s*Gathering\s*[|·]\s*/i, "").trim()
      : "";

    if (!products.find((p) => p.url === url)) {
      products.push({ url, name, releaseDate });
    }
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
 * Fetch a WPN product page and extract:
 * - og:image (primary banner)
 * - all unique Contentful CDN image URLs found in the HTML
 * Returns { ogImage, allImages } where allImages is deduplicated and sorted
 * with the og:image first.
 */
async function fetchWpnImages(productUrl: string): Promise<{ ogImage: string | null; allImages: string[] }> {
  const res = await fetch(productUrl, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)" },
  });
  if (!res.ok) return { ogImage: null, allImages: [] };
  const html = await res.text();

  // Extract og:image
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  const ogImage = ogMatch
    ? (ogMatch[1].startsWith("//") ? `https:${ogMatch[1]}` : ogMatch[1])
    : null;

  // Extract ALL Contentful CDN image URLs (images.ctfassets.net/...)
  const seen = new Set<string>();
  const allImages: string[] = [];

  // Add og:image first
  if (ogImage) { seen.add(ogImage); allImages.push(ogImage); }

  const srcRe = /(?:src|srcset|content)="((?:https:)?\/\/images\.ctfassets\.net\/[^"?]+)(?:\?[^"]*)?"/g;
  let m: RegExpExecArray | null;
  while ((m = srcRe.exec(html)) !== null) {
    const raw = m[1];
    const url = raw.startsWith("//") ? `https:${raw}` : raw;
    // Skip tiny icons/logos (contain "logo", "icon", or are very small by path hint)
    if (/logo|icon|WPN_Full|WPN_wizard|hasbro|esrb/i.test(url)) continue;
    // Strip query params for dedup, then store clean URL
    if (!seen.has(url)) { seen.add(url); allImages.push(url); }
  }

  return { ogImage, allImages };
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
  // In production, Vercel automatically sends Authorization: Bearer <CRON_SECRET>
  // with cron job requests. Only enforce this check in production.
  if (process.env.NODE_ENV === "production") {
    const cronSecret = (process.env.CRON_SECRET ?? "").trim();
    if (cronSecret) {
      const auth = request.headers.get("authorization") ?? "";
      if (auth !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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
      let imageOptions: string[] = [];
      let source: PrereleaseDraft["source"] = "scryfall";

      // 1. Try WPN official images (public, no login needed)
      try {
        const productPageUrl = await findWpnProductPage(set.released_at);
        if (productPageUrl) {
          log.push(`  WPN product page: ${productPageUrl}`);
          const { ogImage, allImages } = await fetchWpnImages(productPageUrl);
          if (allImages.length > 0) {
            imageOptions = allImages;
            imageUrl = ogImage ?? allImages[0];
            imageSourceUrl = imageUrl;
            source = "wpn";
            log.push(`  WPN images found: ${allImages.length} (og:image = ${ogImage ?? "none"})`);
          } else {
            log.push(`  WPN: no images found on product page`);
          }
        } else {
          log.push(`  WPN: no product page found for release date ${set.released_at}`);
        }
      } catch (err) {
        log.push(`  WPN error: ${err instanceof Error ? err.message : String(err)}`);
      }

      // 2. Fallback: Scryfall art crop (remote URL)
      if (!imageUrl) {
        const artCrop = await fetchScryfallArtCrop(set.code);
        imageUrl = artCrop;
        imageSourceUrl = artCrop;
        imageOptions = artCrop ? [artCrop] : [];
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
        imageOptions,
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
