"use client";

import { useState, useMemo } from "react";
import PageSection from "@/components/PageSection";
import MtgEventCard from "@/components/mtg/MtgEventCard";
import SearchBar from "@/components/ui/SearchBar";
import EmptyState from "@/components/ui/EmptyState";
import type { MtgEvent, EventFormat } from "@/lib/events-data";
import styles from "./events.module.css";

const FORMATS: EventFormat[] = [
  "Commander", "Draft", "Standard", "Modern", "Pioneer",
  "Legacy", "Sealed", "Prerelease", "RCQ", "Casual",
];

interface Props {
  events: MtgEvent[];
}

export default function EventsClient({ events }: Props) {
  const [search, setSearch] = useState("");
  const [activeFormat, setActiveFormat] = useState<EventFormat | "All">("All");

  const filtered = useMemo(() => {
    let result = [...events];

    if (activeFormat !== "All") {
      result = result.filter((e) => e.format === activeFormat);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.format.toLowerCase().includes(q) ||
          e.shortDescription.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, search, activeFormat]);

  return (
    <>
      <div className="page-banner">
        <h1>MTG Events</h1>
      </div>

      <PageSection background="white">
        <div className={styles.controls}>
          <div className={styles.filterBar}>
            <button
              className={`${styles.filterPill} ${activeFormat === "All" ? styles.filterPillActive : ""}`}
              onClick={() => setActiveFormat("All")}
            >
              All
            </button>
            {FORMATS.map((format) => (
              <button
                key={format}
                className={`${styles.filterPill} ${activeFormat === format ? styles.filterPillActive : ""}`}
                onClick={() => setActiveFormat(format)}
              >
                {format}
              </button>
            ))}
          </div>

          <div className={styles.searchWrap}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search events…"
              className={styles.search}
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <>
            <p className={styles.resultCount}>
              {filtered.length} event{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className={styles.grid}>
              {filtered.map((event) => (
                <MtgEventCard key={event.slug} event={event} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="No Events Found"
            message={
              search || activeFormat !== "All"
                ? "Try adjusting your search or clearing the format filter."
                : "No upcoming events are scheduled. Check back soon!"
            }
            action={
              (search || activeFormat !== "All") ? (
                <button
                  className="btn btn-outline"
                  onClick={() => { setSearch(""); setActiveFormat("All"); }}
                >
                  Clear Filters
                </button>
              ) : undefined
            }
          />
        )}
      </PageSection>

      <section className={styles.infoBanner}>
        <div className="container">
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <h3>Location</h3>
              <p>3321 E Bell Rd Suite B-5<br />Phoenix, AZ 85032</p>
            </div>
            <div className={styles.infoItem}>
              <h3>Questions?</h3>
              <p>
                Email us at{" "}
                <a href="mailto:Tyler@KitsuneBeerCo.com">Tyler@KitsuneBeerCo.com</a>
                {" "}or call{" "}
                <a href="tel:+16022458593">(602) 245-8593</a>
              </p>
            </div>
            <div className={styles.infoItem}>
              <h3>New to MTG?</h3>
              <p>Beginners welcome! We have loaner decks and staff happy to teach.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
