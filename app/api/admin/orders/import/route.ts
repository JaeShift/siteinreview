import { NextRequest, NextResponse } from "next/server";
import { getOrdersStore, saveOrdersStore, type Order } from "@/lib/store";

export const dynamic = "force-dynamic";

// ── Minimal RFC-4180 CSV parser ───────────────────────────────────────────────
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuote = !inQuote; }
    } else if (ch === "," && !inQuote) {
      result.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { csv: string } | null;
  if (!body?.csv) return NextResponse.json({ error: "No CSV provided" }, { status: 400 });

  const rows = parseCsv(body.csv);
  if (!rows.length) return NextResponse.json({ error: "No rows found" }, { status: 400 });

  // Group rows by Order ID (multiple line items per order)
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const id = row["Order ID"]?.trim();
    if (!id) continue;
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id)!.push(row);
  }

  const existing = getOrdersStore();
  const existingIds = new Set(existing.map((o) => o.id));

  const imported: Order[] = [];
  const skipped: string[] = [];

  for (const [orderId, orderRows] of Array.from(grouped.entries())) {
    const storeId = `sq_${orderId}`;
    if (existingIds.has(storeId)) { skipped.push(orderId); continue; }

    const first = orderRows[0];
    const financialStatus = first["Financial Status"]?.toLowerCase() ?? "";
    const status: Order["status"] =
      financialStatus === "paid" ? "paid" :
      financialStatus === "refunded" ? "refunded" : "pending";

    // Detect category from line item names
    const allNames = orderRows.map((r) => (r["Lineitem name"] ?? "").toLowerCase()).join(" ");
    const category =
      /prerelease|pre-release|hobbit|release party|magic mama.*pre|set release/.test(allNames)
        ? "prerelease"
        : /commander|tournament|draft|event|registration|magic mama/.test(allNames)
        ? "events"
        : /booster|pack|single|foil|sealed|commander deck|bundle|set booster|collector/.test(allNames)
        ? "cards"
        : "merchandise";

    // Build description from line items, stripping trailing dates (e.g. "8/9/2026")
    const stripDate = (s: string) => s.replace(/\s+\d{1,2}\/\d{1,2}\/\d{2,4}\s*$/, "").trim();
    const items = orderRows
      .map((r) => {
        const name = stripDate(r["Lineitem name"] ?? "");
        const variant = r["Lineitem variant"];
        return [name, variant].filter(Boolean).join(" — ");
      })
      .filter(Boolean)
      .join(", ");

    const totalQty = orderRows.reduce((sum, r) => sum + (parseInt(r["Lineitem quantity"] ?? "1") || 1), 0);

    // Amount: Total is in dollars, convert to cents
    const totalDollars = parseFloat(first["Total"] ?? "0");
    const amountTotal = Math.round(totalDollars * 100);

    const createdAt = first["Created at"] ?? first["Paid at"] ?? "";
    const parsedDate = createdAt ? new Date(createdAt) : new Date();

    imported.push({
      id: storeId,
      stripeSessionId: first["Payment Reference"] ?? storeId,
      customerName: first["Billing Name"] ?? "Unknown",
      customerEmail: first["Email"] ?? "",
      description: items || "Squarespace Order",
      amountTotal,
      currency: (first["Currency"] ?? "usd").toLowerCase(),
      status,
        metadata: {
          source: "squarespace",
          category,
          squarespaceOrderId: orderId,
          channelOrderNumber: first["Channel Order Number"] ?? "",
          paymentReference: first["Payment Reference"] ?? "",
          shippingMethod: first["Shipping Method"] ?? "",
          fulfillmentStatus: first["Fulfillment Status"] ?? "",
          quantity: String(totalQty),
        },
      createdAt: isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
    });
  }

  if (imported.length) {
    saveOrdersStore([...imported, ...existing]);
  }

  return NextResponse.json({ imported: imported.length, skipped: skipped.length });
}
