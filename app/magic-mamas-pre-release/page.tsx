import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPrereleaseConfig } from "@/lib/store";
import styles from "./holding.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cfg = getPrereleaseConfig();
  const title = cfg.active && cfg.setName
    ? `${cfg.setName} Pre-Release — Kitsune Brewing Co.`
    : "Pre-Release — Kitsune Brewing Co.";
  const description = cfg.active && cfg.tagline
    ? cfg.tagline
    : "Pre-Release event at Kitsune Brewing Co. Check back soon for details.";
  return { title, description };
}

export default function PrereleasePageServer() {
  const cfg = getPrereleaseConfig();

  // ── Holding / inactive state ──────────────────────────────────────────────
  if (!cfg.active) {
    return (
      <div className={styles.holdingPage}>
        <div className={styles.holdingContent}>
          <span className={styles.holdingEyebrow}>Kitsune Brewing Co. · Magic: The Gathering</span>
          <h1 className={styles.holdingTitle}>
            The Next Pre-Release Event<br />
            <em>Is Brewing.</em>
          </h1>
          <div className={styles.holdingDivider} />
          <p className={styles.holdingText}>
            New Magic: The Gathering sets—and the events to celebrate them—are on the way.
            Check back soon for upcoming prerelease dates, details, and registration.
          </p>
          <Link href="/mtg-and-more" className={styles.holdingBtn}>Explore MTG &amp; More</Link>
        </div>
      </div>
    );
  }

  // ── Active pre-release state ──────────────────────────────────────────────
  const formattedDate = cfg.date
    ? new Date(cfg.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div className={styles.prereleasePage}>
      {cfg.imageUrl && (
        <div className={styles.prereleaseHero}>
          <Image
            src={cfg.imageUrl}
            alt={cfg.setName}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div className={styles.prereleaseHeroOverlay} />
          <div className={styles.prereleaseHeroContent}>
            <span className={styles.prereleaseEyebrow}>Pre-Release Event</span>
            <h1 className={styles.prereleaseTitle}>{cfg.setName}</h1>
            {cfg.tagline && <p className={styles.prereleaseTagline}>{cfg.tagline}</p>}
          </div>
        </div>
      )}

      {!cfg.imageUrl && (
        <div className={styles.prereleasePlainHeader}>
          <span className={styles.prereleaseEyebrow}>Pre-Release Event</span>
          <h1 className={styles.prereleaseTitle}>{cfg.setName}</h1>
          {cfg.tagline && <p className={styles.prereleaseTagline}>{cfg.tagline}</p>}
        </div>
      )}

      <div className={styles.prereleaseBody}>
        {(formattedDate || cfg.time) && (
          <div className={styles.prereleaseInfoBar}>
            {formattedDate && (
              <div className={styles.prereleaseInfoItem}>
                <span className={styles.prereleaseInfoLabel}>Date</span>
                <span className={styles.prereleaseInfoValue}>{formattedDate}</span>
              </div>
            )}
            {cfg.time && (
              <div className={styles.prereleaseInfoItem}>
                <span className={styles.prereleaseInfoLabel}>Time</span>
                <span className={styles.prereleaseInfoValue}>{cfg.time}</span>
              </div>
            )}
            <div className={styles.prereleaseInfoItem}>
              <span className={styles.prereleaseInfoLabel}>Location</span>
              <span className={styles.prereleaseInfoValue}>Kitsune Brewing Co.</span>
            </div>
          </div>
        )}

        {cfg.description && (
          <div className={styles.prereleaseDesc}>
            {cfg.description.split("\n").map((line, i) =>
              line.trim() ? <p key={i}>{line}</p> : <br key={i} />
            )}
          </div>
        )}

        <div className={styles.prereleaseCtas}>
          {cfg.eventSlug ? (
            <Link href={`/events/${cfg.eventSlug}`} className="btn btn-primary">
              Register Now
            </Link>
          ) : null}
          <Link href="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
