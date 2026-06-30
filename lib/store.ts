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
import { menuData, type MenuItem, type MenuCategory } from "./menu-data";
import { mtgEvents, type MtgEvent } from "./events-data";
import { foodTrucks, type FoodTruck } from "./food-trucks-data";

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

// ─── Menu ────────────────────────────────────────────────────────────────────

export type StoredMenu = Record<MenuCategory, MenuItem[]>;

export function getMenuStore(): StoredMenu {
  return readJson<StoredMenu>("menu.json", menuData as StoredMenu);
}

export function saveMenuStore(data: StoredMenu): void {
  writeJson("menu.json", data);
}

/** Add a new item to a category. Returns the updated store. */
export function addMenuItem(category: MenuCategory, item: MenuItem): StoredMenu {
  const store = getMenuStore();
  if (!store[category]) store[category] = [];
  store[category] = [...store[category], item];
  saveMenuStore(store);
  return store;
}

/** Update an existing item by index within its category. */
export function updateMenuItem(category: MenuCategory, index: number, item: MenuItem): StoredMenu {
  const store = getMenuStore();
  const items = [...(store[category] ?? [])];
  items[index] = item;
  store[category] = items;
  saveMenuStore(store);
  return store;
}

/** Delete an item by index within its category. */
export function deleteMenuItem(category: MenuCategory, index: number): StoredMenu {
  const store = getMenuStore();
  store[category] = (store[category] ?? []).filter((_, i) => i !== index);
  saveMenuStore(store);
  return store;
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
