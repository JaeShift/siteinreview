import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "kitsune-dev-secret-2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "kitsune2026";

async function sign(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(ADMIN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const raw = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(raw))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** POST /api/admin/auth — log in */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const timestamp = Date.now().toString();
  const token = `${timestamp}.${await sign(`${timestamp}:${ADMIN_PASSWORD}`)}`;

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return response;
}

/** DELETE /api/admin/auth — log out */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
  return response;
}
