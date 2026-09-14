import Link from "next/link";
import Image from "next/image";
import { getPrereleaseEventStore } from "@/lib/store";
import PageHero from "@/components/ui/PageHero";
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

export default async function PreReleasePage() {
  const prerelease = await getPrereleaseEventStore();

  // Show the active prerelease unless its optional 72-hour holding timer has elapsed.
  const event = prerelease &&
    !prerelease.hidden &&
    (prerelease.autoHoldAfter72Hours === false ||
      !hasAutoHoldingExpired(prerelease.date, prerelease.time))
      ? prerelease
      : null;

  // No active prerelease — show holding page
  if (!event) {
    return (
      <>
        <PageHero
          kicker="Kitsune Brewing Co. · Magic: The Gathering"
          title={<>The next pre-release<br /><em>is brewing.</em></>}
          description="New Magic: The Gathering sets—and the events to celebrate them—are on the way. Check back soon for upcoming dates, details, and registration."
        >
          <Link href="/mtg-and-more" className={holdingStyles.holdingBtn}>Explore Magic nights</Link>
        </PageHero>
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
            <span className={styles.featuredLabel}>Pre-release event</span>
            <h1 className={styles.heroTitle}>{title}</h1>

            {dateLabel && (
              <p style={{ color: "rgba(242, 232, 213,0.7)", fontFamily: "var(--font-heading)", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>
                {dateLabel} · {event.time}{event.endTime ? ` – ${event.endTime}` : ""} · Kitsune Brewing Co.
              </p>
            )}

            <div className={styles.priceBox}>
              <div className={styles.priceRow}>
                <div>
                  <span className={styles.admissionLabel}>Admission</span>
                  <span className={styles.price}>{price === 0 ? "Free" : `$${price % 1 === 0 ? price : price.toFixed(2)}`}</span>
                </div>
                <span className={styles.perPlayer}>per player</span>
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
          <span className={styles.sectionLabel}>How it works</span>
          <h2 className={styles.explainTitle}>{title}</h2>
          <p className={styles.explainBody} dangerouslySetInnerHTML={{ __html: description }} />

          <div className={styles.explainImage}>
            <Image
              src={event.bannerImageUrl || "/images/uploads/magic spread.png"}
              alt={`${title} banner`}
              fill
              className={styles.explainImg}
              sizes="100vw"
            />
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>1. Open</h3>
              <p className={styles.stepBody}>
                Receive your Pre-release Kit and discover the newest set before its official release.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>2. Build</h3>
              <p className={styles.stepBody}>
                Build a 40-card sealed deck using the cards from your Pre-release Kit.
              </p>
            </div>
            <div className={styles.stepCard}>
              <h3 className={styles.stepTitle}>3. Play</h3>
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
            <h2 className={styles.faqTitle}>Frequently asked questions</h2>
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
          <h2 className={styles.ctaTitle}>Save a seat.</h2>
          <p className={styles.ctaBody}>
            Seats fill up fast — secure your spot{dateLabel ? ` for ${title} on ${dateLabel}` : ""} and be
            among the first players in Phoenix to crack open the new set.
          </p>
          <div className={styles.ctaBtns}>
            {eventSlug ? (
              <Link href={`/events/${eventSlug}`} className={styles.ctaBtnPrimary}>
                Book your seat
              </Link>
            ) : (
              <Link href="/events" className={styles.ctaBtnPrimary}>
                View events
              </Link>
            )}
            <Link href="/contact" className={styles.ctaBtnOutline}>
              Contact us
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
    </>
  );
}
