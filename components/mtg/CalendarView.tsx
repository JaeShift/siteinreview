"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CalendarEvent, CalendarEventType } from "@/lib/calendar/types";
import Modal from "@/components/ui/Modal";
import { getTruckById } from "@/lib/food-trucks-data";
import styles from "./CalendarView.module.css";

type ViewFilter = "all" | "event";

interface Props {
  events: CalendarEvent[];
  initialFilter?: ViewFilter;
  showToggle?: boolean;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildCalendarGrid(year: number, month: number, events: CalendarEvent[]) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const grid: Array<{
    date: Date | null;
    dateStr: string;
    isToday: boolean;
    events: CalendarEvent[];
  }> = [];

  for (let i = 0; i < firstDay; i++) {
    grid.push({ date: null, dateStr: "", isToday: false, events: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().split("T")[0];
    const dayEvents = events.filter((e) => e.start.toISOString().split("T")[0] === dateStr);
    grid.push({ date, dateStr, isToday: dateStr === today, events: dayEvents });
  }

  return grid;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function CalendarView({ events, initialFilter = "all", showToggle = true }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState<ViewFilter>(initialFilter);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((e) => e.type === filter);
  }, [events, filter]);

  const grid = useMemo(() => buildCalendarGrid(year, month, filteredEvents), [year, month, filteredEvents]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const truck = selectedEvent?.truckId ? getTruckById(selectedEvent.truckId) : null;

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "#ff0000" }} />
          Events
        </span>
      </div>

      <div className={styles.calendar}>
        {/* Header */}
        <div className={styles.calHeader}>
          <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">←</button>
          <span className={styles.monthLabel}>{MONTH_NAMES[month]} {year}</span>
          <button className={styles.navBtn} onClick={nextMonth} aria-label="Next month">→</button>
        </div>

        {/* Day names */}
        <div className={styles.dayNames}>
          {DAY_NAMES.map((d) => (
            <div key={d} className={styles.dayName}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {grid.map((cell, i) => (
            <div
              key={i}
              className={`${styles.cell} ${!cell.date ? styles.cellEmpty : ""} ${cell.isToday ? styles.cellToday : ""}`}
            >
              {cell.date && (
                <>
                  <span className={styles.dayNum}>{cell.date.getDate()}</span>
                  <div className={styles.cellEvents}>
                    {cell.events.slice(0, 3).map((evt) => (
                      <button
                        key={evt.id}
                        className={styles.eventPill}
                        style={{ backgroundColor: evt.color ?? "#333" }}
                        onClick={() => setSelectedEvent(evt)}
                        title={evt.title}
                      >
                        <span className={styles.eventPillText}>{evt.title}</span>
                      </button>
                    ))}
                    {cell.events.length > 3 && (
                      <span className={styles.moreEvents}>+{cell.events.length - 3} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Event detail modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
        size="sm"
      >
        {selectedEvent && (
          <div className={styles.modalContent}>
            <p className={styles.modalType}>
              {selectedEvent.type === "event" ? "MTG Event" : "Food Truck"}
            </p>
            <div className={styles.modalMeta}>
              <p>
                <strong>Date:</strong>{" "}
                {selectedEvent.start.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p>
                <strong>Time:</strong> {formatTime(selectedEvent.start)} – {formatTime(selectedEvent.end)}
              </p>
              {selectedEvent.location && (
                <p><strong>Location:</strong> {selectedEvent.location}</p>
              )}
            </div>
            {selectedEvent.description && (
              <p className={styles.modalDesc}>{selectedEvent.description}</p>
            )}
            {truck && truck.instagram && (
              <a href={truck.instagram} target="_blank" rel="noopener noreferrer" className={`btn btn-outline ${styles.modalBtn}`}>
                View on Instagram
              </a>
            )}
            {selectedEvent.slug && (
              <Link href={`/events/${selectedEvent.slug}`} className={`btn btn-primary ${styles.modalBtn}`} onClick={() => setSelectedEvent(null)}>
                View Event Details
              </Link>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
