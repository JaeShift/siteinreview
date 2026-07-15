import Link from "next/link";
import Image from "next/image";
import { getEventsStore } from "@/lib/store";
import FaqAccordion from "./FaqAccordion";
import RegisterNowButton from "./RegisterNowButton";
import styles from "./prerelease.module.css";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PreReleasePage() {
  const today = new Date().toISOString().split("T")[0];
  const events = getEventsStore();

  // Find the next upcoming Prerelease event
  const event = events
    .filter((e) => e.format === "Prerelease" && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Fallback values if no upcoming prerelease exists
  const title = event?.title ?? "MTG Prerelease";
  const imageUrl = event?.imageUrl ?? "/images/hobbitprerelease.webp";
  const price = event?.entryFee ?? 44.99;
  const dateLabel = event ? formatDate(event.date) : "";
  const description = event?.shortDescription ?? "Be the first to play the latest Magic set! Sealed prerelease packs, prizes, and more.";
  const eventSlug = event?.slug;

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroImage}>
            <Image
              src={imageUrl}
              alt={title}
              width={0}
              height={0}
              sizes="100vw"
              className={styles.heroImg}
            />
            <div className={styles.heroImgBorder} />
          </div>

          <div className={styles.heroText}>
            <span className={styles.featuredLabel}>FEATURED EVENT</span>
            <h1 className={styles.heroTitle}>{title.toUpperCase()}</h1>

            {dateLabel && (
              <p style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
                {dateLabel} · Kitsune Brewing Co.
              </p>
            )}

            <div className={styles.priceBox}>
              <div className={styles.priceRow}>
                <div>
                  <span className={styles.admissionLabel}>ADMISSION</span>
                  <span className={styles.price}>${price % 1 === 0 ? price : price.toFixed(2)}</span>
                </div>
                <span className={styles.perPlayer}>PER PLAYER</span>
              </div>
              <ul className={styles.includes}>
                <li className={styles.includesItem}>
                  <span className={styles.check}>✓</span>
                  1x {title} Kit
                </li>
                <li className={styles.includesItem}>
                  <span className={styles.check}>✓</span>
                  Entry into Prerelease Event
                </li>
              </ul>
            </div>

            <RegisterNowButton
              event={event ?? null}
              fallbackHref="/events"
            />
          </div>
        </div>
      </section>

      {/* ── What is a Prerelease ── */}
      <section className={styles.explainSection}>
        <div className={styles.explainInner}>
          <span className={styles.sectionLabel}>01 / THE EXPERIENCE</span>
          <h2 className={styles.explainTitle}>{title.toUpperCase()}</h2>
          <p className={styles.explainBody}>{description}</p>

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
                Open your kit and build a 40-card deck. Basic lands are provided by the shop.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>2. BATTLE</h3>
              <p className={styles.stepBody}>
                Play rounds of Swiss-style pairings. Win or lose, you keep everything you open.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>3. WIN</h3>
              <p className={styles.stepBody}>
                Prizes are awarded based on match wins. Everyone walks away with extra value.
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
          <FaqAccordion />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta} id="register">
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>READY TO PLAY?</h2>
          <p className={styles.ctaBody}>
            Seats fill up fast — secure your spot{dateLabel ? ` for ${title} on ${dateLabel}` : ""} and be
            among the first players in Phoenix to crack open the new set.
          </p>
          <div className={styles.ctaBtns}>
            {eventSlug ? (
              <Link href={`/events/${eventSlug}`} className={styles.ctaBtnPrimary}>
                BOOK YOUR SEAT
              </Link>
            ) : (
              <Link href="/events" className={styles.ctaBtnPrimary}>
                VIEW EVENTS
              </Link>
            )}
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
