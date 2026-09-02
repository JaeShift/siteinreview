import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteAppearanceStore, saveSiteAppearanceStore } from "@/lib/store";
import {
  isThemeTransitionId,
  isThemeTransitionSpeed,
  type SiteAppearance,
} from "@/lib/site-appearance";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSiteAppearanceStore());
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Partial<SiteAppearance> | null;
  if (
    !body ||
    !isThemeTransitionId(body.transition) ||
    !isThemeTransitionSpeed(body.speed)
  ) {
    return NextResponse.json({ error: "Invalid appearance settings" }, { status: 400 });
  }

  try {
    const settings = await saveSiteAppearanceStore({
      transition: body.transition,
      speed: body.speed,
    });

    revalidatePath("/", "layout");
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Unable to save site appearance:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save appearance settings",
      },
      { status: 500 }
    );
  }
}
