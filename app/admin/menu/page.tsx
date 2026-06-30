import type { Metadata } from "next";
import { getMenuStore } from "@/lib/store";
import MenuAdminClient from "./MenuAdminClient";

export const metadata: Metadata = { title: "Menu Management" };

export const dynamic = "force-dynamic";

export default function AdminMenuPage() {
  const menuData = getMenuStore();
  return <MenuAdminClient initialMenu={menuData} />;
}
