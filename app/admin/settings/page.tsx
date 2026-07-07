import type { Metadata } from "next";
import styles from "./admin-settings.module.css";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure integrations and site preferences</p>
      </div>

      {/* Admin Access */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Admin Access</h2>
        </div>
        <p className={styles.sectionDesc}>
          Currently the <code>/admin</code> route is unprotected. Before going to production,
          implement authentication using NextAuth.js or Clerk.
        </p>
        <div className={styles.warningBox}>
          <strong>⚠ Security Notice:</strong> The admin dashboard is currently accessible
          to anyone with the URL. Add authentication before deploying to production.
        </div>
      </section>

      <SettingsClient />
    </div>
  );
}
