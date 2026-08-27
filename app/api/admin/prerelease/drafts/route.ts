/**
 * GET  /api/admin/prerelease/drafts        — list all drafts
 * PATCH /api/admin/prerelease/drafts       — update draft status (approve/reject)
 * DELETE /api/admin/prerelease/drafts?id=  — delete a draft
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDrafts, updateDraftStatus, saveDrafts } from "@/lib/prerelease-drafts";
import { savePrereleaseConfig } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getDrafts());
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    id?: string;
    status?: "approved" | "rejected" | "pending";
    // Optional: override fields when approving
    time?: string;
    tagline?: string;
    description?: string;
    eventSlug?: string;
  } | null;

  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const draft = updateDraftStatus(body.id, body.status);
  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });

  // When approving, promote the draft to the live prerelease config
  if (body.status === "approved") {
    savePrereleaseConfig({
      active: true,
      setName: draft.setName,
      tagline: body.tagline ?? draft.tagline ?? "",
      date: draft.prereleaseDate,
      time: body.time ?? "",
      description: body.description ?? "",
      imageUrl: draft.imageUrl,
      eventSlug: body.eventSlug ?? "",
    });
    revalidatePath("/magic-mamas-pre-release");
    revalidatePath("/admin/events");
  }

  return NextResponse.json(draft);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const drafts = getDrafts().filter((d) => d.id !== id);
  saveDrafts(drafts);
  return NextResponse.json({ ok: true });
}
