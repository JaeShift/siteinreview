"use client";

import { useState } from "react";
import Link from "next/link";
import type { MtgEvent } from "@/lib/events-data";
import { formatEventDate, getSeatsRemaining, isEventSoldOut } from "@/lib/events-data";
import EventBanner from "@/components/mtg/EventBanner";
import RegistrationForm from "@/components/mtg/RegistrationForm";
import Modal from "@/components/ui/Modal";
import PageSection from "@/components/PageSection";
import styles from "./event-detail.module.css";

interface Props {
  event: MtgEvent;
}

function ShareButtons({ event }: { event: MtgEvent }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.shareButtons}>
      <span className={styles.shareLabel}>Share:</span>
      <a
        href="https://instagram.com/kitsunebrewingco"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.shareBtn}
        aria-label="Follow on Instagram"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.shareBtn}
        aria-label="Share on Facebook"
      >
        f
      </a>
      <button className={styles.shareBtn} onClick={copyLink} aria-label="Copy link">
        {copied ? "✓" : "🔗"}
      </button>
    </div>
  );
}

export default function EventDetailClient({ event }: Props) {
  const [regOpen, setRegOpen] = useState(false);
  const soldOut = isEventSoldOut(event);
  const seatsLeft = getSeatsRemaining(event);
  const registrationOpen = event.registrationOpen !== false;

  return (
    <>
      <EventBanner imageUrl={event.imageUrl} title={event.title} subtitle={event.format} height="lg" />

      <PageSection background="white">
        <div className={styles.layout}>
          {/* Main content */}
          <div className={styles.main}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/events">Events</Link>
              <span aria-hidden="true"> / </span>
              <span>{event.title}</span>
            </nav>

            <div className={styles.formatBadge}>
              <span className={styles.formatTag}>{event.format}</span>
            </div>

            <h1 className={styles.title}>{event.title}</h1>
            <ShareButtons event={event} />

            <div className={styles.description}>
              <p>{event.description}</p>
            </div>

            {/* Map placeholder */}
            <div className={styles.mapSection}>
              <h2 className={styles.sectionHeading}>Location</h2>
              <p className={styles.locationText}>{event.location}</p>
              <div className={styles.mapPlaceholder}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.686131234576!2d-112.01328312380821!3d33.63937933941697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b71a745da3db1%3A0x6fc2e6b0265490f6!2sKitsune%20Brewing%20Company!5e0!3m2!1sen!2sus!4v1748886554927!5m2!1sen!2sus"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kitsune Brewing Co. location"
                />
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarMeta}>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Date</span>
                  <span className={styles.metaValue}>{formatEventDate(event.date)}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Time</span>
                  <span className={styles.metaValue}>{event.time} – {event.endTime}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Format</span>
                  <span className={styles.metaValue}>{event.format}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Entry Fee</span>
                  <span className={`${styles.metaValue} ${styles.price}`}>
                    {event.entryFee === 0 ? "FREE" : `$${event.entryFee}`}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Player Limit</span>
                  <span className={styles.metaValue}>{event.playerLimit}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Registered</span>
                  <span className={styles.metaValue}>{event.registeredCount}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Seats Left</span>
                  <span className={`${styles.metaValue} ${seatsLeft <= 5 ? styles.seatsLow : ""}`}>
                    {soldOut ? "SOLD OUT" : `${seatsLeft} remaining`}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className={styles.progressWrap}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${Math.min((event.registeredCount / event.playerLimit) * 100, 100)}%` }}
                />
              </div>

              <button
                className={`btn btn-primary ${styles.registerBtn} ${(soldOut || !registrationOpen) ? styles.registerBtnDisabled : ""}`}
                onClick={() => registrationOpen && !soldOut && setRegOpen(true)}
                disabled={soldOut || !registrationOpen}
              >
                {soldOut ? "Sold Out" : !registrationOpen ? "Registration Closed" : "Register Now"}
              </button>

              <div className={styles.tags}>
                {event.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>

            <div className={styles.venueCard}>
              <h3 className={styles.venueTitle}>Kitsune Brewing Co.</h3>
              <p className={styles.venueAddress}>3321 E Bell Rd Suite B-5<br />Phoenix, AZ 85032</p>
              <a href="tel:+16022458593" className={styles.venuePhone}>(602) 245-8593</a>
            </div>
          </aside>
        </div>
      </PageSection>

      <Modal isOpen={regOpen} onClose={() => setRegOpen(false)} title="Event Registration" size="md">
        <RegistrationForm event={event} />
      </Modal>
    </>
  );
}
