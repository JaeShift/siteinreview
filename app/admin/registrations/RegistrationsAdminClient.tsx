"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MtgEvent } from "@/lib/events-data";
import type { Registration } from "@/lib/store";
import styles from "./admin-registrations.module.css";

type StatusFilter = "all" | "confirmed" | "waitlisted" | "cancelled" | "refunded";

interface Props {
  initialRegistrations: Registration[];
  events: MtgEvent[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function exportCsv(registrations: Registration[]) {
  const headers = [
    "ID",
    "Event",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Status",
    "Checked In",
    "Check-in Time",
    "Table",
    "Notes",
    "Registered At",
  ];
  const rows = registrations.map((r) => [
    r.id,
    r.eventSlug,
    r.firstName,
    r.lastName,
    r.email,
    r.phone,
    r.status === "confirmed" && (r.amountPaid ?? 0) > 0 ? "paid" : r.status,
    r.checkedIn ? "Yes" : "No",
    r.checkedInAt ?? "",
    r.tableAssignment ?? "",
    r.notes ?? "",
    r.createdAt,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `registrations-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface AddForm {
  eventSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  status: Registration["status"];
  tableAssignment: string;
}

export default function RegistrationsAdminClient({ initialRegistrations, events }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [flash, setFlash] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>({
    eventSlug: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
    status: "confirmed",
    tableAssignment: "",
  });
  const [addSaving, setAddSaving] = useState(false);
  const [deletedRegistration, setDeletedRegistration] = useState<Registration | null>(null);
  const [printedAt, setPrintedAt] = useState("");
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  function showFlash(msg: string, type: "success" | "error" = "success") {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 3500);
  }

  function handlePrint() {
    setPrintedAt(
      new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    );
    setTimeout(() => window.print(), 0);
  }

  const filtered = useMemo(() => {
    let result = [...registrations];
    if (selectedEvent !== "all") result = result.filter((r) => r.eventSlug === selectedEvent);
    if (statusFilter !== "all") result = result.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.firstName.toLowerCase().includes(q) ||
          r.lastName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [registrations, selectedEvent, statusFilter, search]);

  const stats = useMemo(() => {
    const base = selectedEvent === "all" ? registrations : registrations.filter((r) => r.eventSlug === selectedEvent);
    return {
      total: base.length,
      confirmed: base.filter((r) => r.status === "confirmed").length,
      waitlisted: base.filter((r) => r.status === "waitlisted").length,
      refunded: base.filter((r) => r.status === "refunded").length,
      checkedIn: base.filter((r) => r.checkedIn).length,
    };
  }, [registrations, selectedEvent]);

  const printEvent =
    selectedEvent === "all"
      ? null
      : events.find((event) => event.slug === selectedEvent) ?? null;

  async function toggleCheckIn(reg: Registration) {
    const newVal = !reg.checkedIn;
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkedIn: newVal }),
      });
      if (!res.ok) throw new Error();
      const updated: Registration = await res.json();
      setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      showFlash("Failed to update check-in.", "error");
    }
  }

  async function updateTable(reg: Registration, tableAssignment: string) {
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableAssignment }),
      });
      if (!res.ok) throw new Error();
      const updated: Registration = await res.json();
      setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      showFlash("Failed to update table.", "error");
    }
  }

  async function promoteToConfirmed(reg: Registration) {
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      if (!res.ok) throw new Error();
      const updated: Registration = await res.json();
      setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showFlash("Promoted to confirmed.");
    } catch {
      showFlash("Failed to promote.", "error");
    }
  }

  async function handleDelete(reg: Registration) {
    if (!confirm(`Delete registration for ${reg.firstName} ${reg.lastName}?`)) return;
    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      setDeletedRegistration(reg);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setDeletedRegistration(null);
        undoTimerRef.current = null;
      }, 10000);
    } catch {
      showFlash("Failed to delete.", "error");
    }
  }

  async function refundAndDelete(reg: Registration) {
    const amount = ((reg.amountPaid ?? 0) / 100).toFixed(2);
    const approved = confirm(
      `REFUND DISCLAIMER\n\nYou are about to refund $${amount} to ${reg.firstName} ${reg.lastName} and mark their registration as refunded.\n\nThis action cannot be undone. The refund will be returned to the original payment method and may take 5–10 business days to appear.\n\nAre you sure you want to issue this refund?`
    );
    if (!approved) return;

    try {
      const res = await fetch(`/api/admin/registrations/${reg.id}/refund`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to issue refund");

      const updated: Registration = data.registration;
      setRegistrations((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      if (data.emailSent === false) {
        showFlash(data.warning, "error");
        return;
      }
      showFlash(
        data.refundStatus === "pending"
          ? "Refund submitted and registration marked refunded."
          : "Refund issued and registration marked refunded."
      );
    } catch (err) {
      showFlash(err instanceof Error ? err.message : "Failed to issue refund.", "error");
    }
  }

  async function undoDelete() {
    if (!deletedRegistration) return;
    const registration = deletedRegistration;

    try {
      const res = await fetch("/api/admin/registrations/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registration),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");

      const restored: Registration = await res.json();
      setRegistrations((prev) =>
        prev.some((r) => r.id === restored.id) ? prev : [restored, ...prev]
      );
      setDeletedRegistration(null);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
      showFlash("Registration restored.");
    } catch (err) {
      showFlash(err instanceof Error ? err.message : "Failed to restore registration.", "error");
    }
  }

  async function handleAdd() {
    if (!addForm.eventSlug || !addForm.firstName || !addForm.lastName || !addForm.email || !addForm.phone) {
      showFlash("Please fill in all required fields.", "error");
      return;
    }
    setAddSaving(true);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const created: Registration = await res.json();
      setRegistrations((prev) => [created, ...prev]);
      setAddOpen(false);
      setAddForm({
        eventSlug: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
        status: "confirmed",
        tableAssignment: "",
      });
      showFlash("Registration added.");
    } catch (err) {
      showFlash(err instanceof Error ? err.message : "Failed to add registration.", "error");
    } finally {
      setAddSaving(false);
    }
  }

  function getEventLabel(slug: string) {
    const event = events.find((e) => e.slug === slug);
    if (!event) return slug;
    const date = new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    return `${event.title} — ${date}`;
  }

  return (
    <div className={styles.page}>
      <section className={styles.printSheet}>
        <header className={styles.printHeader}>
          <Image
            src="/images/logo.png"
            alt="Kitsune Brewing Co."
            width={88}
            height={88}
            className={styles.printLogo}
          />
          <div className={styles.printBrand}>
            <span>Kitsune Brewing Co.</span>
            <h1>Event Check-In</h1>
          </div>
        </header>

        <div className={styles.printEvent}>
          <div>
            <span className={styles.printEyebrow}>Event</span>
            <h2>{printEvent?.title ?? "All Event Registrations"}</h2>
          </div>
          <div className={styles.printMeta}>
            <div>
              <span>Date</span>
              <strong>
                {printEvent
                  ? new Date(`${printEvent.date}T00:00:00`).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Multiple dates"}
              </strong>
            </div>
            <div>
              <span>Start Time</span>
              <strong>{printEvent?.time ?? "Multiple times"}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{printEvent?.location ?? "Kitsune Brewing Co."}</strong>
            </div>
          </div>
        </div>

        <div className={styles.printListHeader}>
          <span>Attendee List</span>
          <span>{filtered.length} attendee{filtered.length === 1 ? "" : "s"}</span>
        </div>

        <div className={styles.printTable}>
          <div className={styles.printTableHeader}>
            <span>In</span>
            <span>Attendee</span>
            <span>Event</span>
            <span>Contact</span>
            <span>Status</span>
          </div>
          {filtered.map((registration) => (
            <div key={registration.id} className={styles.printTableRow}>
              <span className={styles.printCheckbox} aria-hidden="true" />
              <div className={styles.printAttendee}>
                <strong>{registration.firstName} {registration.lastName}</strong>
                {registration.tableAssignment && (
                  <span>Table {registration.tableAssignment}</span>
                )}
              </div>
              <span>{getEventLabel(registration.eventSlug)}</span>
              <div className={styles.printContact}>
                <span>{registration.email}</span>
                <span>{registration.phone}</span>
              </div>
              <strong className={styles.printStatus}>
                {registration.status === "confirmed" && (registration.amountPaid ?? 0) > 0
                  ? "Paid"
                  : registration.status}
              </strong>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className={styles.printEmpty}>No registrations match the current filters.</div>
          )}
        </div>

        <footer className={styles.printFooter}>
          <span>3321 E Bell Rd Suite B-5 · Phoenix, AZ 85032</span>
          <span>{printedAt ? `Printed ${printedAt}` : ""}</span>
        </footer>
      </section>

      {flash && (
        <div className={`${styles.flash} ${flash.type === "error" ? styles.flashError : styles.flashSuccess}`}>
          {flash.msg}
        </div>
      )}
      {deletedRegistration && (
        <div className={styles.undoToast} role="status">
          <span>
            {deletedRegistration.firstName} {deletedRegistration.lastName} deleted
          </span>
          <button type="button" className={styles.undoBtn} onClick={undoDelete}>
            Undo
          </button>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Registrations</h1>
          <p className={styles.subtitle}>{registrations.length} total registrations</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-outline" onClick={handlePrint}>Print</button>
          <button className="btn btn-outline" onClick={() => exportCsv(filtered)}>Export CSV</button>
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>+ Add Registration</button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{stats.total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{stats.confirmed}</span>
          <span className={styles.statLabel}>Confirmed</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{stats.waitlisted}</span>
          <span className={styles.statLabel}>Waitlisted</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{stats.refunded}</span>
          <span className={styles.statLabel}>Refunded</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{stats.checkedIn}</span>
          <span className={styles.statLabel}>Checked In</span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <select
          className={styles.eventSelect}
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="all">All Events</option>
          {events.map((ev) => (
            <option key={ev.slug} value={ev.slug}>
              {ev.title} ({ev.date})
            </option>
          ))}
        </select>

        <input
          className={styles.searchInput}
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.filterTabs}>
          {(["all", "confirmed", "waitlisted", "cancelled", "refunded"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              className={`${styles.filterTab} ${statusFilter === s ? styles.filterTabActive : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <span>Attendee</span>
          <span>Event</span>
          <span>Registered</span>
          <span>Status</span>
          <span>Check-in</span>
          <span>Actions</span>
        </div>

        {filtered.map((reg) => (
          <div key={reg.id} className={styles.tableRow}>
            <div className={styles.nameCell}>
              <span className={styles.nameMain}>{reg.firstName} {reg.lastName}</span>
              <span className={styles.nameSub}>{reg.email} · {reg.phone}</span>
            </div>
            <span className={styles.eventCell}>{getEventLabel(reg.eventSlug)}</span>
            <span className={styles.dateCell}>{formatDate(reg.createdAt)}</span>
            <span
              className={`${styles.statusBadge} ${
                reg.status === "confirmed"
                  ? styles.statusConfirmed
                  : reg.status === "waitlisted"
                  ? styles.statusWaitlisted
                  : reg.status === "refunded"
                  ? styles.statusRefunded
                  : styles.statusCancelled
              }`}
            >
              {reg.status === "confirmed" && (reg.amountPaid ?? 0) > 0
                ? "paid"
                : reg.status}
            </span>
            <div className={styles.checkinCell}>
              <button
                className={`${styles.checkinBtn} ${reg.checkedIn ? styles.checkinBtnChecked : ""}`}
                onClick={() => toggleCheckIn(reg)}
                title={reg.checkedIn ? "Mark not checked in" : "Mark checked in"}
              >
                {reg.checkedIn ? "✓" : ""}
              </button>
              {reg.checkedIn && reg.checkedInAt && (
                <span className={styles.checkinTime}>
                  {new Date(reg.checkedInAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </div>
            <div className={styles.actionsCell}>
              {reg.status !== "refunded" && reg.stripeSessionId && (reg.amountPaid ?? 0) > 0 && (
                <button
                  className={`${styles.actionBtn} ${styles.refundBtn}`}
                  onClick={() => refundAndDelete(reg)}
                  title={`Issue $${((reg.amountPaid ?? 0) / 100).toFixed(2)} refund and remove registration`}
                >
                  Refund
                </button>
              )}
              {reg.status === "waitlisted" && (
                <button
                  className={`${styles.actionBtn} ${styles.promoteBtn}`}
                  onClick={() => promoteToConfirmed(reg)}
                  title="Promote to confirmed"
                >
                  ↑
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => handleDelete(reg)}
                title="Delete registration"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={styles.emptyRow}>
            {search || statusFilter !== "all" || selectedEvent !== "all"
              ? "No registrations match your filters."
              : "No registrations yet."}
          </div>
        )}
      </div>

      {/* Add Registration Modal */}
      {addOpen && (
        <div className={styles.modalOverlay} onClick={() => setAddOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Registration</h2>
              <button className={styles.closeBtn} onClick={() => setAddOpen(false)}>✕</button>
            </div>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Event *</label>
                <select
                  className="form-input"
                  value={addForm.eventSlug}
                  onChange={(e) => setAddForm((p) => ({ ...p, eventSlug: e.target.value }))}
                >
                  <option value="">Select an event…</option>
                  {events.map((ev) => (
                    <option key={ev.slug} value={ev.slug}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">First Name *</label>
                <input
                  className="form-input"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Last Name *</label>
                <input
                  className="form-input"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Email *</label>
                <input
                  className="form-input"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Phone *</label>
                <input
                  className="form-input"
                  type="tel"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={addForm.status}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, status: e.target.value as Registration["status"] }))
                  }
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={addForm.notes}
                  onChange={(e) => setAddForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-outline" onClick={() => setAddOpen(false)} disabled={addSaving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={addSaving}>
                {addSaving ? "Saving…" : "Add Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
