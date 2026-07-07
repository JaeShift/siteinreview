"use client";

import { useState } from "react";
import Link from "next/link";
import type { MtgEvent, EventFormat } from "@/lib/events-data";
import styles from "./admin-events.module.css";

const FORMAT_OPTIONS: EventFormat[] = [
  "Commander", "Draft", "Standard", "Modern", "Pioneer",
  "Legacy", "Sealed", "Prerelease", "RCQ", "Casual",
];

function slugify(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function makeEmpty(): MtgEvent {
  return {
    slug: "",
    title: "",
    format: "Commander",
    date: new Date().toISOString().split("T")[0],
    time: "6:00 PM",
    endTime: "10:00 PM",
    entryFee: 0,
    playerLimit: 32,
    registeredCount: 0,
    imageUrl: "",
    description: "",
    shortDescription: "",
    location: "Kitsune Brewing Co. — 3321 E Bell Rd Suite B-5, Phoenix, AZ 85032",
    prizeSupport: "",
    tags: [],
    faq: [],
    recurring: undefined,
    featured: false,
  };
}

interface Props {
  initialEvents: MtgEvent[];
}

export default function EventsAdminClient({ initialEvents }: Props) {
  const [events, setEvents] = useState<MtgEvent[]>(initialEvents);
  const [editing, setEditing] = useState<MtgEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date));

  function showFlash(msg: string, type: "success" | "error" = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3500);
  }

  function openAdd() {
    setIsNew(true);
    setEditing(makeEmpty());
  }

  function openEdit(event: MtgEvent) {
    setIsNew(false);
    setEditing({ ...event });
  }

  function changeField(field: keyof MtgEvent, value: unknown) {
    setEditing((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      // Auto-generate slug when creating new and title changes
      if (isNew && field === "title") {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const url = isNew ? "/api/admin/events" : `/api/admin/events/${editing.slug}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Request failed");
      }
      setEvents(await res.json());
      setEditing(null);
      showFlash(isNew ? "Event created." : "Event updated.");
    } catch (err) {
      showFlash(err instanceof Error ? err.message : "Failed to save event.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/admin/events/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setEvents(await res.json());
      showFlash("Event deleted.");
    } catch {
      showFlash("Failed to delete event.", "error");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className={styles.page}>
      {flash && (
        <div className={`${styles.flash} ${flash.type === "error" ? styles.flashError : styles.flashSuccess}`}>
          {flash.msg}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Events</h1>
          <p className={styles.subtitle}>{events.length} total · {events.filter(e => e.date >= today).length} upcoming</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Event</button>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <span>Event</span>
          <span>Date</span>
          <span>Format</span>
          <span>Entry</span>
          <span>Players</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {sorted.map((event) => {
          const isPast = event.date < today;
          const seatsLeft = event.playerLimit - event.registeredCount;
          return (
            <div key={event.slug} className={`${styles.tableRow} ${isPast ? styles.pastRow : ""}`}>
              <div className={styles.eventCell}>
                <span className={styles.eventTitle}>{event.title}</span>
                {event.featured && <span className={styles.featuredPill}>Featured</span>}
              </div>
              <span className={styles.dateCell}>
                {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </span>
              <span className={styles.formatCell}>{event.format}</span>
              <span className={styles.feeCell}>{event.entryFee === 0 ? "Free" : `$${event.entryFee}`}</span>
              <div className={styles.playersCell}>
                <span>{event.registeredCount}/{event.playerLimit}</span>
                <div className={styles.miniProgress}>
                  <div
                    className={styles.miniProgressBar}
                    style={{ width: `${Math.min(100, (event.registeredCount / event.playerLimit) * 100)}%` }}
                  />
                </div>
              </div>
              <span className={`${styles.statusBadge} ${isPast ? styles.statusPast : seatsLeft === 0 ? styles.statusSoldOut : styles.statusUpcoming}`}>
                {isPast ? "Past" : seatsLeft === 0 ? "Sold Out" : "Upcoming"}
              </span>
              <div className={styles.actionsCell}>
                <Link href={`/events/${event.slug}`} target="_blank" className={styles.actionLink} title="View public page">↗</Link>
                <button className={styles.actionLink} onClick={() => openEdit(event)} title="Edit event">✎</button>
                <button
                  className={`${styles.actionLink} ${styles.deleteLink}`}
                  onClick={() => handleDelete(event.slug, event.title)}
                  disabled={deletingSlug === event.slug}
                  title="Delete event"
                >
                  {deletingSlug === event.slug ? "…" : "✕"}
                </button>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className={styles.emptyRow}>No events yet. Click &ldquo;+ New Event&rdquo; to get started.</div>
        )}
      </div>

      {/* ── Edit/Add Modal ── */}
      {editing && (
        <div className={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{isNew ? "New Event" : `Edit: ${editing.title}`}</h2>
              <button className={styles.closeBtn} onClick={() => setEditing(null)}>✕</button>
            </div>

            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Title *</label>
                <input className="form-input" value={editing.title} onChange={(e) => changeField("title", e.target.value)} placeholder="e.g. Friday Night Commander" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Slug (URL key)</label>
                <input className="form-input" value={editing.slug} onChange={(e) => changeField("slug", e.target.value)} placeholder="auto-generated from title" />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Format *</label>
                <select className="form-input" value={editing.format} onChange={(e) => changeField("format", e.target.value as EventFormat)}>
                  {FORMAT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={editing.date} onChange={(e) => changeField("date", e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Start Time</label>
                <input className="form-input" value={editing.time} onChange={(e) => changeField("time", e.target.value)} placeholder="6:00 PM" />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">End Time</label>
                <input className="form-input" value={editing.endTime} onChange={(e) => changeField("endTime", e.target.value)} placeholder="10:00 PM" />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Entry Fee ($)</label>
                <input type="number" min={0} className="form-input" value={editing.entryFee} onChange={(e) => changeField("entryFee", parseInt(e.target.value) || 0)} />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Player Limit</label>
                <input type="number" min={1} className="form-input" value={editing.playerLimit} onChange={(e) => changeField("playerLimit", parseInt(e.target.value) || 32)} />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Short Description</label>
                <input className="form-input" value={editing.shortDescription} onChange={(e) => changeField("shortDescription", e.target.value)} placeholder="One-line teaser shown on the events list" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Full Description</label>
                <textarea className="form-input" rows={4} value={editing.description} onChange={(e) => changeField("description", e.target.value)} placeholder="Full event details, rules, etc." />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Prize Support</label>
                <input className="form-input" value={editing.prizeSupport} onChange={(e) => changeField("prizeSupport", e.target.value)} placeholder="e.g. Booster packs for top 4" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Image URL</label>
                <input className="form-input" value={editing.imageUrl} onChange={(e) => changeField("imageUrl", e.target.value)} placeholder="https://…" />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Recurring</label>
                <select className="form-input" value={editing.recurring ?? ""} onChange={(e) => changeField("recurring", e.target.value || undefined)}>
                  <option value="">None</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Tags (comma-separated)</label>
                <input className="form-input" value={editing.tags.join(", ")} onChange={(e) => changeField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} placeholder="commander, casual, weekly" />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Featured</label>
                <select className="form-input" value={editing.featured ? "yes" : "no"} onChange={(e) => changeField("featured", e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes – show in spotlight</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={() => setEditing(null)} disabled={saving}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !editing.title || !editing.slug || !editing.date}
              >
                {saving ? "Saving…" : isNew ? "Create Event" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
