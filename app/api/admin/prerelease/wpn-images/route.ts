/**
 * GET /api/admin/prerelease/wpn-images?releaseDate=YYYY-MM-DD
 *
 * Finds the WPN product page for a set by release date, then returns:
 *   - All Contentful CDN image URLs from that page
 *   - The meta description (used as a draft description)
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WPN_PRODUCTS_URL = "https://wpn.wizards.com/en/products";
const BOT_UA = "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)";

// ── WPN scraper (shared with cron importer) ────────────────────────────────

function parseWpnProductCards(html: string): { url: string; releaseDate: string }[] {
  const products: { url: string; releaseDate: string }[] = [];
  const cardSections = html.split(/_card_/);

  for (const section of cardSections) {
    const hrefMatch = section.match(/href="((?:https:\/\/wpn\.wizards\.com)?\/(?:en\/)?products\/[^"]+)"/);
    const dateMatch = section.match(/Release Date\s+(\w+\s+\d+,?\s+\d{4})/i);
    if (!hrefMatch || !dateMatch) continue;

    const rawUrl = hrefMatch[1];
    const url = rawUrl.startsWith("http") ? rawUrl : `https://wpn.wizards.com${rawUrl}`;
    if (url.includes("?type=")) continue;

    const d = new Date(dateMatch[1].replace(",", ""));
    if (isNaN(d.getTime())) continue;
    const releaseDate = d.toISOString().split("T")[0];

    if (!products.find((p) => p.url === url)) products.push({ url, releaseDate });
  }

  return products;
}

async function findWpnProductPage(releaseDate: string): Promise<string | null> {
  const res = await fetch(WPN_PRODUCTS_URL, { cache: "no-store", headers: { "User-Agent": BOT_UA } });
  if (!res.ok) return null;
  const html = await res.text();
  const cards = parseWpnProductCards(html);
  return cards.find((p) => p.releaseDate === releaseDate)?.url ?? null;
}

async function fetchWpnPageData(productUrl: string): Promise<{ images: string[]; description: string }> {
  const res = await fetch(productUrl, { cache: "no-store", headers: { "User-Agent": BOT_UA } });
  if (!res.ok) return { images: [], description: "" };
  const html = await res.text();

  // og:image first
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  const ogImage = ogMatch ? (ogMatch[1].startsWith("//") ? `https:${ogMatch[1]}` : ogMatch[1]) : null;

  // Meta description
  const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i)
    ?? html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);
  const description = descMatch ? descMatch[1].trim() : "";

  // All Contentful CDN images
  const seen = new Set<string>();
  const images: string[] = [];
  if (ogImage) { seen.add(ogImage); images.push(ogImage); }

  const srcRe = /(?:src|srcset|content)="((?:https:)?\/\/images\.ctfassets\.net\/[^"?]+)(?:\?[^"]*)?"/g;
  let m: RegExpExecArray | null;
  while ((m = srcRe.exec(html)) !== null) {
    const raw = m[1];
    const url = raw.startsWith("//") ? `https:${raw}` : raw;
    if (/logo|icon|WPN_Full|WPN_wizard|hasbro|esrb/i.test(url)) continue;
    if (!seen.has(url)) { seen.add(url); images.push(url); }
  }

  return { images, description };
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const releaseDate = searchParams.get("releaseDate");
  if (!releaseDate) return NextResponse.json({ error: "releaseDate required" }, { status: 400 });

  try {
    const productUrl = await findWpnProductPage(releaseDate);
    if (!productUrl) {
      return NextResponse.json({ images: [], description: "", productUrl: null });
    }

    const { images, description } = await fetchWpnPageData(productUrl);
    return NextResponse.json({ images, description, productUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
