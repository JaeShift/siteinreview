/**
 * Square POS Integration (stub)
 *
 * Square is used at many LGS (local game stores) for point-of-sale.
 * This stub prepares the codebase for future Square Connect API integration.
 *
 * Use cases:
 * - Sync in-store singles inventory with the website
 * - Process event entry fees through Square
 * - Report daily sales to admin dashboard
 *
 * To activate:
 * 1. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID in .env.local
 * 2. Install: npm install squareup
 * 3. Replace stub implementations with real Square SDK calls
 */

export interface SquareInventoryItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  categoryId?: string;
}

export interface SquareSalesSummary {
  totalRevenue: number;
  totalTransactions: number;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  date: string;
}

/**
 * Fetch current inventory from Square catalog.
 */
export async function getSquareInventory(): Promise<SquareInventoryItem[]> {
  // ── Real Square implementation (future) ───────────────────────────────────
  // const { Client, Environment } = await import("squareup");
  // const client = new Client({
  //   accessToken: process.env.SQUARE_ACCESS_TOKEN,
  //   environment: Environment.Production,
  // });
  // const res = await client.catalogApi.listCatalog(undefined, "ITEM");
  // return res.result.objects?.map(mapSquareItem) ?? [];

  console.info("[Square stub] getSquareInventory called");
  return [];
}

/**
 * Fetch daily sales summary for admin dashboard.
 */
export async function getDailySalesSummary(date: string): Promise<SquareSalesSummary> {
  // TODO: implement with Square Reporting API
  console.info("[Square stub] getDailySalesSummary called for:", date);
  return {
    totalRevenue: 0,
    totalTransactions: 0,
    topItems: [],
    date,
  };
}

/**
 * Create a payment link for event entry fees.
 */
export async function createPaymentLink(
  eventSlug: string,
  amount: number,
  playerName: string
): Promise<{ url: string; orderId: string } | null> {
  // TODO: implement with Square Checkout API
  console.info("[Square stub] createPaymentLink called for:", { eventSlug, amount, playerName });
  return null;
}
