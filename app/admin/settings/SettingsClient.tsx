"use client";

import { useState, useEffect } from "react";
import type { PromoCode, EventCredit } from "@/lib/store";
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
              <span className={styles.codeName}>{c.code}</span>
              <span>{c.discountType === "percent" ? `${c.discountValue}%` : `$${c.discountValue}`} off</span>
              <span>{c.usedCount}{c.maxUses !== undefined ? ` / ${c.maxUses}` : ""}</span>
              <span>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</span>
              <span>
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
              <span className={styles.codeName}>{c.code}</span>
              <span>{c.customerEmail}</span>
              <span>${c.balance.toFixed(2)}</span>
              <span>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "No expiry"}</span>
              <span>{new Date(c.issuedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SettingsClient() {
  return (
    <>
      <PromoCodesSection />
      <EventCreditsSection />
    </>
  );
}
