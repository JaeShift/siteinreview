/**
 * Occasion Integration (stub)
 *
 * Occasion is a ticketing/event registration platform.
 * https://www.getoccasion.com
 *
 * To activate:
 * 1. Set OCCASION_API_KEY and OCCASION_ORG_ID in .env.local
 * 2. Install the Occasion SDK (check their documentation for the current package)
 * 3. Replace the stub implementations below with real API calls
 *
 * The RegistrationForm component calls `submitRegistration()`. Swapping in
 * the real Occasion API only requires updating this file.
 */

export interface RegistrationPayload {
  eventSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface RegistrationResult {
  success: boolean;
  confirmationNumber?: string;
  message?: string;
  error?: string;
}

/**
 * Submit a player registration for a given event.
 * Currently returns mock confirmation data.
 * Replace the body with a real Occasion API call when credentials are available.
 */
export async function submitRegistration(
  payload: RegistrationPayload
): Promise<RegistrationResult> {
  // ── Real Occasion implementation (future) ─────────────────────────────────
  // const apiKey = process.env.OCCASION_API_KEY;
  // const orgId = process.env.OCCASION_ORG_ID;
  // if (!apiKey || !orgId) throw new Error("Occasion credentials not configured");
  //
  // const res = await fetch(`https://api.getoccasion.com/v1/orgs/${orgId}/orders`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
  //   body: JSON.stringify({ ... map payload to Occasion schema ... }),
  // });
  // const data = await res.json();
  // return { success: res.ok, confirmationNumber: data.confirmation_number };

  // ── Mock implementation ───────────────────────────────────────────────────
  await new Promise((resolve) => setTimeout(resolve, 800)); // simulate network
  const confirmationNumber = `KIT-${Date.now().toString(36).toUpperCase()}`;
  console.info("[Occasion stub] Registration received:", payload);
  return { success: true, confirmationNumber };
}

/**
 * Fetch current registration count for an event.
 * Used to show seats remaining (currently handled via mock data).
 */
export async function getRegistrationCount(eventSlug: string): Promise<number> {
  // TODO: fetch from Occasion API
  console.info("[Occasion stub] getRegistrationCount called for:", eventSlug);
  return 0;
}

/**
 * Fetch all registrations for an event (admin use).
 */
export async function listRegistrations(eventSlug: string): Promise<RegistrationPayload[]> {
  // TODO: fetch from Occasion API
  console.info("[Occasion stub] listRegistrations called for:", eventSlug);
  return [];
}
