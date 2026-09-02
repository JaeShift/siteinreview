"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { PromoCode, EventCredit } from "@/lib/store";
import MediaLibrary from "@/components/admin/MediaLibrary";
import {
  THEME_SPEEDS,
  THEME_TRANSITIONS,
  type ThemeTransitionId,
  type ThemeTransitionSpeed,
} from "@/lib/site-appearance";
import styles from "./admin-settings.module.css";

function PromoCodesSection() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: "",
    maxUses: "",
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 3000);
  }

  useEffect(() => {
    fetch("/api/admin/promo-codes")
      .then((r) => r.json())
      .then(setCodes)
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd() {
    if (!form.code || !form.discountValue) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          discountValue: parseFloat(form.discountValue),
          maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const all: PromoCode[] = await res.json();
      setCodes(all);
      setForm({ code: "", discountType: "percent", discountValue: "", maxUses: "", expiresAt: "" });
      showFlash("Promo code added.");
    } catch (err) {
      showFlash(err instanceof Error ? err.message : "Failed to add code.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(code: PromoCode) {
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.code, active: !code.active }),
      });
      const all: PromoCode[] = await res.json();
      setCodes(all);
    } catch {
      showFlash("Failed to update code.");
    }
  }

  async function handleDelete(code: string) {
    if (!confirm(`Delete promo code "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/promo-codes?code=${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      const all: PromoCode[] = await res.json();
      setCodes(all);
      showFlash("Code deleted.");
    } catch {
      showFlash("Failed to delete.");
    }
  }

  return (
    <section className={styles.section}>
      {flash && <div className={styles.flashInline}>{flash}</div>}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Promo Codes</h2>
      </div>
      <p className={styles.sectionDesc}>Create discount codes for event registrations.</p>

      <div className={styles.inlineForm}>
        <input
          className="form-input"
          placeholder="CODE (e.g. SUMMER20)"
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
          style={{ flex: 1 }}
        />
        <select
          className="form-input"
          value={form.discountType}
          onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as "percent" | "fixed" }))}
        >
          <option value="percent">% Off</option>
          <option value="fixed">$ Off</option>
        </select>
        <input
          className="form-input"
          placeholder={form.discountType === "percent" ? "e.g. 20" : "e.g. 5.00"}
          value={form.discountValue}
          onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))}
          style={{ width: 90 }}
          type="number"
          min={0}
        />
        <input
          className="form-input"
          placeholder="Max uses (optional)"
          value={form.maxUses}
          onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value }))}
          style={{ width: 120 }}
          type="number"
          min={1}
        />
        <input
          className="form-input"
          type="date"
          title="Expiry date (optional)"
          value={form.expiresAt}
          onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
          style={{ width: 140 }}
        />
        <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !form.code || !form.discountValue}>
          {saving ? "Adding…" : "Add Code"}
        </button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading codes…</p>
      ) : codes.length === 0 ? (
        <p className={styles.emptyText}>No promo codes yet.</p>
      ) : (
        <div className={styles.codeTable}>
          <div className={styles.codeTableHeader}>
            <span>Code</span>
            <span>Discount</span>
            <span>Uses</span>
            <span>Expires</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {codes.map((c) => (
            <div key={c.code} className={styles.codeRow}>
              <span data-label="Code" className={styles.codeName}>{c.code}</span>
              <span data-label="Discount">{c.discountType === "percent" ? `${c.discountValue}%` : `$${c.discountValue}`} off</span>
              <span data-label="Uses">{c.usedCount}{c.maxUses !== undefined ? ` / ${c.maxUses}` : ""}</span>
              <span data-label="Expires">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</span>
              <span data-label="Status">
                <span className={`${styles.codeBadge} ${c.active ? styles.codeBadgeActive : styles.codeBadgeInactive}`}>
                  {c.active ? "Active" : "Inactive"}
                </span>
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className={styles.codeActionBtn} onClick={() => toggleActive(c)} title={c.active ? "Deactivate" : "Activate"}>
                  {c.active ? "⏸" : "▶"}
                </button>
                <button className={`${styles.codeActionBtn} ${styles.codeDeleteBtn}`} onClick={() => handleDelete(c.code)} title="Delete">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EventCreditsSection() {
  const [credits, setCredits] = useState<EventCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);
  const [form, setForm] = useState({ customerEmail: "", balance: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(null), 3000);
  }

  useEffect(() => {
    fetch("/api/admin/event-credits")
      .then((r) => r.json())
      .then(setCredits)
      .finally(() => setLoading(false));
  }, []);

  async function handleIssue() {
    if (!form.customerEmail || !form.balance) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/event-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: form.customerEmail,
          balance: parseFloat(form.balance),
          expiresAt: form.expiresAt || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const all: EventCredit[] = await res.json();
      setCredits(all);
      setForm({ customerEmail: "", balance: "", expiresAt: "" });
      showFlash("Credit issued.");
    } catch {
      showFlash("Failed to issue credit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.section}>
      {flash && <div className={styles.flashInline}>{flash}</div>}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Event Credits / Gift Cards</h2>
      </div>
      <p className={styles.sectionDesc}>Issue event credits to customers. Credits can be applied at registration checkout.</p>

      <div className={styles.inlineForm}>
        <input
          className="form-input"
          placeholder="Customer email"
          type="email"
          value={form.customerEmail}
          onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))}
          style={{ flex: 1 }}
        />
        <input
          className="form-input"
          placeholder="Amount ($)"
          type="number"
          min={1}
          value={form.balance}
          onChange={(e) => setForm((p) => ({ ...p, balance: e.target.value }))}
          style={{ width: 120 }}
        />
        <input
          className="form-input"
          type="date"
          title="Expiry date (optional)"
          value={form.expiresAt}
          onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
          style={{ width: 140 }}
        />
        <button className="btn btn-primary" onClick={handleIssue} disabled={saving || !form.customerEmail || !form.balance}>
          {saving ? "Issuing…" : "Issue Credit"}
        </button>
      </div>

      {loading ? (
        <p className={styles.loadingText}>Loading credits…</p>
      ) : credits.length === 0 ? (
        <p className={styles.emptyText}>No credits issued yet.</p>
      ) : (
        <div className={styles.codeTable}>
          <div className={styles.codeTableHeader}>
            <span>Code</span>
            <span>Customer</span>
            <span>Balance</span>
            <span>Expires</span>
            <span>Issued</span>
          </div>
          {credits.map((c) => (
            <div key={c.code} className={styles.codeRow}>
              <span data-label="Code" className={styles.codeName}>{c.code}</span>
              <span data-label="Customer">{c.customerEmail}</span>
              <span data-label="Balance">${c.balance.toFixed(2)}</span>
              <span data-label="Expires">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "No expiry"}</span>
              <span data-label="Issued">{new Date(c.issuedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const NOTIF_TRIGGERS = [
  // Orders
  { key: "order_new",       label: "New Order Placed",            desc: "A customer completes a purchase",                       group: "Orders" },
  { key: "order_cancelled", label: "Order Cancelled",             desc: "A customer cancels or voids an order",                  group: "Orders" },
  { key: "order_refund",    label: "Refund / Dispute",            desc: "A refund is issued or a payment is disputed",           group: "Orders" },
  // Events & Registrations
  { key: "reg_new",         label: "New Event Registration",      desc: "Someone registers (confirmed) for an event",            group: "Events & Registrations" },
  { key: "reg_waitlist",    label: "Waitlist Registration",       desc: "Someone joins an event waitlist",                       group: "Events & Registrations" },
  { key: "reg_cancelled",   label: "Registration Cancelled",      desc: "An attendee cancels or is removed from an event",       group: "Events & Registrations" },
  { key: "event_soldout",   label: "Event Sold Out",              desc: "An event reaches its player limit",                     group: "Events & Registrations" },
  { key: "event_upcoming",  label: "Event Starting Tomorrow",     desc: "Daily reminder the morning before a scheduled event",   group: "Events & Registrations" },
  // Inventory
  { key: "inv_low",         label: "Low Card Stock",              desc: "A card's quantity drops to 2 or below",                 group: "Inventory" },
  { key: "inv_outofstock",  label: "Card Out of Stock",           desc: "A card's quantity reaches 0",                          group: "Inventory" },
  // Promos
  { key: "promo_used",      label: "Promo Code Redeemed",         desc: "A customer successfully applies a discount code",       group: "Promotions" },
  { key: "promo_maxed",     label: "Promo Code Maxed Out",        desc: "A promo code reaches its maximum number of uses",       group: "Promotions" },
] as const;

type TriggerKey = (typeof NOTIF_TRIGGERS)[number]["key"];

function NotificationsSection() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [triggers, setTriggers] = useState<Record<TriggerKey, boolean>>({} as Record<TriggerKey, boolean>);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    const localEmail = localStorage.getItem("kitsune_notif_email") ?? "";
    const localTriggers: Record<string, boolean> = {};
    for (const t of NOTIF_TRIGGERS) {
      localTriggers[t.key] = localStorage.getItem(`kitsune_notif_${t.key}`) === "1";
    }
    setEmail(localEmail);
    setTriggers(localTriggers as Record<TriggerKey, boolean>);

    async function loadServerSettings() {
      try {
        const res = await fetch("/api/admin/settings/notifications");
        if (!res.ok) return;
        const serverSettings = await res.json();

        if (serverSettings) {
          setEmail(serverSettings.email ?? "");
          setTriggers(serverSettings.triggers as Record<TriggerKey, boolean>);
          return;
        }

        // Migrate preferences that were previously stored only in this browser.
        if (localEmail || Object.values(localTriggers).some(Boolean)) {
          await fetch("/api/admin/settings/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: localEmail, triggers: localTriggers }),
          });
        }
      } catch {
        // Keep the local settings visible if the server is temporarily unavailable.
      }
    }

    void loadServerSettings();
  }, []);

  function toggle(key: TriggerKey) {
    setTriggers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function save() {
    localStorage.setItem("kitsune_notif_email", email);
    for (const t of NOTIF_TRIGGERS) {
      localStorage.setItem(`kitsune_notif_${t.key}`, triggers[t.key] ? "1" : "0");
    }
    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, triggers }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Notification preferences could not be saved. Please try again.");
    }
  }

  if (!mounted) return null;

  // Group triggers for rendering
  const groups = Array.from(new Set(NOTIF_TRIGGERS.map((t) => t.group)));

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Notifications</h2>
      </div>

      {/* Email address */}
      <div className={styles.notifBlock}>
        <div className={styles.notifBlockLabel}>Notification Email</div>
        <div className={styles.notifEmailRow}>
          <input
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ flex: 1, maxWidth: 340 }}
          />
        </div>
      </div>

      {/* Trigger toggles grouped */}
      <div className={styles.notifBlock}>
        <div className={styles.notifBlockLabel}>Alert me when…</div>
        <div className={styles.notifToggles}>
          {groups.map((group) => (
            <>
              <div key={`group-${group}`} className={styles.notifGroupHeader}>{group}</div>
              {NOTIF_TRIGGERS.filter((t) => t.group === group).map((t) => (
                <label key={t.key} className={styles.notifToggle}>
                  <div className={styles.notifToggleInfo}>
                    <span className={styles.notifToggleName}>{t.label}</span>
                    <span className={styles.notifToggleDesc}>{t.desc}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!!triggers[t.key]}
                    className={`${styles.toggleSwitch} ${triggers[t.key] ? styles.toggleSwitchOn : ""}`}
                    onClick={() => toggle(t.key)}
                  >
                    <span className={styles.toggleThumb} />
                  </button>
                </label>
              ))}
            </>
          ))}
        </div>
      </div>


      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
        <button className="btn btn-primary" onClick={save}>Save Preferences</button>
        {saved && (
          <span style={{ fontSize: 13, color: "var(--color-green)", fontWeight: 600 }}>Saved!</span>
        )}
      </div>
    </section>
  );
}

function MediaLibrarySection() {
  return (
    <section className={styles.section} style={{ maxWidth: "none" }}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Media Library</h2>
      </div>
      <p className={styles.sectionDesc}>
        Upload and manage images used across the site. Copy URLs to use them in events, menus, or anywhere else.
      </p>
      <MediaLibrary />
    </section>
  );
}

function AppearanceSection() {
  const router = useRouter();
  const [transition, setTransition] = useState<ThemeTransitionId>("none");
  const [speed, setSpeed] = useState<ThemeTransitionSpeed>("medium");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/appearance")
      .then((res) => res.json())
      .then((data) => {
        if (data?.transition) setTransition(data.transition);
        if (data?.speed) setSpeed(data.speed);
      })
      .catch(() => undefined);
  }, []);

  async function persist(next: { transition: ThemeTransitionId; speed: ThemeTransitionSpeed }) {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/settings/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) {
        throw new Error(data?.error ?? "Appearance settings could not be saved.");
      }

      const verification = await fetch(
        `/api/admin/settings/appearance?verify=${Date.now()}`,
        { cache: "no-store" }
      );
      const verified = await verification.json().catch(() => null);
      if (
        !verification.ok ||
        verified?.transition !== next.transition ||
        verified?.speed !== next.speed
      ) {
        throw new Error(
          "The effect was saved but could not be verified for the live site."
        );
      }

      router.refresh();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Appearance settings could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  function chooseTransition(id: ThemeTransitionId) {
    const next = transition === id ? "none" : id;
    setTransition(next);
    void persist({ transition: next, speed });
  }

  function chooseSpeed(id: ThemeTransitionSpeed) {
    setSpeed(id);
    void persist({ transition, speed: id });
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Page Transitions</h2>
      </div>
      <p className={styles.sectionDesc}>
        Choose how the public site moves between cream taproom pages and dark MTG pages. Only one effect is active at a time.
      </p>

      <div className={styles.notifBlock}>
        <div className={styles.notifBlockLabel}>Effect</div>
        <div className={styles.notifToggles}>
          {THEME_TRANSITIONS.map((item) => (
            <label key={item.id} className={styles.notifToggle}>
              <div className={styles.notifToggleInfo}>
                <span className={styles.notifToggleName}>{item.label}</span>
                <span className={styles.notifToggleDesc}>{item.desc}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={transition === item.id}
                className={`${styles.toggleSwitch} ${transition === item.id ? styles.toggleSwitchOn : ""}`}
                onClick={() => chooseTransition(item.id)}
                disabled={saving}
              >
                <span className={styles.toggleThumb} />
              </button>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.notifBlock}>
        <div className={styles.notifBlockLabel}>Speed</div>
        <div className={styles.speedRow}>
          {THEME_SPEEDS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.speedBtn} ${speed === item.id ? styles.speedBtnOn : ""}`}
              onClick={() => chooseSpeed(item.id)}
              disabled={saving || transition === "none"}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {saved && (
        <span style={{ fontSize: 13, color: "var(--color-green)", fontWeight: 600 }}>Saved!</span>
      )}
      {saveError && (
        <div className={styles.appearanceError} role="alert">
          <strong>Effect unavailable:</strong> {saveError}
        </div>
      )}
    </section>
  );
}

export default function SettingsClient() {
  return (
    <>
      <AppearanceSection />
      <NotificationsSection />
      <PromoCodesSection />
      <EventCreditsSection />
      <MediaLibrarySection />
    </>
  );
}
