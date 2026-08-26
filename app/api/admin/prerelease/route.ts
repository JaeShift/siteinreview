import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrereleaseConfig, savePrereleaseConfig } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getPrereleaseConfig());
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const config = savePrereleaseConfig(body);
  revalidatePath("/magic-mamas-pre-release");
  revalidatePath("/admin/events");
  return NextResponse.json(config);
}
