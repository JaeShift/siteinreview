import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── POST /api/admin/upload — upload one or more images ────────────────────
export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const files = formData.getAll("file") as File[];
  if (!files.length) return NextResponse.json({ error: "No files provided" }, { status: 400 });

  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const results: { filename: string; url: string; size: number }[] = [];
  const errors: { filename: string; error: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      errors.push({ filename: file.name, error: `Unsupported type: ${file.type}` });
      continue;
    }
    if (file.size > MAX_SIZE) {
      errors.push({ filename: file.name, error: "File exceeds 20 MB limit" });
      continue;
    }

    const ext = file.name.split(".").pop() ?? "png";
    let base = sanitizeFilename(file.name.replace(/\.[^.]+$/, ""));
    if (!base) base = `upload-${Date.now()}`;

    // Avoid overwriting — append a counter if needed
    let filename = `${base}.${ext}`;
    let counter = 1;
    while (fs.existsSync(path.join(IMAGES_DIR, filename))) {
      filename = `${base}-${counter++}.${ext}`;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(IMAGES_DIR, filename), buffer);
    results.push({ filename, url: `/images/${filename}`, size: file.size });
  }

  return NextResponse.json({ uploaded: results, errors });
}

// ── DELETE /api/admin/upload — delete an image by filename ───────────────
export async function DELETE(request: NextRequest) {
  const { filename } = await request.json().catch(() => ({})) as { filename?: string };
  if (!filename) return NextResponse.json({ error: "filename required" }, { status: 400 });

  // Guard against path traversal
  const safe = path.basename(filename);
  const filepath = path.join(IMAGES_DIR, safe);
  if (!fs.existsSync(filepath)) return NextResponse.json({ error: "File not found" }, { status: 404 });

  fs.unlinkSync(filepath);
  return NextResponse.json({ success: true });
}

// ── GET /api/admin/upload — list all images (root + uploads/ subfolder) ──
export async function GET() {
  if (!fs.existsSync(IMAGES_DIR)) return NextResponse.json([]);

  const collect = (dir: string, prefix: string) =>
    fs.existsSync(dir)
      ? fs.readdirSync(dir)
          .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f))
          .map((f) => {
            const stat = fs.statSync(path.join(dir, f));
            return {
              filename: prefix ? `${prefix}/${f}` : f,
              url: `/images/${prefix ? `${prefix}/` : ""}${f}`,
              size: stat.size,
              mtime: stat.mtimeMs,
            };
          })
      : [];

  const files = [
    ...collect(IMAGES_DIR, ""),
    ...collect(path.join(IMAGES_DIR, "uploads"), "uploads"),
  ].sort((a, b) => b.mtime - a.mtime);

  return NextResponse.json(files);
}
