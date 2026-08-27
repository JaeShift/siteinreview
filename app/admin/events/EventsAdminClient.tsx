"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { MtgEvent, EventFormat, CustomQuestion, EventAddOn } from "@/lib/events-data";
import type { PrereleaseConfig } from "@/lib/store";
import type { PrereleaseDraft } from "@/lib/prerelease-drafts";
import styles from "./admin-events.module.css";

const BLANK_PRERELEASE: PrereleaseConfig = {
  active: false,
  setName: "",
  tagline: "",
  date: "",
  time: "",
  description: "",
  imageUrl: "",
  eventSlug: "",
};

const FORMAT_OPTIONS: EventFormat[] = [
  "Commander", "Draft", "Standard", "Modern", "Pioneer",
  "Legacy", "Sealed", "RCQ", "Casual",
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
  initialPrerelease: PrereleaseConfig;
}

export default function EventsAdminClient({ initialEvents, initialPrerelease }: Props) {
  const [events, setEvents] = useState<MtgEvent[]>(initialEvents);
  const [editing, setEditing] = useState<MtgEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Pre-release page modal
  const [showPRModal, setShowPRModal] = useState(false);
  const [prConfig, setPrConfig] = useState<PrereleaseConfig>(initialPrerelease);
  const [prSaving, setPrSaving] = useState(false);
  const [prImageUploading, setPrImageUploading] = useState(false);

  // Drafts from the importer
  const [drafts, setDrafts] = useState<PrereleaseDraft[]>([]);
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [prTab, setPrTab] = useState<"edit" | "drafts">("edit");
  const [runningImport, setRunningImport] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/prerelease/drafts")
      .then((r) => r.json())
      .then((d: PrereleaseDraft[]) => setDrafts(d))
      .catch(() => {/* ignore */});
  }, []);

  const pendingDrafts = drafts.filter((d) => d.status === "pending");

  async function runImport() {
    setRunningImport(true);
    try {
      const res = await fetch("/api/admin/prerelease/import", { method: "POST",
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` } });
      const data = await res.json();
      showFlash(`Import done — ${data.created} new draft(s) created.`);
      const updated = await fetch("/api/admin/prerelease/drafts").then((r) => r.json());
      setDrafts(updated);
    } catch {
      showFlash("Import failed — check the server logs.", "error");
    } finally {
      setRunningImport(false);
    }
  }

  async function approveDraft(draft: PrereleaseDraft) {
    setApprovingId(draft.id);
    try {
      const res = await fetch("/api/admin/prerelease/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, status: "approved" }),
      });
      if (!res.ok) throw new Error();
      const updated: PrereleaseDraft = await res.json();
      setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      // Sync local prConfig so the modal reflects the approved draft
      setPrConfig((c) => ({
        ...c,
        active: true,
        setName: draft.setName,
        date: draft.prereleaseDate,
        imageUrl: draft.imageUrl,
        tagline: draft.tagline,
      }));
      showFlash(`"${draft.setName}" approved and set as live pre-release page.`);
    } catch {
      showFlash("Failed to approve draft.", "error");
    } finally {
      setApprovingId(null);
    }
  }

  async function rejectDraft(draft: PrereleaseDraft) {
    try {
      const res = await fetch("/api/admin/prerelease/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, status: "rejected" }),
      });
      if (!res.ok) throw new Error();
      const updated: PrereleaseDraft = await res.json();
      setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      showFlash(`"${draft.setName}" draft rejected.`);
    } catch {
      showFlash("Failed to reject draft.", "error");
    }
  }

  async function deleteDraft(id: string) {
    if (!confirm("Delete this draft? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/prerelease/drafts?id=${id}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch {
      showFlash("Failed to delete draft.", "error");
    }
  }

  // Scryfall auto-fill
  const [scryfallSets, setScryfallSets] = useState<{ code: string; name: string; released_at: string }[]>([]);
  const [scryfallLoading, setScryfallLoading] = useState(false);
  const [scryfallError, setScryfallError] = useState<string | null>(null);
  const [selectedScryfallCode, setSelectedScryfallCode] = useState("");

  async function fetchScryfallSets() {
    setScryfallLoading(true);
    setScryfallError(null);
    try {
      const res = await fetch("https://api.scryfall.com/sets");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const todayStr = new Date().toISOString().split("T")[0];
      const upcoming = (data.data as Array<{ code: string; name: string; released_at: string; set_type: string }>)
        .filter((s) => ["expansion", "core"].includes(s.set_type) && s.released_at >= todayStr)
        .sort((a, b) => a.released_at.localeCompare(b.released_at));
      setScryfallSets(upcoming);
      if (upcoming.length > 0) setSelectedScryfallCode(upcoming[0].code);
    } catch {
      setScryfallError("Could not reach Scryfall — check your connection and try again.");
    } finally {
      setScryfallLoading(false);
    }
  }

  async function applyScryfallSet() {
    const set = scryfallSets.find((s) => s.code === selectedScryfallCode);
    if (!set) return;
    // Pre-release weekend is the Friday 7 days before official release
    const release = new Date(set.released_at + "T12:00:00Z");
    release.setUTCDate(release.getUTCDate() - 7);
    const prereleaseDate = release.toISOString().split("T")[0];

    // Try to fetch art crop from the first mythic (fallback: rare) in the set
    let imageUrl = "";
    try {
      for (const rarity of ["m", "r"]) {
        const res = await fetch(
          `https://api.scryfall.com/cards/search?q=set:${set.code}+rarity:${rarity}&order=released&dir=asc&page=1`
        );
        if (res.ok) {
          const data = await res.json();
          const card = data.data?.[0];
          const artCrop = card?.image_uris?.art_crop ?? card?.card_faces?.[0]?.image_uris?.art_crop;
          if (artCrop) { imageUrl = artCrop; break; }
        }
      }
    } catch { /* image stays blank if fetch fails */ }

    setPrConfig((c) => ({
      active: c.active,
      setName: set.name,
      tagline: "",
      date: prereleaseDate,
      time: "",
      description: "",
      imageUrl,
      eventSlug: "",
    }));
    setScryfallSets([]);
    setSelectedScryfallCode("");
  }

  const today = new Date().toISOString().split("T")[0];
  const upcoming = [...events].filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = [...events].filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const sorted = [...upcoming, ...past];

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

  async function savePrereleaseConfig() {
    setPrSaving(true);
    try {
      const res = await fetch("/api/admin/prerelease", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prConfig),
      });
      if (!res.ok) throw new Error("Request failed");
      const saved = await res.json();
      setPrConfig(saved);
      setShowPRModal(false);
      showFlash("Pre-release page updated.");
    } catch {
      showFlash("Failed to save pre-release config.", "error");
    } finally {
      setPrSaving(false);
    }
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

  async function toggleRegistration(slug: string, open: boolean) {
    try {
      const event = events.find((e) => e.slug === slug);
      if (!event) return;
      const res = await fetch(`/api/admin/events/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, registrationOpen: open }),
      });
      if (!res.ok) throw new Error();
      setEvents(await res.json());
      showFlash(`Registration ${open ? "opened" : "closed"} for "${event.title}".`);
    } catch {
      showFlash("Failed to update registration status.", "error");
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
        <div className={styles.headerActions}>
          <button
            className={`btn btn-primary ${styles.prereleaseBtn}`}
            onClick={() => { setPrTab("edit"); setShowPRModal(true); }}
          >
            Pre-Release Page
            {prConfig.active
              ? <span className={styles.prereleaseLiveDot} title="Page is live" />
              : <span className={`${styles.prereleaseLiveDot} ${styles.prereleaseLiveDotHolding}`} title="Page is holding" />
            }
            {pendingDrafts.length > 0 && (
              <span className={styles.draftsBadge} title={`${pendingDrafts.length} draft(s) awaiting review`}>
                {pendingDrafts.length}
              </span>
            )}
          </button>
          <button className="btn btn-primary" onClick={openAdd}>+ New Event</button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <span>Event</span>
          <span>Date</span>
          <span>Type</span>
          <span>Entry</span>
          <span>Players</span>
          <span>Registration</span>
          <span>Actions</span>
        </div>

        {sorted.map((event) => {
          const isPast = event.date < today;
          const seatsLeft = event.playerLimit - event.registeredCount;
          const regOpen = event.registrationOpen !== false;
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
              <div>
                <button
                  className={`${styles.regToggleBtn} ${regOpen ? styles.regOpen : styles.regClosed}`}
                  onClick={() => toggleRegistration(event.slug, !regOpen)}
                  title={regOpen ? "Click to close registration" : "Click to open registration"}
                >
                  {regOpen ? "Open" : "Closed"}
                </button>
              </div>
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

      {/* ── Pre-Release Page Modal ── */}
      {showPRModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.draftsModal}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Pre-Release Page</h2>
              <button className={styles.closeBtn} onClick={() => setShowPRModal(false)}>✕</button>
            </div>

            {/* Tabs */}
            <div className={styles.prTabs}>
              <button
                className={`${styles.prTab} ${prTab === "edit" ? styles.prTabActive : ""}`}
                onClick={() => setPrTab("edit")}
              >
                Edit Page
              </button>
              <button
                className={`${styles.prTab} ${prTab === "drafts" ? styles.prTabActive : ""}`}
                onClick={() => setPrTab("drafts")}
              >
                Auto-Imported Drafts
                {pendingDrafts.length > 0 && (
                  <span className={styles.draftsBadge} style={{ marginLeft: 6 }}>{pendingDrafts.length}</span>
                )}
              </button>
            </div>

            {prTab === "edit" && (
              <>
              <form onSubmit={(e) => e.preventDefault()} className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Page Status</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prConfig.active}
                    className={`${styles.prToggle} ${prConfig.active ? styles.prToggleOn : ""}`}
                    onClick={() => setPrConfig((c) => ({ ...c, active: !c.active }))}
                  >
                    <span className={styles.prToggleThumb} />
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 600, color: prConfig.active ? "var(--color-green, #1a7a3a)" : "var(--color-text-light)" }}>
                    {prConfig.active ? "Live — page shows event content" : "Holding — page shows new event coming soon"}
                  </span>
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Auto-fill from Scryfall</label>
                {scryfallSets.length === 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12 }}
                      onClick={fetchScryfallSets}
                      disabled={scryfallLoading}
                    >
                      {scryfallLoading ? "Fetching…" : "Fetch Upcoming Sets"}
                    </button>
                    {scryfallError && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{scryfallError}</span>}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      className="form-input"
                      style={{ flex: 1, minWidth: 200 }}
                      value={selectedScryfallCode}
                      onChange={(e) => setSelectedScryfallCode(e.target.value)}
                    >
                      {scryfallSets.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name} — {s.released_at}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-primary" style={{ fontSize: 12 }} onClick={applyScryfallSet}>
                      Apply
                    </button>
                    <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => { setScryfallSets([]); setSelectedScryfallCode(""); }}>
                      Cancel
                    </button>
                  </div>
                )}
                <span style={{ fontSize: 11, color: "var(--color-text-light)", marginTop: 4, display: "block" }}>
                  Fills Set Name, pre-release Date, and Hero Image (first mythic art from the set). All other fields are cleared. Page status is preserved.
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Set Name *</label>
                <input
                  className="form-input"
                  value={prConfig.setName}
                  onChange={(e) => setPrConfig((c) => ({ ...c, setName: e.target.value }))}
                  placeholder="e.g. Aetherdrift, Bloomburrow…"
                />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Tagline</label>
                <input
                  className="form-input"
                  value={prConfig.tagline}
                  onChange={(e) => setPrConfig((c) => ({ ...c, tagline: e.target.value }))}
                  placeholder="Short teaser line shown under the set name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={prConfig.date}
                  onChange={(e) => setPrConfig((c) => ({ ...c, date: e.target.value }))}
                />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Time</label>
                <input
                  className="form-input"
                  value={prConfig.time}
                  onChange={(e) => setPrConfig((c) => ({ ...c, time: e.target.value }))}
                  placeholder="e.g. 2:00 PM"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={prConfig.description}
                  onChange={(e) => setPrConfig((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Event details shown on the pre-release page…"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Hero Image URL</label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    value={prConfig.imageUrl}
                    onChange={(e) => setPrConfig((c) => ({ ...c, imageUrl: e.target.value }))}
                    placeholder="https://… (set key art or banner)"
                  />
                  <span style={{ fontSize: 12, color: "var(--color-text-light)", flexShrink: 0 }}>or</span>
                  <label className={`btn btn-outline ${styles.uploadBtn}`} style={{ fontSize: 12, whiteSpace: "nowrap", cursor: prImageUploading ? "not-allowed" : "pointer" }}>
                    {prImageUploading ? "Uploading…" : "Upload ↑"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={prImageUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setPrImageUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                          const data = await res.json();
                          const url = data.uploaded?.[0]?.url;
                          if (url) setPrConfig((c) => ({ ...c, imageUrl: url }));
                          else showFlash(data.errors?.[0]?.error ?? "Upload failed", "error");
                        } catch {
                          showFlash("Upload failed", "error");
                        } finally {
                          setPrImageUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
                {prConfig.imageUrl && (
                  <div style={{ marginTop: 10 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prConfig.imageUrl}
                      alt="Hero image preview"
                      className={styles.prImagePreview}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = "block"; }}
                    />
                  </div>
                )}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Linked Event Slug <span style={{ fontWeight: 400, color: "var(--color-text-light)", fontSize: 12 }}>(optional)</span></label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    value={prConfig.eventSlug}
                    onChange={(e) => setPrConfig((c) => ({ ...c, eventSlug: e.target.value }))}
                    placeholder="Event slug for the Register Now button (leave blank to hide button)"
                  />
                  {prConfig.eventSlug && (
                    <Link
                      href={`/events/${prConfig.eventSlug}`}
                      target="_blank"
                      className="btn btn-outline"
                      style={{ fontSize: 12, whiteSpace: "nowrap" }}
                    >
                      Preview ↗
                    </Link>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "var(--color-text-light)", marginTop: 4, display: "block" }}>
                  Select from an existing event slug to link registration. Leave blank to show no register button.
                </span>
                {events.filter((e) => e.date >= today).length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {events.filter((e) => e.date >= today).map((e) => (
                      <button
                        key={e.slug}
                        type="button"
                        className="btn btn-outline"
                        style={{ fontSize: 11, padding: "3px 10px" }}
                        onClick={() => setPrConfig((c) => ({ ...c, eventSlug: e.slug }))}
                      >
                        {e.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div className={styles.modalFooter}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Link
                  href="/magic-mamas-pre-release"
                  target="_blank"
                  className="btn btn-outline"
                  style={{ fontSize: 12 }}
                >
                  View Page ↗
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setPrConfig(BLANK_PRERELEASE)}
                  style={{ fontSize: 12 }}
                >
                  Reset
                </button>
              </div>              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" onClick={() => setShowPRModal(false)} disabled={prSaving}>Cancel</button>
                <button className="btn btn-primary" onClick={savePrereleaseConfig} disabled={prSaving || !prConfig.setName}>
                  {prSaving ? "Saving…" : "Save Page"}
                </button>
              </div>
            </div>
              </>
            )}

            {prTab === "drafts" && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 0 4px" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: 12 }}
                    onClick={runImport}
                    disabled={runningImport}
                  >
                    {runningImport ? "Running…" : "Run Import Now"}
                  </button>
                </div>

                {drafts.length === 0 ? (
                  <p style={{ padding: "24px 0", color: "var(--color-text-light)", textAlign: "center", fontSize: 14 }}>
                    No drafts yet. Click &ldquo;Run Import Now&rdquo; to check for new sets.
                  </p>
                ) : (
                  <div className={styles.draftsList}>
                    {drafts.map((draft) => (
                      <div key={draft.id} className={`${styles.draftCard} ${draft.status !== "pending" ? styles.draftCardDim : ""}`}>
                        {draft.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={draft.imageUrl} alt={draft.setName} className={styles.draftThumb} />
                        )}
                        <div className={styles.draftInfo}>
                          <div className={styles.draftSetName}>{draft.setName}</div>
                          <div className={styles.draftMeta}>
                            Pre-release: <strong>{draft.prereleaseDate}</strong>
                            &nbsp;·&nbsp;Release: {draft.releaseDate}
                            &nbsp;·&nbsp;Source: {draft.source.toUpperCase()}
                          </div>
                          <div className={styles.draftMeta} style={{ marginTop: 2 }}>
                            Imported: {new Date(draft.createdAt).toLocaleDateString()}
                            &nbsp;·&nbsp;
                            <span className={`${styles.draftStatusBadge} ${styles[`draftStatus_${draft.status}`]}`}>
                              {draft.status}
                            </span>
                          </div>
                        </div>
                        <div className={styles.draftActions}>
                          {draft.status === "pending" && (
                            <>
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: 12 }}
                                disabled={approvingId === draft.id}
                                onClick={() => approveDraft(draft)}
                              >
                                {approvingId === draft.id ? "Approving…" : "Approve & Go Live"}
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{ fontSize: 12 }}
                                onClick={() => rejectDraft(draft)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-outline"
                            style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}
                            onClick={() => deleteDraft(draft.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Edit/Add Modal ── */}
      {editing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{isNew ? "New Event" : `Edit: ${editing.title}`}</h2>
              <button className={styles.closeBtn} onClick={() => setEditing(null)}>✕</button>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className={styles.formGrid}>
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
                <input type="number" min={0} step={0.01} className="form-input" value={editing.entryFee} onChange={(e) => changeField("entryFee", parseFloat(e.target.value) || 0)} />
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
                <label className="form-label">Featured</label>
                <select className="form-input" value={editing.featured ? "yes" : "no"} onChange={(e) => changeField("featured", e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes – show in spotlight</option>
                </select>
              </div>

              {/* ── Custom Questions Editor ── */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Custom Registration Questions</label>
                {(editing.customQuestions ?? []).map((q, idx) => (
                  <div key={q.id} className={styles.faqItem}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        className="form-input"
                        style={{ flex: 1 }}
                        value={q.label}
                        placeholder="Question text"
                        onChange={(e) => {
                          const qs = (editing.customQuestions ?? []).map((item, i) =>
                            i === idx ? { ...item, label: e.target.value } : item
                          );
                          changeField("customQuestions", qs);
                        }}
                      />
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, whiteSpace: "nowrap" }}>
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => {
                            const qs = (editing.customQuestions ?? []).map((item, i) =>
                              i === idx ? { ...item, required: e.target.checked } : item
                            );
                            changeField("customQuestions", qs);
                          }}
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        className={styles.faqRemoveBtn}
                        onClick={() => {
                          const qs = (editing.customQuestions ?? []).filter((_, i) => i !== idx);
                          changeField("customQuestions", qs);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: 8, fontSize: 12 }}
                  onClick={() => {
                    const newQ: CustomQuestion = { id: crypto.randomUUID(), label: "", required: false };
                    changeField("customQuestions", [...(editing.customQuestions ?? []), newQ]);
                  }}
                >
                  + Add Question
                </button>
              </div>

              {/* ── Add-Ons Editor ── */}
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Add-Ons (optional paid extras)</label>
                {(editing.addOns ?? []).map((addon, idx) => (
                  <div key={addon.id} className={styles.faqItem}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        className="form-input"
                        style={{ flex: 1 }}
                        value={addon.label}
                        placeholder="Add-on label (e.g. Extra Pack)"
                        onChange={(e) => {
                          const addons = (editing.addOns ?? []).map((a, i) =>
                            i === idx ? { ...a, label: e.target.value } : a
                          );
                          changeField("addOns", addons);
                        }}
                      />
                      <input
                        className="form-input"
                        style={{ width: 90 }}
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="Price"
                        value={addon.price}
                        onChange={(e) => {
                          const addons = (editing.addOns ?? []).map((a, i) =>
                            i === idx ? { ...a, price: parseFloat(e.target.value) || 0 } : a
                          );
                          changeField("addOns", addons);
                        }}
                      />
                      <button
                        type="button"
                        className={styles.faqRemoveBtn}
                        onClick={() => {
                          const addons = (editing.addOns ?? []).filter((_, i) => i !== idx);
                          changeField("addOns", addons);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginTop: 8, fontSize: 12 }}
                  onClick={() => {
                    const newAddon: EventAddOn = { id: crypto.randomUUID(), label: "", price: 0 };
                    changeField("addOns", [...(editing.addOns ?? []), newAddon]);
                  }}
                >
                  + Add Add-On
                </button>
              </div>

              {!isNew && (
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className="form-label">Registered Count (read-only — managed automatically)</label>
                  <input className="form-input" value={editing.registeredCount} readOnly style={{ background: "#f5f5f5", cursor: "not-allowed" }} />
                </div>
              )}
            </form>

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
