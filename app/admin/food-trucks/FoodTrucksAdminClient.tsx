"use client";

import { useState } from "react";
import type { FoodTruck, FoodTruckScheduleEntry } from "@/lib/food-trucks-data";
import styles from "./admin-trucks.module.css";

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function makeEmptyTruck(): FoodTruck {
  return {
    id: "",
    name: "",
    cuisine: "",
    description: "",
    imageUrl: "",
    website: "",
    instagram: "",
    menuUrl: "",
    phone: "",
    schedule: [],
  };
}

function makeEmptyEntry(): FoodTruckScheduleEntry {
  return {
    date: new Date().toISOString().split("T")[0],
    startTime: "5:00 PM",
    endTime: "9:00 PM",
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

interface Props {
  initialTrucks: FoodTruck[];
}

export default function FoodTrucksAdminClient({ initialTrucks }: Props) {
  const [trucks, setTrucks] = useState<FoodTruck[]>(initialTrucks);
  const [editingTruck, setEditingTruck] = useState<FoodTruck | null>(null);
  const [isNewTruck, setIsNewTruck] = useState(false);
  const [addingSchedule, setAddingSchedule] = useState<{ truckId: string; entry: FoodTruckScheduleEntry } | null>(null);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const allEntries = trucks
    .flatMap((t) => t.schedule.map((e) => ({ truck: t, entry: e })))
    .sort((a, b) => a.entry.date.localeCompare(b.entry.date));

  function showFlash(msg: string, type: "success" | "error" = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3500);
  }

  // ── Truck CRUD ──────────────────────────────────────────────────────────

  function openAddTruck() {
    setIsNewTruck(true);
    setEditingTruck(makeEmptyTruck());
  }

  function openEditTruck(truck: FoodTruck) {
    setIsNewTruck(false);
    setEditingTruck({ ...truck });
  }

  function changeTruckField(field: keyof FoodTruck, value: unknown) {
    setEditingTruck((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      if (isNewTruck && field === "name") updated.id = slugify(value as string);
      return updated;
    });
  }

  async function handleSaveTruck() {
    if (!editingTruck) return;
    setSaving(true);
    try {
      const url = isNewTruck ? "/api/admin/food-trucks" : `/api/admin/food-trucks/${editingTruck.id}`;
      const method = isNewTruck ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTruck),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setTrucks(await res.json());
      setEditingTruck(null);
      showFlash(isNewTruck ? "Truck added." : "Truck updated.");
    } catch (err) {
      showFlash(err instanceof Error ? err.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTruck(id: string, name: string) {
    if (!confirm(`Remove "${name}" and all their scheduled visits?`)) return;
    try {
      const res = await fetch(`/api/admin/food-trucks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTrucks(await res.json());
      showFlash("Truck removed.");
    } catch {
      showFlash("Failed to remove truck.", "error");
    }
  }

  // ── Schedule entry CRUD ─────────────────────────────────────────────────

  function openAddSchedule(truckId: string) {
    setAddingSchedule({ truckId, entry: makeEmptyEntry() });
  }

  async function handleAddScheduleEntry() {
    if (!addingSchedule) return;
    const { truckId, entry } = addingSchedule;
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;
    setSaving(true);
    try {
      const updated: FoodTruck = { ...truck, schedule: [...truck.schedule, entry] };
      const res = await fetch(`/api/admin/food-trucks/${truckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setTrucks(await res.json());
      setAddingSchedule(null);
      showFlash("Schedule entry added.");
    } catch {
      showFlash("Failed to add schedule entry.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteScheduleEntry(truckId: string, entryDate: string) {
    if (!confirm(`Remove visit on ${formatDate(entryDate)}?`)) return;
    const truck = trucks.find((t) => t.id === truckId);
    if (!truck) return;
    try {
      const updated: FoodTruck = { ...truck, schedule: truck.schedule.filter((e) => e.date !== entryDate) };
      const res = await fetch(`/api/admin/food-trucks/${truckId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setTrucks(await res.json());
      showFlash("Schedule entry removed.");
    } catch {
      showFlash("Failed to remove entry.", "error");
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {flash && (
        <div className={`${styles.flash} ${flash.type === "error" ? styles.flashError : styles.flashSuccess}`}>
          {flash.msg}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Food Trucks</h1>
          <p className={styles.subtitle}>{trucks.length} truck partners · {allEntries.length} scheduled visits</p>
        </div>
        <button className="btn btn-primary" onClick={openAddTruck}>+ Add Truck</button>
      </div>

      {/* ── Truck directory ── */}
      <section>
        <h2 className={styles.sectionTitle}>Truck Partners</h2>
        <div className={styles.truckGrid}>
          {trucks.map((truck) => (
            <div key={truck.id} className={styles.truckCard}>
              <div className={styles.truckCardHeader}>
                <div>
                  <span className={styles.truckName}>{truck.name}</span>
                  <span className={styles.truckCuisine}>{truck.cuisine}</span>
                </div>
                <div className={styles.truckCardActions}>
                  <button className={styles.editBtn} onClick={() => openEditTruck(truck)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteTruck(truck.id, truck.name)}>Remove</button>
                </div>
              </div>
              <p className={styles.truckDesc}>{truck.description}</p>
              <div className={styles.truckMeta}>
                <span>{truck.schedule.length} visits scheduled</span>
                {truck.instagram && (
                  <a href={truck.instagram} target="_blank" rel="noopener noreferrer" className={styles.truckLink}>
                    Instagram ↗
                  </a>
                )}
                <button className={styles.addScheduleBtn} onClick={() => openAddSchedule(truck.id)}>
                  + Add Visit
                </button>
              </div>
            </div>
          ))}

          {trucks.length === 0 && (
            <p className={styles.emptyMsg}>No truck partners yet.</p>
          )}
        </div>
      </section>

      {/* ── Schedule table ── */}
      <section>
        <h2 className={styles.sectionTitle}>Full Schedule</h2>
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <span>Date</span>
            <span>Truck</span>
            <span>Cuisine</span>
            <span>Hours</span>
            <span>Actions</span>
          </div>
          {allEntries.map(({ truck, entry }) => {
            const isPast = entry.date < today;
            const isToday = entry.date === today;
            return (
              <div
                key={`${truck.id}-${entry.date}`}
                className={`${styles.tableRow} ${isPast ? styles.pastRow : ""} ${isToday ? styles.todayRow : ""}`}
              >
                <div className={styles.dateCell}>
                  <span className={styles.dateStr}>{formatDate(entry.date)}</span>
                  {isToday && <span className={styles.todayBadge}>Today</span>}
                </div>
                <span className={styles.truckNameCell}>{truck.name}</span>
                <span className={styles.cuisineCell}>{truck.cuisine}</span>
                <span className={styles.hoursCell}>{entry.startTime} – {entry.endTime}</span>
                <div className={styles.actionsCell}>
                  <button
                    className={`${styles.actionLink} ${styles.deleteLink}`}
                    onClick={() => handleDeleteScheduleEntry(truck.id, entry.date)}
                    title="Remove this visit"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
          {allEntries.length === 0 && (
            <div className={styles.emptyRow}>No visits scheduled. Use &ldquo;+ Add Visit&rdquo; on a truck card above.</div>
          )}
        </div>
      </section>

      {/* ── Truck Edit Modal ── */}
      {editingTruck && (
        <div className={styles.modalOverlay} onClick={() => setEditingTruck(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{isNewTruck ? "Add Truck Partner" : `Edit: ${editingTruck.name}`}</h2>
              <button className={styles.closeBtn} onClick={() => setEditingTruck(null)}>✕</button>
            </div>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Truck Name *</label>
                <input className="form-input" value={editingTruck.name} onChange={(e) => changeTruckField("name", e.target.value)} placeholder="e.g. Lucky Boy" />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">ID (URL key)</label>
                <input className="form-input" value={editingTruck.id} onChange={(e) => changeTruckField("id", e.target.value)} placeholder="auto-generated from name" />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Cuisine *</label>
                <input className="form-input" value={editingTruck.cuisine} onChange={(e) => changeTruckField("cuisine", e.target.value)} placeholder="e.g. Mexican Street Food" />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Phone</label>
                <input className="form-input" value={editingTruck.phone ?? ""} onChange={(e) => changeTruckField("phone", e.target.value)} placeholder="(602) 555-0100" />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={editingTruck.description} onChange={(e) => changeTruckField("description", e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Image URL</label>
                <input className="form-input" value={editingTruck.imageUrl} onChange={(e) => changeTruckField("imageUrl", e.target.value)} placeholder="https://…" />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Website</label>
                <input className="form-input" value={editingTruck.website ?? ""} onChange={(e) => changeTruckField("website", e.target.value)} placeholder="https://…" />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Instagram URL</label>
                <input className="form-input" value={editingTruck.instagram ?? ""} onChange={(e) => changeTruckField("instagram", e.target.value)} placeholder="https://instagram.com/…" />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Menu URL</label>
                <input className="form-input" value={editingTruck.menuUrl ?? ""} onChange={(e) => changeTruckField("menuUrl", e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={() => setEditingTruck(null)} disabled={saving}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveTruck}
                disabled={saving || !editingTruck.name || !editingTruck.id || !editingTruck.cuisine}
              >
                {saving ? "Saving…" : isNewTruck ? "Add Truck" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Schedule Entry Modal ── */}
      {addingSchedule && (
        <div className={styles.modalOverlay} onClick={() => setAddingSchedule(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Add Visit — {trucks.find((t) => t.id === addingSchedule.truckId)?.name}
              </h2>
              <button className={styles.closeBtn} onClick={() => setAddingSchedule(null)}>✕</button>
            </div>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={addingSchedule.entry.date}
                  onChange={(e) =>
                    setAddingSchedule((prev) => prev ? { ...prev, entry: { ...prev.entry, date: e.target.value } } : null)
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Start Time</label>
                <input
                  className="form-input"
                  value={addingSchedule.entry.startTime}
                  onChange={(e) =>
                    setAddingSchedule((prev) => prev ? { ...prev, entry: { ...prev.entry, startTime: e.target.value } } : null)
                  }
                  placeholder="5:00 PM"
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">End Time</label>
                <input
                  className="form-input"
                  value={addingSchedule.entry.endTime}
                  onChange={(e) =>
                    setAddingSchedule((prev) => prev ? { ...prev, entry: { ...prev.entry, endTime: e.target.value } } : null)
                  }
                  placeholder="9:00 PM"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={() => setAddingSchedule(null)} disabled={saving}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleAddScheduleEntry}
                disabled={saving || !addingSchedule.entry.date}
              >
                {saving ? "Saving…" : "Add Visit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
