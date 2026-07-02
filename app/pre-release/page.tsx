"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./prerelease.module.css";

const FAQS = [
  {
    q: "What do I need to bring?",
    a: "Just yourself! All materials including your Prerelease Kit and basic lands are provided. You may bring your own dice or sleeves if you prefer.",
  },
  {
    q: "Is there an age limit?",
    a: "Prerelease events are open to all ages. Players under 18 are welcome — Kitsune Brewing Co. is a family-friendly environment during our gaming events.",
  },
  {
    q: "How long do events last?",
    a: "Typically 3–4 hours. We run three rounds of Swiss-style pairings, so plan for around four hours from start to finish.",
  },
  {
    q: "Can I buy cards there?",
    a: "Yes! Our singles inventory and sealed product are available in-store before and after events. Check our card shop online to browse current stock.",
  },
];

export default function PreReleasePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroImage}>
            <Image
              src="/images/marvel-mtg-prerelease.png"
              alt="MTG Prerelease Event"
              fill
              className={styles.heroImg}
              sizes="(max-width: 768px) 100vw, 58vw"
            />
            <div className={styles.heroImgBorder} />
          </div>

          <div className={styles.heroText}>
            <span className={styles.featuredLabel}>FEATURED EVENT</span>
            <h1 className={styles.heroTitle}>MTG PRERELEASE EVENTS</h1>

            <div className={styles.priceBox}>
              <div className={styles.priceRow}>
                <div>
                  <span className={styles.admissionLabel}>ADMISSION</span>
                  <span className={styles.price}>$35</span>
                </div>
                <span className={styles.perPlayer}>PER PLAYER</span>
              </div>
              <ul className={styles.includes}>
                <li className={styles.includesItem}>
                  <span className={styles.check}>✓</span>
                  1x MTG Prerelease Kit
                </li>
                <li className={styles.includesItem}>
                  <span className={styles.check}>✓</span>
                  2x Play Booster Prize Support
                </li>
              </ul>
            </div>

            <a href="#register" className={styles.registerBtn}>
              REGISTER NOW
            </a>
          </div>
        </div>
      </section>

      {/* ── What is a Prerelease ── */}
      <section className={styles.explainSection}>
        <div className={styles.explainInner}>
          <span className={styles.sectionLabel}>01 / THE EXPERIENCE</span>
          <h2 className={styles.explainTitle}>WHAT IS A PRERELEASE?</h2>
          <p className={styles.explainBody}>
            Prerelease events are the first opportunity for the Magic community to get their hands
            on the latest expansion. It&apos;s a &ldquo;Sealed Deck&rdquo; format tournament where
            everyone starts on a level playing field, building a minimum 40-card deck from a special
            Prerelease Kit.
          </p>

          <div className={styles.explainImage}>
            <Image
              src="/images/singles-cards.png"
              alt="Magic cards spread across a gaming table"
              fill
              className={styles.explainImg}
              sizes="100vw"
            />
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>1. BUILD</h3>
              <p className={styles.stepBody}>
                Open your kit containing 6 Play Boosters and build a 40-card deck. Land is provided
                by the shop.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>2. BATTLE</h3>
              <p className={styles.stepBody}>
                Play three rounds of Swiss-style pairings. Win or lose, you keep all the cards from
                your kit.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>3. WIN</h3>
              <p className={styles.stepBody}>
                Prizes are awarded based on match wins. Everyone walks away with at least one
                additional pack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <div className={styles.faqLeft}>
            <h2 className={styles.faqTitle}>FREQUENTLY ASKED QUESTIONS</h2>
            <p className={styles.faqSub}>
              Everything you need to know before your first event at Kitsune.
            </p>
            <div className={styles.faqAccent} />
          </div>

          <div className={styles.faqRight}>
            {FAQS.map((item, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  className={styles.faqQuestion}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span>{item.q.toUpperCase()}</span>
                  <span className={styles.faqIcon}>{openIndex === i ? "−" : "+"}</span>
                </button>
                {openIndex === i && (
                  <p className={styles.faqAnswer}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta} id="register">
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>READY TO DECK BUILD?</h2>
          <p className={styles.ctaBody}>
            Seats fill up fast for our weekend Prerelease events. Secure your spot today and be
            among the first to play the new set.
          </p>
          <div className={styles.ctaBtns}>
            <a href="https://www.protix.com" target="_blank" rel="noopener noreferrer" className={styles.ctaBtnPrimary}>
              BOOK YOUR SEAT
            </a>
            <Link href="/contact" className={styles.ctaBtnOutline}>
              CONTACT US
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p className={styles.footerName}>KITSUNE BREWING COMPANY</p>
        <div className={styles.footerLinks}>
          <a href="tel:+16022458593" className={styles.footerLink}>(602) 245-8593</a>
          <a href="https://instagram.com/kitsunebrewingco" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>INSTAGRAM</a>
          <a href="https://www.facebook.com/KitsuneBrewCo" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>FACEBOOK</a>
        </div>
        <p className={styles.footerCopy}>
          &copy; {new Date().getFullYear()} KITSUNE BREWING COMPANY. 3321 E BELL RD SUITE B-5 PHOENIX, AZ 85032
        </p>
      </footer>
    </>
  );
}
