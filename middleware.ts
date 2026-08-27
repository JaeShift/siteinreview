import { NextRequest, NextResponse } from "next/server";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "kitsune-dev-secret-2026";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "kitsune2026";

/** Sign a timestamp+password with HMAC-SHA256 using Web Crypto (Edge-compatible). */
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

/** Verify a stored cookie token against the current password + secret. */
async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const timestamp = token.slice(0, dotIdx);
  const stored = token.slice(dotIdx + 1);

  // 7-day expiry
  if (Date.now() - parseInt(timestamp, 10) > 7 * 24 * 60 * 60 * 1000) return false;

  const expected = await sign(`${timestamp}:${ADMIN_PASSWORD}`);
  return expected === stored;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page and the auth API through without a token check
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  // Allow the prerelease import cron route — verified by CRON_SECRET bearer token
  if (pathname === "/api/admin/prerelease/import") {
    const cronSecret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization") ?? "";
    // If no CRON_SECRET is set, allow through (dev/local); otherwise validate
    if (!cronSecret || auth === `Bearer ${cronSecret}`) {
      return NextResponse.next();
    }
  }

  const token = request.cookies.get("admin_token")?.value;
  const valid = await verifyToken(token);

  if (!valid) {
    if (pathname.startsWith("/api/admin")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

// Export helpers so auth API route can use them without reimporting crypto
export { sign, ADMIN_PASSWORD };
