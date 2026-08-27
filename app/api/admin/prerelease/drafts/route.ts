/**
 * GET  /api/admin/prerelease/drafts        — list all drafts
 * PATCH /api/admin/prerelease/drafts       — update draft (select image, approve, reject)
 * DELETE /api/admin/prerelease/drafts?id=  — delete a draft
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getDrafts, updateDraftStatus, saveDrafts, upsertDraft } from "@/lib/prerelease-drafts";
import { savePrereleaseConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "uploads");

function safeFilename(name: string, ext: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${base}-prerelease.${ext}`;
}

/** Download a remote image URL and save it locally. Returns the local public path. */
async function downloadImage(remoteUrl: string, setName: string): Promise<string> {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const res = await fetch(remoteUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KitsuneBrewingBot/1.0)" },
  });
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "image/png";
  const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg"
    : contentType.includes("webp") ? "webp"
    : "png";

  // Use a unique filename based on the URL hash to avoid collisions across images
  const urlHash = Buffer.from(remoteUrl).toString("base64").replace(/[^a-z0-9]/gi, "").slice(0, 8);
  const base = safeFilename(setName, ext).replace("-prerelease.", `-prerelease-${urlHash}.`);
  const dest = path.join(IMAGES_DIR, base);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return `/images/uploads/${base}`;
}

export async function GET() {
  return NextResponse.json(getDrafts());
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    id?: string;
    // Set status to approve/reject, or omit to just update imageUrl
    status?: "approved" | "rejected" | "pending";
    // Select a specific image from imageOptions
    imageUrl?: string;
    // Fields used when approving
    time?: string;
    tagline?: string;
    description?: string;
    eventSlug?: string;
  } | null;

  if (!body?.id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const drafts = getDrafts();
  const draft = drafts.find((d) => d.id === body.id);
  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  // Update selected image without changing status
  if (body.imageUrl && !body.status) {
    draft.imageUrl = body.imageUrl;
    upsertDraft(draft);
    return NextResponse.json(draft);
  }

  if (!body.status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const updated = updateDraftStatus(body.id, body.status);
  if (!updated) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  // When approving, download the selected image locally if it's still a remote URL
  if (body.status === "approved") {
    let finalImageUrl = updated.imageUrl;
    if (finalImageUrl && finalImageUrl.startsWith("http")) {
      try {
        finalImageUrl = await downloadImage(finalImageUrl, updated.setName);
        updated.imageUrl = finalImageUrl;
        upsertDraft(updated);
      } catch { /* keep remote URL if download fails */ }
    }

    savePrereleaseConfig({
      active: true,
      setName: updated.setName,
      tagline: body.tagline ?? updated.tagline ?? "",
      date: updated.prereleaseDate,
      time: body.time ?? "",
      description: body.description ?? "",
      imageUrl: finalImageUrl,
      eventSlug: body.eventSlug ?? "",
    });
    revalidatePath("/magic-mamas-pre-release");
    revalidatePath("/admin/events");
  }

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const drafts = getDrafts().filter((d) => d.id !== id);
  saveDrafts(drafts);
  return NextResponse.json({ ok: true });
}
