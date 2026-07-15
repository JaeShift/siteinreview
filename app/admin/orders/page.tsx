import type { Metadata } from "next";
import { getOrdersStore } from "@/lib/store";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const orders = getOrdersStore();
  return <OrdersClient orders={orders} />;
}
