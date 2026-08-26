import { NextResponse } from "next/server";
import { getOrdersStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const orders = getOrdersStore();
  return NextResponse.json({ count: orders.length });
}
