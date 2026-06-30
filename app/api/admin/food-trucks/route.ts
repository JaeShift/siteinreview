import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getFoodTrucksStore, addFoodTruck } from "@/lib/store";
import type { FoodTruck } from "@/lib/food-trucks-data";

export async function GET() {
  return NextResponse.json(getFoodTrucksStore());
}

export async function POST(request: NextRequest) {
  const truck = await request.json().catch(() => null) as FoodTruck | null;
  if (!truck?.id || !truck?.name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const trucks = addFoodTruck(truck);
  revalidatePath("/food-trucks");
  revalidatePath("/calendar");
  return NextResponse.json(trucks, { status: 201 });
}
