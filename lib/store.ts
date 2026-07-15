/**
 * Filesystem JSON store — reads/writes from data/*.json at the project root.
 *
 * On first access for each file, the store initialises the JSON from the
 * existing TypeScript data in lib/*-data.ts so no manual migration is needed.
 *
 * ⚠ Production note: filesystem writes do NOT persist across deployments on
 * serverless hosts like Vercel. Replace readJson/writeJson with Vercel KV,
 * Supabase, or any database by swapping only this file.
 */

import fs from "fs";
import path from "path";
import { mtgEvents, type MtgEvent } from "./events-data";
import { foodTrucks, type FoodTruck } from "./food-trucks-data";
import { singles, type SingleCard } from "./singles-data";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(filename: string, defaultData: T): T {
  ensureDir();
  const file = path.join(DATA_DIR, filename);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultData, null, 2), "utf-8");
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return defaultData;
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

// ─── Events ──────────────────────────────────────────────────────────────────

export function getEventsStore(): MtgEvent[] {
  return readJson<MtgEvent[]>("events.json", mtgEvents);
}

export function saveEventsStore(events: MtgEvent[]): void {
  writeJson("events.json", events);
}

export function addEvent(event: MtgEvent): MtgEvent[] {
  const events = [...getEventsStore(), event];
  saveEventsStore(events);
  return events;
}

export function updateEvent(slug: string, event: MtgEvent): MtgEvent[] {
  const events = getEventsStore().map((e) => (e.slug === slug ? event : e));
  saveEventsStore(events);
  return events;
}

export function deleteEvent(slug: string): MtgEvent[] {
  const events = getEventsStore().filter((e) => e.slug !== slug);
  saveEventsStore(events);
  return events;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface Order {
  id: string;           // Stripe session ID (cs_...)
  stripeSessionId: string;
  customerName: string;
  customerEmail: string;
  description: string;  // e.g. event title or item name
  amountTotal: number;  // in cents
  currency: string;
  status: "paid" | "pending" | "refunded";
  metadata: Record<string, string>;
  createdAt: string;    // ISO string
}

export function getOrdersStore(): Order[] {
  return readJson<Order[]>("orders.json", []);
}

export function saveOrdersStore(orders: Order[]): void {
  writeJson("orders.json", orders);
}

export function addOrder(order: Order): Order[] {
  const existing = getOrdersStore();
  // Avoid duplicates if webhook fires twice
  if (existing.some((o) => o.stripeSessionId === order.stripeSessionId)) return existing;
  const orders = [order, ...existing];
  saveOrdersStore(orders);
  return orders;
}

export function deleteOrder(id: string): Order[] {
  const orders = getOrdersStore().filter((o) => o.id !== id);
  saveOrdersStore(orders);
  return orders;
}

// ─── Food Trucks ─────────────────────────────────────────────────────────────

export function getFoodTrucksStore(): FoodTruck[] {
  return readJson<FoodTruck[]>("food-trucks.json", foodTrucks);
}

export function saveFoodTrucksStore(trucks: FoodTruck[]): void {
  writeJson("food-trucks.json", trucks);
}

export function addFoodTruck(truck: FoodTruck): FoodTruck[] {
  const trucks = [...getFoodTrucksStore(), truck];
  saveFoodTrucksStore(trucks);
  return trucks;
}

export function updateFoodTruck(id: string, truck: FoodTruck): FoodTruck[] {
  const trucks = getFoodTrucksStore().map((t) => (t.id === id ? truck : t));
  saveFoodTrucksStore(trucks);
  return trucks;
}

export function deleteFoodTruck(id: string): FoodTruck[] {
  const trucks = getFoodTrucksStore().filter((t) => t.id !== id);
  saveFoodTrucksStore(trucks);
  return trucks;
}

// ─── Singles Inventory ────────────────────────────────────────────────────────

export function getSinglesStore(): SingleCard[] {
  return readJson<SingleCard[]>("singles.json", singles);
}

export function saveSinglesStore(cards: SingleCard[]): void {
  writeJson("singles.json", cards);
}

export function addSingle(card: SingleCard): SingleCard[] {
  const existing = getSinglesStore();
  const cards = [...existing, card];
  saveSinglesStore(cards);
  return cards;
}

export function deleteSingle(id: string): SingleCard[] {
  const cards = getSinglesStore().filter((c) => c.id !== id);
  saveSinglesStore(cards);
  return cards;
}

export function updateSingle(id: string, patch: Partial<SingleCard>): SingleCard[] {
  const cards = getSinglesStore().map((c) => c.id === id ? { ...c, ...patch } : c);
  saveSinglesStore(cards);
  return cards;
}

export { type SingleCard };

// ─── Registrations ────────────────────────────────────────────────────────────

export interface Registration {
  id: string;
  eventSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  status: "confirmed" | "waitlisted" | "cancelled";
  stripeSessionId?: string;
  amountPaid?: number;
  checkedIn: boolean;
  checkedInAt?: string;
  tableAssignment?: string;
  customAnswers?: Record<string, string>;
  selectedAddOns?: string[];
  createdAt: string;
}

export function getRegistrationsStore(): Registration[] {
  return readJson<Registration[]>("registrations.json", []);
}

export function saveRegistrationsStore(registrations: Registration[]): void {
  writeJson("registrations.json", registrations);
}

export function addRegistration(registration: Registration): Registration[] {
  const existing = getRegistrationsStore();
  // Avoid duplicates if webhook fires twice
  if (
    registration.stripeSessionId &&
    existing.some((r) => r.stripeSessionId === registration.stripeSessionId)
  ) {
    return existing;
  }
  const registrations = [registration, ...existing];
  saveRegistrationsStore(registrations);
  return registrations;
}

export function updateRegistration(id: string, patch: Partial<Registration>): Registration[] {
  const registrations = getRegistrationsStore().map((r) =>
    r.id === id ? { ...r, ...patch } : r
  );
  saveRegistrationsStore(registrations);
  return registrations;
}

export function deleteRegistration(id: string): Registration[] {
  const registrations = getRegistrationsStore().filter((r) => r.id !== id);
  saveRegistrationsStore(registrations);
  return registrations;
}

export function getRegistrationsByEvent(eventSlug: string): Registration[] {
  return getRegistrationsStore().filter((r) => r.eventSlug === eventSlug);
}

// ─── Promo Codes ──────────────────────────────────────────────────────────────

export interface PromoCode {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  eventSlugs?: string[];
  expiresAt?: string;
  active: boolean;
}

export function getPromoCodesStore(): PromoCode[] {
  return readJson<PromoCode[]>("promo-codes.json", []);
}

export function savePromoCodesStore(codes: PromoCode[]): void {
  writeJson("promo-codes.json", codes);
}

export function addPromoCode(code: PromoCode): PromoCode[] {
  const codes = [...getPromoCodesStore(), code];
  savePromoCodesStore(codes);
  return codes;
}

export function updatePromoCode(codeStr: string, patch: Partial<PromoCode>): PromoCode[] {
  const codes = getPromoCodesStore().map((c) =>
    c.code === codeStr ? { ...c, ...patch } : c
  );
  savePromoCodesStore(codes);
  return codes;
}

export function deletePromoCode(codeStr: string): PromoCode[] {
  const codes = getPromoCodesStore().filter((c) => c.code !== codeStr);
  savePromoCodesStore(codes);
  return codes;
}

// ─── Event Credits ────────────────────────────────────────────────────────────

export interface EventCredit {
  code: string;
  balance: number;
  customerEmail: string;
  expiresAt?: string;
  issuedAt: string;
  issuedBy?: string;
}

export function getEventCreditsStore(): EventCredit[] {
  return readJson<EventCredit[]>("event-credits.json", []);
}

export function saveEventCreditsStore(credits: EventCredit[]): void {
  writeJson("event-credits.json", credits);
}

export function addEventCredit(credit: EventCredit): EventCredit[] {
  const credits = [...getEventCreditsStore(), credit];
  saveEventCreditsStore(credits);
  return credits;
}

export function updateEventCredit(code: string, patch: Partial<EventCredit>): EventCredit[] {
  const credits = getEventCreditsStore().map((c) =>
    c.code === code ? { ...c, ...patch } : c
  );
  saveEventCreditsStore(credits);
  return credits;
}
