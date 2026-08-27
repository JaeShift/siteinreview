/**
 * Storage for auto-imported pre-release page drafts.
 * Drafts are created by the WPN importer and must be approved by an admin
 * before they go live. They live in data/prerelease-drafts.json.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DRAFTS_FILE = path.join(DATA_DIR, "prerelease-drafts.json");

export interface PrereleaseDraft {
  id: string;
  createdAt: string;        // ISO timestamp
  source: "wpn" | "scryfall" | "manual";
  scryfallCode: string;
  setName: string;
  releaseDate: string;      // official WotC release date (YYYY-MM-DD)
  prereleaseDate: string;   // calculated prerelease weekend date
  imageUrl: string;         // local path e.g. /images/uploads/tarkir-pr.png
  imageSourceUrl: string;   // original URL the image came from
  tagline: string;
  status: "pending" | "approved" | "rejected";
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getDrafts(): PrereleaseDraft[] {
  ensureDir();
  if (!fs.existsSync(DRAFTS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DRAFTS_FILE, "utf-8")) as PrereleaseDraft[];
  } catch {
    return [];
  }
}

export function saveDrafts(drafts: PrereleaseDraft[]): void {
  ensureDir();
  fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts, null, 2), "utf-8");
}

export function upsertDraft(draft: PrereleaseDraft): PrereleaseDraft[] {
  const drafts = getDrafts();
  const idx = drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) drafts[idx] = draft;
  else drafts.unshift(draft);
  saveDrafts(drafts);
  return drafts;
}

export function updateDraftStatus(
  id: string,
  status: PrereleaseDraft["status"]
): PrereleaseDraft | null {
  const drafts = getDrafts();
  const draft = drafts.find((d) => d.id === id);
  if (!draft) return null;
  draft.status = status;
  saveDrafts(drafts);
  return draft;
}

export function getPendingDrafts(): PrereleaseDraft[] {
  return getDrafts().filter((d) => d.status === "pending");
}
