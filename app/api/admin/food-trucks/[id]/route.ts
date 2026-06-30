import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateFoodTruck, deleteFoodTruck } from "@/lib/store";
import type { FoodTruck } from "@/lib/food-trucks-data";

interface Params { params: { id: string } }

export async function PUT(request: NextRequest, { params }: Params) {
  const truck = await request.json().catch(() => null) as FoodTruck | null;
  if (!truck) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const trucks = updateFoodTruck(params.id, truck);
  revalidatePath("/food-trucks");
  revalidatePath("/calendar");
  return NextResponse.json(trucks);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const trucks = deleteFoodTruck(params.id);
  revalidatePath("/food-trucks");
  revalidatePath("/calendar");
  return NextResponse.json(trucks);
}
