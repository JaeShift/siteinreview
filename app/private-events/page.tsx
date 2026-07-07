"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import styles from "./private-events.module.css";

const EVENT_TYPES = [
  { title: "DRAFT PARTIES", desc: "Customized set selection and professional hosting for your pod." },
  { title: "BIRTHDAYS", desc: "Celebrate your level-up with craft beer and tabletop madness." },
  { title: "CORPORATE", desc: "Strategy, synergy, and team building through MTG mechanics." },
  { title: "PRERELEASE", desc: "Private early access events for your specific gaming group." },
];

export default function PrivateEventsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [focusedLabel, setFocusedLabel] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      formRef.current?.reset();
    }, 3000);
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url('/images/singles-cards.png')` }}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            PRIVATE MTG &amp; <br className={styles.brDesk} />
            GAME EVENTS
          </h1>
          <div className={styles.heroAccent} />
        </div>
      </section>

      {/* ── Intro ── */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introLeft}>
            <span className={styles.introLabel}>PREMIUM TABLETOP EXPERIENCES</span>
            <h2 className={styles.introTitle}>
              YOUR DECK,<br /> OUR VENUE.
            </h2>
            <p className={styles.introBody}>
              Elevate your next gathering at Kitsune Brewing Co. Whether you&apos;re planning a
              competitive Draft Party, an intimate Private Commander Night, or a unique corporate
              team-building event centered around strategy and skill, our industrial-chic space
              provides the perfect backdrop for legendary plays.
            </p>
          </div>
          <div className={styles.introGrid}>
            {EVENT_TYPES.map((et) => (
              <div key={et.title} className={styles.eventCard}>
                <h3 className={styles.eventCardTitle}>{et.title}</h3>
                <p className={styles.eventCardDesc}>{et.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking Form ── */}
      <section className={styles.formSection}>
        <div className={styles.formWrap}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>RESERVE YOUR TABLE</h2>
            <p className={styles.formSub}>COMPLETE THE FORM BELOW FOR A CUSTOM QUOTE</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label
                  htmlFor="full_name"
                  className={`${styles.label} ${focusedLabel === "full_name" ? styles.labelFocused : ""}`}
                >
                  FULL NAME
                </label>
                <input
                  id="full_name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className={styles.input}
                  onFocus={() => setFocusedLabel("full_name")}
                  onBlur={() => setFocusedLabel(null)}
                />
              </div>
              <div className={styles.field}>
                <label
                  htmlFor="email"
                  className={`${styles.label} ${focusedLabel === "email" ? styles.labelFocused : ""}`}
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="email@example.com"
                  className={styles.input}
                  onFocus={() => setFocusedLabel("email")}
                  onBlur={() => setFocusedLabel(null)}
                />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.field}>
                <label
                  htmlFor="phone"
                  className={`${styles.label} ${focusedLabel === "phone" ? styles.labelFocused : ""}`}
                >
                  PHONE
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  className={styles.input}
                  onFocus={() => setFocusedLabel("phone")}
                  onBlur={() => setFocusedLabel(null)}
                />
              </div>
              <div className={styles.field}>
                <label
                  htmlFor="event_type"
                  className={`${styles.label} ${focusedLabel === "event_type" ? styles.labelFocused : ""}`}
                >
                  EVENT TYPE
                </label>
                <select
                  id="event_type"
                  required
                  className={styles.input}
                  onFocus={() => setFocusedLabel("event_type")}
                  onBlur={() => setFocusedLabel(null)}
                  defaultValue=""
                >
                  <option value="" disabled>Select an event type</option>
                  <option>Private Commander Night</option>
                  <option>Draft Party</option>
                  <option>Prerelease Group</option>
                  <option>Birthday Event</option>
                  <option>Team / Work Event</option>
                  <option>Casual Game Night</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className={styles.row3}>
              <div className={styles.field}>
                <label
                  htmlFor="guest_count"
                  className={`${styles.label} ${focusedLabel === "guest_count" ? styles.labelFocused : ""}`}
                >
                  GUEST COUNT
                </label>
                <input
                  id="guest_count"
                  type="number"
                  min={4}
                  required
                  placeholder="Min 4 guests"
                  className={styles.input}
                  onFocus={() => setFocusedLabel("guest_count")}
                  onBlur={() => setFocusedLabel(null)}
                />
              </div>
              <div className={styles.field}>
                <label
                  htmlFor="preferred_date"
                  className={`${styles.label} ${focusedLabel === "preferred_date" ? styles.labelFocused : ""}`}
                >
                  PREFERRED DATE
                </label>
                <input
                  id="preferred_date"
                  type="date"
                  required
                  className={styles.input}
                  onFocus={() => setFocusedLabel("preferred_date")}
                  onBlur={() => setFocusedLabel(null)}
                />
              </div>
              <div className={styles.field}>
                <label
                  htmlFor="preferred_time"
                  className={`${styles.label} ${focusedLabel === "preferred_time" ? styles.labelFocused : ""}`}
                >
                  PREFERRED TIME
                </label>
                <input
                  id="preferred_time"
                  type="time"
                  required
                  className={styles.input}
                  onFocus={() => setFocusedLabel("preferred_time")}
                  onBlur={() => setFocusedLabel(null)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label
                htmlFor="details"
                className={`${styles.label} ${focusedLabel === "details" ? styles.labelFocused : ""}`}
              >
                ADDITIONAL DETAILS
              </label>
              <textarea
                id="details"
                rows={4}
                placeholder="Tell us about specific set requests, dietary needs, or event goals..."
                className={styles.textarea}
                onFocus={() => setFocusedLabel("details")}
                onBlur={() => setFocusedLabel(null)}
              />
            </div>

            <div className={styles.submitWrap}>
              <button
                type="submit"
                className={`${styles.submitBtn} ${submitted ? styles.submitBtnSent : ""}`}
              >
                {submitted ? "REQUEST SENT" : "SUBMIT BOOKING REQUEST"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Location ── */}
      <section className={styles.location}>
        <div className={styles.locationLeft}>
          <div className={styles.locationText}>
            <h2 className={styles.locationTitle}>VISIT THE<br /> TAPROOM.</h2>
            <div className={styles.locationDetails}>
              <div className={styles.locationRow}>
                <span className={styles.locationIcon}>📍</span>
                <p className={styles.locationInfo}>
                  3321 E BELL RD SUITE B-5<br />PHOENIX, AZ 85032
                </p>
              </div>
              <div className={styles.locationRow}>
                <span className={styles.locationIcon}>📞</span>
                <p className={styles.locationInfo}>(602) 245-8593</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.locationMap}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.686131234576!2d-112.01328312380821!3d33.63937933941697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b71a745da3db1%3A0x6fc2e6b0265490f6!2sKitsune%20Brewing%20Company!5e0!3m2!1sen!2sus!4v1748886554927!5m2!1sen!2sus"
            className={styles.mapEmbed}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Kitsune Brewing Co location"
          />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p className={styles.footerName}>KITSUNE BREWING CO.</p>
        <div className={styles.footerLinks}>
          <a href="tel:+16022458593" className={styles.footerLink}>(602) 245-8593</a>
          <a href="https://instagram.com/kitsunebrewingco" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>INSTAGRAM</a>
          <a href="https://www.facebook.com/KitsuneBrewCo" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>FACEBOOK</a>
        </div>
        <p className={styles.footerCopy}>
          &copy; {new Date().getFullYear()} KITSUNE BREWING COMPANY. 3321 E BELL RD SUITE B-5 PHOENIX, AZ 85032.
          MAGIC: THE GATHERING IS A TRADEMARK OF WIZARDS OF THE COAST LLC.
        </p>
      </footer>
    </>
  );
}
