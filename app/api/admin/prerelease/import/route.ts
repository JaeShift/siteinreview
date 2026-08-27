/**
 * POST /api/admin/prerelease/import
 *
 * Triggered by Vercel Cron (weekly) or manually from the admin UI.
 * Pipeline:
 *   1. Fetch upcoming MTG sets from Scryfall.
 *   2. Cross-reference against drafts already created so we skip known sets.
 *   3. For each new set, scrape the WPN product page to find the media-kit ZIP.
 *   4. Download + extract the ZIP; locate the best prerelease image.
 *   5. Save the image to /public/images/uploads/.
 *   6. Create a "pending" draft for admin review.
 *
 * WPN credentials (optional but needed to reach authenticated pages):
 *   WPN_EMAIL / WPN_PASSWORD  — set in .env.local / Vercel env vars
 *
 * The cron secret header guards the route:
 *   CRON_SECRET — must match Authorization: Bearer <secret>
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { getDrafts, upsertDraft, type PrereleaseDraft } from "@/lib/prerelease-drafts";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // seconds — Vercel Pro / Hobby limit

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "uploads");
const WPN_PRODUCTS_URL = "https://wpn.wizards.com/en/products";

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/** Returns YYYY-MM-DD that is `days` before the given ISO date string */
function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split("T")[0];
}

function slugId(code: string) {
  return `wpn-${code}-${todayStr()}`;
}

/** Sanitise a filename for local storage */
function safeFilename(name: string, ext: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${base}-prerelease.${ext}`;
}

/** Ensure /public/images/uploads/ exists */
function ensureUploadsDir() {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// ── Scryfall ─────────────────────────────────────────────────────────────────

interface ScryfallSet {
  code: string;
  name: string;
  released_at: string;
  set_type: string;
  scryfall_uri: string;
}

async function fetchUpcomingSets(): Promise<ScryfallSet[]> {
  const res = await fetch("https://api.scryfall.com/sets", {
    cache: "no-store",
    headers: { "User-Agent": "KitsuneBrewingCo/1.0 (prerelease-importer; contact@kitsunebeerco.com)" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Scryfall error: ${res.status} — ${body.slice(0, 200)}`);
  }
  const { data } = (await res.json()) as { data: ScryfallSet[] };
  const today = todayStr();
  return data.filter(
    (s) => ["expansion", "core"].includes(s.set_type) && s.released_at >= today
  ).sort((a, b) => a.released_at.localeCompare(b.released_at));
}

// ── WPN scraper ───────────────────────────────────────────────────────────────

/**
 * Logs in to WPN and returns a cookie string if credentials are configured.
 * Returns null when no credentials are set (falls back to Scryfall art).
 */
async function wpnLogin(): Promise<string | null> {
  const email = process.env.WPN_EMAIL;
  const password = process.env.WPN_PASSWORD;
  if (!email || !password) return null;

  // WPN uses an OAuth / form-based login; we POST to their auth endpoint
  // and capture the session cookie from the response headers.
  const loginRes = await fetch("https://wpn.wizards.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  });

  const setCookie = loginRes.headers.get("set-cookie");
  return setCookie ?? null;
}

/**
 * Scrapes WPN product pages looking for a download link that matches
 * "Product Shots" or "Prerelease Social Media Assets".
 * Returns the first matching ZIP URL, or null if not found.
 */
async function findWpnMediaZipUrl(
  setName: string,
  cookie: string | null
): Promise<string | null> {
  const headers: HeadersInit = {
    "User-Agent": "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)",
    Accept: "text/html,application/xhtml+xml",
  };
  if (cookie) headers["Cookie"] = cookie;

  // Fetch the main products listing
  const listRes = await fetch(WPN_PRODUCTS_URL, { headers });
  if (!listRes.ok) return null;
  const listHtml = await listRes.text();

  // Find a product page link whose text roughly matches the set name
  // WPN product slugs tend to be kebab-case set names
  const slugGuess = setName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const productLinkRe = new RegExp(
    `href="([^"]*(?:${escapeRegex(slugGuess)}|${escapeRegex(setName.toLowerCase())})[^"]*)"`,
    "i"
  );
  const productMatch = listHtml.match(productLinkRe);
  if (!productMatch) return null;

  const productUrl = productMatch[1].startsWith("http")
    ? productMatch[1]
    : `https://wpn.wizards.com${productMatch[1]}`;

  // Fetch the individual product page
  const productRes = await fetch(productUrl, { headers });
  if (!productRes.ok) return null;
  const productHtml = await productRes.text();

  // Look for ZIP links labelled "Product Shots" or "Prerelease Social Media"
  const zipRe = /href="([^"]+\.zip)"/gi;
  const labelRe = /(?:product\s*shots?|prerelease\s*social\s*media|media\s*kit)/i;

  // Walk through the HTML looking for a ZIP link near a matching label
  let match: RegExpExecArray | null;
  const candidates: string[] = [];
  while ((match = zipRe.exec(productHtml)) !== null) {
    const surroundingText = productHtml.slice(
      Math.max(0, match.index - 300),
      match.index + match[0].length + 300
    );
    if (labelRe.test(surroundingText)) {
      const url = match[1].startsWith("http") ? match[1] : `https://wpn.wizards.com${match[1]}`;
      candidates.push(url);
    }
  }

  return candidates[0] ?? null;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── ZIP → image ───────────────────────────────────────────────────────────────

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
// Prefer filenames that mention "prerelease", "key art", "banner", "hero"
const PREFERRED_RE = /prerelease|keyart|key.art|banner|hero/i;

/**
 * Downloads a ZIP from `url`, extracts it in memory, finds the best image,
 * saves it to /public/images/uploads/, and returns the public URL.
 */
async function downloadZipAndExtractImage(
  zipUrl: string,
  setName: string,
  cookie: string | null
): Promise<string | null> {
  ensureUploadsDir();

  const headers: HeadersInit = { "User-Agent": "Mozilla/5.0" };
  if (cookie) headers["Cookie"] = cookie;

  const res = await fetch(zipUrl, { headers });
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  // Score each entry: prefer prerelease/keyart names, larger files win ties
  let best: { entry: AdmZip.IZipEntry; score: number } | null = null;
  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;
    const score =
      (PREFERRED_RE.test(entry.name) ? 1000 : 0) + entry.header.size;
    if (!best || score > best.score) best = { entry, score };
  }

  if (!best) return null;

  const ext = path.extname(best.entry.name).toLowerCase().slice(1);
  const filename = safeFilename(setName, ext);
  const dest = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(dest, best.entry.getData());

  return `/images/uploads/${filename}`;
}

// ── Fallback: Scryfall art crop ────────────────────────────────────────────

async function fetchScryfallArtCrop(code: string): Promise<string> {
  const headers = { "User-Agent": "KitsuneBrewingCo/1.0 (prerelease-importer; contact@kitsunebeerco.com)" };
  for (const rarity of ["m", "r"]) {
    try {
      const res = await fetch(
        `https://api.scryfall.com/cards/search?q=set:${code}+rarity:${rarity}&order=released&dir=asc&page=1`,
        { cache: "no-store", headers }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const card = data.data?.[0];
      const url =
        card?.image_uris?.art_crop ??
        card?.card_faces?.[0]?.image_uris?.art_crop;
      if (url) return url;
    } catch { /* try next rarity */ }
  }
  return "";
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Verify cron secret (or allow admin cookie — checked via header)
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
    // 1. Get upcoming sets from Scryfall
    const sets = await fetchUpcomingSets();
    log.push(`Scryfall: found ${sets.length} upcoming sets`);

    // 2. Get existing drafts so we don't re-import the same set
    const existingCodes = new Set(getDrafts().map((d) => d.scryfallCode));

    // 3. WPN login (no-op if no credentials)
    const cookie = await wpnLogin();
    log.push(cookie ? "WPN: logged in" : "WPN: no credentials — will fall back to Scryfall art");

    // 4. Process each new set
    for (const set of sets) {
      if (existingCodes.has(set.code)) {
        skipped.push(set.code);
        continue;
      }

      log.push(`Processing: ${set.name} (${set.code})`);

      // Try WPN media ZIP
      let imageUrl = "";
      let imageSourceUrl = "";

      if (cookie) {
        try {
          const zipUrl = await findWpnMediaZipUrl(set.name, cookie);
          if (zipUrl) {
            log.push(`  WPN ZIP found: ${zipUrl}`);
            imageSourceUrl = zipUrl;
            const local = await downloadZipAndExtractImage(zipUrl, set.name, cookie);
            if (local) {
              imageUrl = local;
              log.push(`  Extracted image → ${local}`);
            }
          } else {
            log.push(`  WPN: no media ZIP found for this set`);
          }
        } catch (err) {
          log.push(`  WPN error: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      // Fallback to Scryfall art crop
      if (!imageUrl) {
        imageUrl = await fetchScryfallArtCrop(set.code);
        imageSourceUrl = imageUrl;
        log.push(`  Fallback: Scryfall art crop ${imageUrl ? "found" : "not found"}`);
      }

      const draft: PrereleaseDraft = {
        id: slugId(set.code),
        createdAt: new Date().toISOString(),
        source: cookie && imageUrl.startsWith("/images") ? "wpn" : "scryfall",
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

// Allow GET for manual "run now" from admin
export async function GET(request: NextRequest) {
  return POST(request);
}
