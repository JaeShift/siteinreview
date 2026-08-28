/**
 * GET /api/admin/prerelease/wpn-images?releaseDate=YYYY-MM-DD&setName=...
 *
 * Finds the WPN product page for a set, then returns:
 *   - All Contentful CDN image URLs from that page
 *   - The "More About" marketing copy from the product page
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WPN_PRODUCTS_URL = "https://wpn.wizards.com/en/products";
const BOT_UA = "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)";

// ── Product listing scraper ────────────────────────────────────────────────

function parseWpnProductCards(html: string): { url: string; name: string; releaseDate: string }[] {
  const products: { url: string; name: string; releaseDate: string }[] = [];
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

    const nameMatch = section.match(/<a[^>]+\/products\/[^"]+[^>]*>([^<]+)<\/a>/);
    const name = nameMatch
      ? nameMatch[1].replace(/[®™]/g, "").replace(/^Magic:\s*The\s*Gathering\s*[|·]\s*/i, "").trim()
      : "";

    if (!products.find((p) => p.url === url)) products.push({ url, name, releaseDate });
  }

  return products;
}

async function getWpnProducts(): Promise<{ url: string; name: string; releaseDate: string }[]> {
  const res = await fetch(WPN_PRODUCTS_URL, { cache: "no-store", headers: { "User-Agent": BOT_UA } });
  if (!res.ok) return [];
  return parseWpnProductCards(await res.text());
}

async function findWpnProductPage(releaseDate: string): Promise<string | null> {
  const products = await getWpnProducts();
  return products.find((p) => p.releaseDate === releaseDate)?.url ?? null;
}

async function findWpnProductPageByName(setName: string): Promise<string | null> {
  const products = await getWpnProducts();
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(setName);
  return (
    products.find((p) => norm(p.name) === target)?.url ??
    products.find((p) => norm(p.name).includes(target) || target.includes(norm(p.name)))?.url ??
    null
  );
}

// ── Product page data fetcher ──────────────────────────────────────────────

function cleanHtmlText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWpnPageData(productUrl: string): Promise<{ images: string[]; description: string }> {
  const res = await fetch(productUrl, { cache: "no-store", headers: { "User-Agent": BOT_UA } });
  if (!res.ok) return { images: [], description: "" };
  const html = await res.text();

  // ── Images ───────────────────────────────────────────────────────────────
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
    ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
  const ogImage = ogMatch ? (ogMatch[1].startsWith("//") ? `https:${ogMatch[1]}` : ogMatch[1]) : null;

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

  // Target the set-specific paragraph directly beneath "More about [Set Name]".
  // This avoids accidentally importing generic WPN or product-pack copy.
  const moreAboutMatch = html.match(/More\s+about[\s\S]{0,1500}?<p[^>]*>([\s\S]*?)<\/p>/i);
  let description = moreAboutMatch ? cleanHtmlText(moreAboutMatch[1]) : "";

  // WPN also publishes the set synopsis as its Open Graph description.
  if (!description) {
    const ogDescriptionMatch =
      html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ??
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);
    description = ogDescriptionMatch ? cleanHtmlText(ogDescriptionMatch[1]) : "";
  }

  return { images, description };
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const releaseDate = searchParams.get("releaseDate");
  const setName = searchParams.get("setName") ?? "";
  if (!releaseDate) return NextResponse.json({ error: "releaseDate required" }, { status: 400 });

  try {
    let productUrl = await findWpnProductPage(releaseDate);
    if (!productUrl && setName) productUrl = await findWpnProductPageByName(setName);

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
