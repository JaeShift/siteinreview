"use client";

import { useState } from "react";
import Link from "next/link";
import type { MtgEvent, EventFormat, CustomQuestion } from "@/lib/events-data";
import styles from "./admin-events.module.css";

const FORMAT_OPTIONS: EventFormat[] = [
  "Commander", "Draft", "Standard", "Casual",
];

function slugify(str: string) {
  return str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function hasAutoHoldingExpired(date: string, time: string): boolean {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i);
  if (!date || !match) return false;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toLowerCase();
  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return false;

  const eventTime = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-07:00`);
  return Date.now() >= eventTime.getTime() + 72 * 60 * 60 * 1000;
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
    autoHoldAfter72Hours: true,
  };
}

interface Props {
  initialEvents: MtgEvent[];
}

export default function EventsAdminClient({ initialEvents }: Props) {
  const [events, setEvents] = useState<MtgEvent[]>(initialEvents);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshEvents() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) setEvents(await res.json());
    } finally {
      setRefreshing(false);
    }
  }
  const [editing, setEditing] = useState<MtgEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Pre-release event modal (edits the actual Prerelease-format event)
  const [showPRModal, setShowPRModal] = useState(false);
  const [prEvent, setPrEvent] = useState<MtgEvent | null>(null);
  const [prIsNew, setPrIsNew] = useState(false);
  const [prSaving, setPrSaving] = useState(false);
  const [prError, setPrError] = useState<string | null>(null);
  const [prImageUploading, setPrImageUploading] = useState(false);

  // Scryfall set picker + WPN image auto-fill
  const [scryfallSets, setScryfallSets] = useState<{ code: string; name: string; released_at: string }[]>([]);
  const [scryfallLoading, setScryfallLoading] = useState(false);
  const [scryfallError, setScryfallError] = useState<string | null>(null);
  const [selectedScryfallCode, setSelectedScryfallCode] = useState("");
  const [prImagesLoading, setPrImagesLoading] = useState(false);

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

    const release = new Date(set.released_at + "T12:00:00Z");
    release.setUTCDate(release.getUTCDate() - 7);
    const prereleaseDate = release.toISOString().split("T")[0];

    const existing = events.find(e => e.format === "Prerelease");
    setPrEvent((e) => ({
      ...(e ?? existing ?? makeEmpty()),
      format: "Prerelease",
      title: set.name,
      date: prereleaseDate,
      time: existing?.time || "",
      entryFee: NaN,
      imageUrl: "",
      shortDescription: "",
      description: "",
      slug: existing?.slug || slugify(set.name + "-prerelease"),
    }));
    setPrIsNew(!existing);
    setScryfallSets([]);
    setSelectedScryfallCode("");

    setPrImagesLoading(true);
    try {
      const res = await fetch(
        `/api/admin/prerelease/wpn-images?releaseDate=${set.released_at}&setName=${encodeURIComponent(set.name)}`
      );
      if (res.ok) {
        const data = await res.json() as { images: string[]; description: string };
        const imgs = data.images ?? [];
        // Index 3 is consistently the prerelease pack photo; fall back down the list if fewer images
        const heroImage = imgs[3] ?? imgs[2] ?? imgs[1] ?? imgs[0] ?? "";
        const bannerImage = imgs[2] ?? imgs[1] ?? imgs[0] ?? "";
        if (heroImage) setPrEvent((e) => e ? { ...e, imageUrl: heroImage, bannerImageUrl: bannerImage } : e);
        const shortDesc = `Be among the first to experience <em>Magic: The Gathering® | ${set.name}</em> at Kitsune Brewing\u00a0Co. Explore new cards, build your sealed deck, and play the set before its official release.`;
        const fullDesc = data.description?.trim()
          || `Experience the ${set.name} Prerelease at Kitsune Brewing Co.! Be among the first players in Phoenix to crack open the newest Magic: The Gathering set.`;
        setPrEvent((e) => e ? { ...e, shortDescription: shortDesc, description: fullDesc } : e);
      }
    } catch { /* silently skip */ }
    finally { setPrImagesLoading(false); }
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
    if (event.format === "Prerelease") {
      openPrerelease();
      return;
    }
    setIsNew(false);
    setEditing({ ...event });
  }

  function openPrerelease() {
    const existing = events.find(e => e.format === "Prerelease");
    if (existing) {
      setPrEvent({ ...existing });
      setPrIsNew(false);
    } else {
      setPrEvent({ ...makeEmpty(), format: "Prerelease", title: "", date: "", time: "", entryFee: NaN, hidden: true });
      setPrIsNew(true);
    }
    setScryfallSets([]);
    setSelectedScryfallCode("");
    setPrError(null);
    setShowPRModal(true);
  }

  async function savePrereleaseEvent() {
    if (!prEvent) return;
    const existingPrerelease = events.find((event) => event.format === "Prerelease");
    const isCreating = !existingPrerelease;
    if (prEvent.hidden && isCreating) {
      setShowPRModal(false);
      return;
    }
    if (!prEvent.hidden) {
      if (!prEvent.title.trim())            { setPrError("Set name / title is required."); return; }
      if (!prEvent.date)                    { setPrError("Date is required."); return; }
      if (!prEvent.time.trim())             { setPrError("Time is required."); return; }
      if (isNaN(prEvent.entryFee))          { setPrError("Entry fee is required."); return; }
      if (!Number.isFinite(prEvent.playerLimit) || prEvent.playerLimit < 1) {
        setPrError("Player limit is required.");
        return;
      }
      if (!prEvent.shortDescription.trim()) { setPrError("Short description is required."); return; }
      if (!prEvent.imageUrl.trim())         { setPrError("Hero image is required."); return; }
    }
    setPrError(null);
    setPrSaving(true);
    try {
      const eventToSave = existingPrerelease
        ? { ...prEvent, slug: existingPrerelease.slug }
        : prEvent;
      const url = isCreating
        ? "/api/admin/events"
        : `/api/admin/events/${existingPrerelease.slug}`;
      const method = isCreating ? "POST" : "PUT";
      const requestInit: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventToSave),
      };
      let res = await fetch(url, requestInit);
      if (method === "PUT" && res.status === 400) {
        const firstError = await res.clone().json().catch(() => ({}));
        if ((firstError as { error?: string }).error === "Invalid body") {
          res = await fetch(url, requestInit);
        }
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Request failed");
      }
      setEvents(await res.json());
      setShowPRModal(false);
      showFlash(prEvent.hidden ? "Pre-release page set to holding." : isCreating ? "Pre-release event created — page is now live." : "Pre-release event updated.");
    } catch (err) {
      showFlash(err instanceof Error ? err.message : "Failed to save.", "error");
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
    if (!Number.isFinite(editing.playerLimit) || editing.playerLimit < 1) {
      showFlash("Player limit must be at least 1.", "error");
      return;
    }
    if (editing.recurring && !editing.recurringUntil) {
      showFlash("Choose an end date for the recurring event.", "error");
      return;
    }
    if (
      editing.recurring &&
      editing.recurringUntil &&
      editing.recurringUntil < editing.date
    ) {
      showFlash("The recurrence end date cannot be before the first event.", "error");
      return;
    }
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
            onClick={refreshEvents}
            disabled={refreshing}
            title="Refresh registration counts"
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "inherit", fontSize: 22, padding: "0 16px", cursor: "pointer", opacity: refreshing ? 0.5 : 1, height: 52, minWidth: 52 }}
          >
            ↻
          </button>
          <button className="btn btn-primary" onClick={openAdd}>+ New Event</button>
          <button
            className={`btn btn-primary ${styles.prereleaseBtn}`}
            onClick={openPrerelease}
          >
            Pre-Release Event
            {events.some(e =>
              e.format === "Prerelease" &&
              !e.hidden &&
              (e.autoHoldAfter72Hours === false || !hasAutoHoldingExpired(e.date, e.time))
            )
              ? <span className={styles.prereleaseLiveDot} title="Page is live" />
              : <span className={`${styles.prereleaseLiveDot} ${styles.prereleaseLiveDotHolding}`} title="No upcoming prerelease — page shows holding" />
            }
          </button>
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
                <Link href={event.format === "Prerelease" ? "/pre-release" : `/events/${event.slug}`} target="_blank" className={styles.actionLink} title="View public page">↗</Link>
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

      {/* ── Pre-Release Event Modal ── */}
      {showPRModal && prEvent && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.draftsModal}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {prIsNew ? "New Pre-Release Event" : `Edit: ${prEvent.title || "Pre-Release Event"}`}
              </h2>
              <button className={styles.closeBtn} onClick={() => setShowPRModal(false)}>✕</button>
            </div>


            <div className={styles.draftsModalBody}>
            <form onSubmit={(e) => e.preventDefault()} className={styles.formGrid}>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Page Status</label>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setPrEvent((ev) => ev ? { ...ev, hidden: false } : ev)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 6, border: "1.5px solid",
                      fontWeight: 600, fontSize: 13, cursor: "pointer",
                      background: !prEvent.hidden ? "#16a34a" : "transparent",
                      color: !prEvent.hidden ? "#fff" : "var(--color-text-light)",
                      borderColor: !prEvent.hidden ? "#16a34a" : "var(--color-border)",
                    }}
                  >Live</button>
                  <button
                    type="button"
                    onClick={() => setPrEvent((ev) => ev ? { ...ev, hidden: true } : ev)}
                    style={{
                      flex: 1, padding: "8px 0", borderRadius: 6, border: "1.5px solid",
                      fontWeight: 600, fontSize: 13, cursor: "pointer",
                      background: prEvent.hidden ? "#d97706" : "transparent",
                      color: prEvent.hidden ? "#fff" : "var(--color-text-light)",
                      borderColor: prEvent.hidden ? "#d97706" : "var(--color-border)",
                    }}
                  >No Current Event</button>
                </div>
              </div>

              {!prEvent.hidden && (
                <>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                      onClick={() => setPrEvent((ev) => ev ? { ...ev, autoHoldAfter72Hours: ev.autoHoldAfter72Hours !== false ? false : true } : ev)}
                    >
                      <span className={`${styles.toggleTrack} ${prEvent.autoHoldAfter72Hours !== false ? styles.toggleTrackOn : ""}`}>
                        <span className={styles.toggleThumb} />
                      </span>
                      <span style={{ fontSize: 13 }}>
                        <span className="form-label" style={{ display: "inline", marginRight: 6 }}>Auto-Hold</span>
                        <span style={{ color: "var(--color-text-light)", fontWeight: 400 }}>— automatically returns page to &ldquo;No Current Event&rdquo; 72 hours after event time</span>
                      </span>
                    </label>
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className="form-label">Auto-fill</label>
                    {scryfallSets.length === 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={fetchScryfallSets} disabled={scryfallLoading}>
                          {scryfallLoading ? "Fetching…" : "Fetch Upcoming Sets"}
                        </button>
                        {scryfallError && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{scryfallError}</span>}
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <select className="form-input" style={{ flex: 1, minWidth: 200 }} value={selectedScryfallCode} onChange={(e) => setSelectedScryfallCode(e.target.value)}>
                          {scryfallSets.map((s) => (
                            <option key={s.code} value={s.code}>{s.name} — {s.released_at}</option>
                          ))}
                        </select>
                        <button type="button" className="btn btn-primary" style={{ fontSize: 12 }} onClick={applyScryfallSet}>Apply</button>
                        <button type="button" className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => { setScryfallSets([]); setSelectedScryfallCode(""); }}>Cancel</button>
                      </div>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>Set Name / Title *</label>
                      {prError === "Set name / title is required." && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{prError}</span>}
                    </div>
                    <input
                      className="form-input"
                      value={prEvent.title}
                      onChange={(e) => { setPrError(null); setPrEvent((ev) => ev ? { ...ev, title: e.target.value, slug: prIsNew ? slugify(e.target.value + "-prerelease") : ev.slug } : ev); }}
                      placeholder="e.g. Aetherdrift, Bloomburrow…"
                    />
                  </div>
                  <div />

                  <div className={styles.formGroup}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>Entry Fee ($) *</label>
                      {prError === "Entry fee is required." && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{prError}</span>}
                    </div>
                    <input
                      type="number" min={0} step={0.01} className="form-input"
                      value={isNaN(prEvent.entryFee) ? "" : prEvent.entryFee}
                      placeholder="e.g. 30"
                      onChange={(e) => { setPrError(null); setPrEvent((ev) => ev ? { ...ev, entryFee: parseFloat(e.target.value) } : ev); }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>Player Limit</label>
                      {prError === "Player limit is required." && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{prError}</span>}
                    </div>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={Number.isFinite(prEvent.playerLimit) ? prEvent.playerLimit : ""}
                      onChange={(e) => {
                        setPrError(null);
                        const value = e.target.value === "" ? Number.NaN : Number.parseInt(e.target.value, 10);
                        setPrEvent((ev) => ev ? { ...ev, playerLimit: value } : ev);
                      }}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>Date *</label>
                      {prError === "Date is required." && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{prError}</span>}
                    </div>
                    <input type="date" className="form-input" value={prEvent.date}
                      onChange={(e) => { setPrError(null); setPrEvent((ev) => ev ? { ...ev, date: e.target.value } : ev); }} />
                  </div>

                  <div className={styles.formGroup}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>Time *</label>
                      {prError === "Time is required." && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{prError}</span>}
                    </div>
                    <input className="form-input" value={prEvent.time}
                      onChange={(e) => { setPrError(null); setPrEvent((ev) => ev ? { ...ev, time: e.target.value } : ev); }}
                      placeholder="e.g. 2:00 PM" />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>Short Event Description *</label>
                      <span style={{ fontSize: 11, color: "var(--color-muted, #888)", whiteSpace: "nowrap", textTransform: "none", fontFamily: "var(--font-body, sans-serif)", fontWeight: 400 }}>&lt;em&gt; will italicize text</span>
                      {prError === "Short description is required." && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)", whiteSpace: "nowrap" }}>{prError}</span>}
                    </div>
                    <textarea className="form-input" rows={3}
                      value={prEvent.shortDescription}
                      onChange={(e) => { setPrError(null); setPrEvent((ev) => ev ? { ...ev, shortDescription: e.target.value } : ev); }}
                      placeholder="Brief description shown on the pre-release page…" />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className="form-label">Full Set Description *</label>
                    <textarea className="form-input" rows={5}
                      value={prEvent.description}
                      onChange={(e) => setPrEvent((ev) => ev ? { ...ev, description: e.target.value } : ev)}
                      placeholder="Full event details pulled from WPN, or write your own…" />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>Pre-Release Image *</label>
                      {prError === "Hero image is required." && <span style={{ fontSize: 12, color: "var(--color-red, #c0392b)" }}>{prError}</span>}
                    </div>
                    {prImagesLoading && <p style={{ fontSize: 13, color: "var(--color-text-light)", margin: "6px 0" }}>Fetching WPN images…</p>}

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input className="form-input" style={{ flex: 1 }} value={prEvent.imageUrl}
                        onChange={(e) => { setPrError(null); setPrEvent((ev) => ev ? { ...ev, imageUrl: e.target.value } : ev); }}
                        placeholder="https://… (set key art or banner)" />
                      <span style={{ fontSize: 12, color: "var(--color-text-light)", flexShrink: 0 }}>or</span>
                      <label className={`btn btn-outline ${styles.uploadBtn}`} style={{ fontSize: 12, whiteSpace: "nowrap", cursor: prImageUploading ? "not-allowed" : "pointer" }}>
                        {prImageUploading ? "Uploading…" : "Upload ↑"}
                        <input type="file" accept="image/*" style={{ display: "none" }} disabled={prImageUploading}
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
                              if (url) setPrEvent((ev) => ev ? { ...ev, imageUrl: url } : ev);
                              else showFlash(data.errors?.[0]?.error ?? "Upload failed", "error");
                            } catch { showFlash("Upload failed", "error"); }
                            finally { setPrImageUploading(false); e.target.value = ""; }
                          }} />
                      </label>
                    </div>
                    {prEvent.imageUrl && (
                      <div style={{ marginTop: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={prEvent.imageUrl} alt="Preview" className={styles.prImagePreview}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = "block"; }} />
                      </div>
                    )}
                  </div>

                </>
              )}

            </form>
            </div>

            <div className={styles.modalFooter}>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" onClick={() => setShowPRModal(false)} disabled={prSaving}>Cancel</button>
                <button className="btn btn-primary" onClick={savePrereleaseEvent} disabled={prSaving}>
                  {prSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
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
              <div className={styles.formGroup}>
                <label className="form-label">Title *</label>
                <input className="form-input" value={editing.title} onChange={(e) => changeField("title", e.target.value)} placeholder="e.g. Friday Night Commander" />
              </div>
              <div />

              <div className={styles.formGroup}>
                <label className="form-label">Entry Fee ($)</label>
                <input type="number" min={0} step={0.01} className="form-input" value={editing.entryFee} onChange={(e) => changeField("entryFee", parseFloat(e.target.value) || 0)} />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Player Limit</label>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={Number.isFinite(editing.playerLimit) ? editing.playerLimit : ""}
                  onChange={(e) => changeField(
                    "playerLimit",
                    e.target.value === "" ? Number.NaN : Number.parseInt(e.target.value, 10)
                  )}
                />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={editing.date} onChange={(e) => changeField("date", e.target.value)} />
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Time</label>
                <input className="form-input" value={editing.time} onChange={(e) => changeField("time", e.target.value)} placeholder="6:00 PM" />
              </div>

              {editing.format !== "Prerelease" && (
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className="form-label">Slug (URL key)</label>
                  <input className="form-input" value={editing.slug} onChange={(e) => changeField("slug", e.target.value)} placeholder="auto-generated from title" />
                </div>
              )}

              {editing.format !== "Prerelease" && (
                <div className={styles.formGroup}>
                  <label className="form-label">Format *</label>
                  <select className="form-input" value={editing.format} onChange={(e) => changeField("format", e.target.value as EventFormat)}>
                    {FORMAT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              )}

              {editing.format !== "Prerelease" && (
                <div className={styles.formGroup}>
                  <label className="form-label">End Time</label>
                  <input className="form-input" value={editing.endTime} onChange={(e) => changeField("endTime", e.target.value)} placeholder="10:00 PM" />
                </div>
              )}


              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Short Description</label>
                <input className="form-input" value={editing.shortDescription} onChange={(e) => changeField("shortDescription", e.target.value)} placeholder="One-line teaser shown on the events list" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Full Description</label>
                <textarea className="form-input" rows={4} value={editing.description} onChange={(e) => changeField("description", e.target.value)} placeholder="Full event details, rules, etc." />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Event Image</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <label
                    className={`btn btn-outline ${styles.uploadBtn}`}
                    style={{
                      cursor: imageUploading ? "not-allowed" : "pointer",
                    }}
                  >
                    {imageUploading
                      ? "Uploading…"
                      : editing.imageUrl
                        ? "Replace Image ↑"
                        : "Upload Image ↑"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={imageUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageUploading(true);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const response = await fetch("/api/admin/upload", {
                            method: "POST",
                            body: formData,
                          });
                          const data = await response.json();
                          const url = data.uploaded?.[0]?.url;
                          if (response.ok && url) {
                            changeField("imageUrl", url);
                          } else {
                            showFlash(data.errors?.[0]?.error ?? "Upload failed", "error");
                          }
                        } catch {
                          showFlash("Upload failed", "error");
                        } finally {
                          setImageUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  {editing.imageUrl && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => changeField("imageUrl", "")}
                      disabled={imageUploading}
                    >
                      Delete Image
                    </button>
                  )}
                </div>
                {editing.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editing.imageUrl}
                    alt="Event preview"
                    className={styles.prImagePreview}
                  />
                )}
              </div>

              {editing.format !== "Prerelease" && (
                <div className={styles.formGroup}>
                  <label className="form-label">Recurring</label>
                  <select
                    className="form-input"
                    value={editing.recurring ?? ""}
                    onChange={(e) => {
                      const recurring = e.target.value || undefined;
                      setEditing((current) => current
                        ? {
                            ...current,
                            recurring: recurring as MtgEvent["recurring"],
                            recurringUntil: recurring ? current.recurringUntil : undefined,
                          }
                        : current
                      );
                    }}
                  >
                    <option value="">None</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              {editing.format !== "Prerelease" && editing.recurring && (
                <div className={styles.formGroup}>
                  <label className="form-label">Repeat Until</label>
                  <input
                    type="date"
                    min={editing.date}
                    className="form-input"
                    value={editing.recurringUntil ?? ""}
                    onChange={(e) => changeField("recurringUntil", e.target.value)}
                    required
                  />
                </div>
              )}


              <div className={styles.formGroup}>
                <label className="form-label">Featured</label>
                <select className="form-input" value={editing.featured ? "yes" : "no"} onChange={(e) => changeField("featured", e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes – show in spotlight</option>
                </select>
              </div>

              {/* ── Custom Questions Editor ── */}
              {editing.format !== "Prerelease" && (
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
              )}

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
