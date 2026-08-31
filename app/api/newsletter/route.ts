import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendNewsletterSignupEmail } from "@/lib/email";

const newsletterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = newsletterSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." },
        { status: 400 }
      );
    }

    await sendNewsletterSignupEmail(parsed.data.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter/route] Error:", error);
    return NextResponse.json(
      { error: "Unable to subscribe right now. Please try again." },
      { status: 500 }
    );
  }
}
