import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s — Admin | Kitsune Brewing Co.",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminShell}>
      <AdminSidebar />
      <div className={styles.adminContent}>{children}</div>
    </div>
  );
}
