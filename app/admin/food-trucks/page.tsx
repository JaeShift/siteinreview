import type { Metadata } from "next";
import { getFoodTrucksStore } from "@/lib/store";
import FoodTrucksAdminClient from "./FoodTrucksAdminClient";

export const metadata: Metadata = { title: "Food Trucks" };
export const dynamic = "force-dynamic";

export default function AdminFoodTrucksPage() {
  const trucks = getFoodTrucksStore();
  return <FoodTrucksAdminClient initialTrucks={trucks} />;
}
