import Link from "next/link";
import Image from "next/image";
import { getEventsStore } from "@/lib/store";
import FaqAccordion from "./FaqAccordion";
import RegisterNowButton from "./RegisterNowButton";
import styles from "./prerelease.module.css";
import holdingStyles from "./holding.module.css";

export const dynamic = "force-dynamic";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

  // Phoenix stays on Mountain Standard Time (UTC-7) year-round.
  const eventTime = new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00-07:00`);
  return Date.now() >= eventTime.getTime() + 72 * 60 * 60 * 1000;
}

export default function PreReleasePage() {
  const events = getEventsStore();

  // Show the active prerelease unless its optional 72-hour holding timer has elapsed.
  const event = events
    .filter((e) => e.format === "Prerelease" && !e.hidden)
    .sort((a, b) => a.date.localeCompare(b.date))
    .find((e) => e.autoHoldAfter72Hours === false || !hasAutoHoldingExpired(e.date, e.time));

  // No active prerelease — show holding page
  if (!event) {
    return (
      <>
        <div className={holdingStyles.holdingPage}>
          <div className={holdingStyles.holdingContent}>
            <div className={holdingStyles.manaConstellation} aria-hidden="true">
              <i className="ms ms-w ms-cost" />
              <i className="ms ms-u ms-cost" />
              <i className="ms ms-b ms-cost" />
              <i className="ms ms-r ms-cost" />
              <i className="ms ms-g ms-cost" />
            </div>
            <span className={holdingStyles.holdingEyebrow}>Kitsune Brewing Co. · Magic: The Gathering</span>
            <h1 className={holdingStyles.holdingTitle}>
              The Next Pre-Release Event<br />
              <em>Is Brewing.</em>
            </h1>
            <div className={holdingStyles.holdingDivider} />
            <p className={holdingStyles.holdingText}>
              New Magic: The Gathering sets—and the events to celebrate them—are on the way.
              Check back soon for upcoming prerelease dates, details, and registration.
            </p>
            <Link href="/mtg-and-more" className={holdingStyles.holdingBtn}>Explore MTG &amp; More</Link>
          </div>
        </div>
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

  const title = event.title;
  const imageUrl = event.imageUrl;
  const price = event.entryFee;
  const dateLabel = formatDate(event.date);
  const description = event.shortDescription ?? "";
  const eventSlug = event.slug;

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
            <span className={styles.featuredLabel}>PRERELEASE EVENT</span>
            <h1 className={styles.heroTitle}>{title.toUpperCase()}</h1>

            {dateLabel && (
              <p style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
                {dateLabel} · {event.time}{event.endTime ? ` – ${event.endTime}` : ""} · Kitsune Brewing Co.
              </p>
            )}

            <div className={styles.priceBox}>
              <div className={styles.priceRow}>
                <div>
                  <span className={styles.admissionLabel}>ADMISSION</span>
                  <span className={styles.price}>{price === 0 ? "FREE" : `$${price % 1 === 0 ? price : price.toFixed(2)}`}</span>
                </div>
                <span className={styles.perPlayer}>PER PLAYER</span>
              </div>
              <ul className={styles.includes}>
                <li className={styles.includesItem}>
                  <span className={styles.check}>✓</span>
                  1x {title} Prerelease Kit
                </li>
                <li className={styles.includesItem}>
                  <span className={styles.check}>✓</span>
                  Entry into Event
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
          <span className={styles.sectionLabel}>01 / PRE-RELEASE</span>
          <h2 className={styles.explainTitle}>{title.toUpperCase()}</h2>
          <p className={styles.explainBody} dangerouslySetInnerHTML={{ __html: description }} />

          <div className={styles.explainImage}>
            <Image
              src={event.bannerImageUrl || "/images/singles-cards.png"}
              alt={`${title} banner`}
              fill
              className={styles.explainImg}
              sizes="100vw"
            />
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>1. OPEN</h3>
              <p className={styles.stepBody}>
                Receive your Pre-release Kit and discover the newest set before its official release.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>2. BUILD</h3>
              <p className={styles.stepBody}>
                Build a 40-card sealed deck using the cards from your Pre-release Kit.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>3. PLAY</h3>
              <p className={styles.stepBody}>
                Try out new cards and strategies against other players before the set officially releases.
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
              Everything you need to know before your Prerelease event at Kitsune.
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
