import type { Metadata } from "next";
import AdminTopBar from "@/components/admin/AdminTopBar";
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
      <AdminTopBar />
      <div className={styles.adminContent}>{children}</div>
    </div>
  );
}
