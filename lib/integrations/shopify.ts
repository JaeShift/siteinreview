/**
 * Shopify Storefront Integration (stub)
 *
 * Connect Shopify to sync the singles inventory.
 * Uses Shopify Storefront API (public, read-only) or Admin API (server-side).
 *
 * To activate:
 * 1. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local
 * 2. The singles page currently reads from lib/singles-data.ts (mock)
 * 3. Replace getSinglesInventory() with a real Shopify Storefront query
 *
 * Alternative: BinderPOS or CrystalCommerce — implement the same interface.
 */

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  imageUrl?: string;
  available: boolean;
  quantityAvailable: number;
  tags: string[];
  vendor: string;
}

/**
 * Fetch MTG singles from Shopify.
 * Filters by the "singles" collection or tag.
 */
export async function getSinglesInventory(
  limit = 50,
  cursor?: string
): Promise<{ products: ShopifyProduct[]; nextCursor?: string }> {
  // ── Real Shopify Storefront implementation (future) ───────────────────────
  // const domain = process.env.SHOPIFY_STORE_DOMAIN;
  // const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  // if (!domain || !token) throw new Error("Shopify credentials not configured");
  //
  // const query = `
  //   query GetSingles($first: Int!, $after: String) {
  //     collection(handle: "singles") {
  //       products(first: $first, after: $after) {
  //         edges {
  //           cursor
  //           node {
  //             id title handle
  //             priceRange { minVariantPrice { amount } }
  //             images(first: 1) { edges { node { url } } }
  //             variants(first: 1) { edges { node { quantityAvailable availableForSale } } }
  //             tags vendor
  //           }
  //         }
  //       }
  //     }
  //   }
  // `;
  // const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
  //   body: JSON.stringify({ query, variables: { first: limit, after: cursor } }),
  // });
  // const data = await res.json();
  // return mapShopifyResponse(data);

  // ── Mock ──────────────────────────────────────────────────────────────────
  console.info("[Shopify stub] getSinglesInventory called");
  return { products: [] };
}

/**
 * Fetch a single product by handle from Shopify.
 */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  // TODO: implement with Shopify Storefront API
  console.info("[Shopify stub] getProductByHandle called for:", handle);
  return null;
}
