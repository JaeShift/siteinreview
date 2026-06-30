import type { Metadata } from "next";
import styles from "./admin-settings.module.css";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Configure integrations and site preferences</p>
      </div>

      {/* Google Calendar */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Google Calendar</h2>
          <span className={styles.statusBadge} data-status="inactive">Inactive</span>
        </div>
        <p className={styles.sectionDesc}>
          Connect Google Calendar to automatically sync events and food truck schedules
          to the Calendar page. Set the environment variables to activate.
        </p>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Events Calendar ID</label>
            <div className={styles.fieldInput}>
              <input
                className="form-input"
                type="text"
                placeholder="GOOGLE_EVENTS_CALENDAR_ID (set in .env.local)"
                disabled
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Food Truck Calendar ID</label>
            <div className={styles.fieldInput}>
              <input
                className="form-input"
                type="text"
                placeholder="GOOGLE_FOODTRUCK_CALENDAR_ID (set in .env.local)"
                disabled
              />
            </div>
          </div>
        </div>
        <div className={styles.docLink}>
          See <code>.env.example</code> for setup instructions.
        </div>
      </section>

      {/* Occasion */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Occasion (Event Registration)</h2>
          <span className={styles.statusBadge} data-status="inactive">Inactive</span>
        </div>
        <p className={styles.sectionDesc}>
          Connect Occasion to replace mock registration with real player management,
          waitlists, and email confirmations.
        </p>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>API Key</label>
            <input className="form-input" type="password" placeholder="OCCASION_API_KEY" disabled />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Organization ID</label>
            <input className="form-input" type="text" placeholder="OCCASION_ORG_ID" disabled />
          </div>
        </div>
      </section>

      {/* Shopify */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shopify / BinderPOS (Singles Inventory)</h2>
          <span className={styles.statusBadge} data-status="inactive">Inactive</span>
        </div>
        <p className={styles.sectionDesc}>
          Connect your inventory management system to sync singles listings automatically.
          Supports Shopify Storefront API, CrystalCommerce, or BinderPOS.
        </p>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Store Domain</label>
            <input className="form-input" type="text" placeholder="SHOPIFY_STORE_DOMAIN" disabled />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Storefront Access Token</label>
            <input className="form-input" type="password" placeholder="SHOPIFY_STOREFRONT_ACCESS_TOKEN" disabled />
          </div>
        </div>
      </section>

      {/* Square POS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Square POS</h2>
          <span className={styles.statusBadge} data-status="inactive">Inactive</span>
        </div>
        <p className={styles.sectionDesc}>
          Connect Square to sync in-store sales data and process event entry fees online.
        </p>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Access Token</label>
            <input className="form-input" type="password" placeholder="SQUARE_ACCESS_TOKEN" disabled />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Location ID</label>
            <input className="form-input" type="text" placeholder="SQUARE_LOCATION_ID" disabled />
          </div>
        </div>
      </section>

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
          See <code>lib/integrations/</code> for the recommended architecture.
        </div>
      </section>

      {/* Future Integrations */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Planned Integrations</h2>
        <div className={styles.integrationList}>
          {[
            { name: "Discord Announcements", desc: "Auto-post event announcements to your Discord server" },
            { name: "Email Reminders", desc: "Send automated reminder emails to registered players" },
            { name: "SMS Reminders", desc: "Twilio integration for text message reminders" },
            { name: "Tournament Software", desc: "Melee.gg or Challonge bracket management" },
            { name: "User Accounts", desc: "Player profiles, match history, and loyalty rewards" },
            { name: "Payment Processing", desc: "Online entry fee collection via Stripe or Square" },
          ].map(({ name, desc }) => (
            <div key={name} className={styles.integrationItem}>
              <span className={styles.integrationName}>{name}</span>
              <span className={styles.integrationDesc}>{desc}</span>
              <span className={styles.integrationStatus}>Planned</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
