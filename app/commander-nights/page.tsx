import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import styles from "./commander-nights.module.css";

export const metadata: Metadata = {
  title: "Commander Nights | Kitsune Brewing Co.",
  description:
    "Join Commander Night at Kitsune Brewing Co. in Phoenix, AZ. Casual EDH for all power levels — Tuesday, Thursday, and Sunday sessions.",
};

const SCHEDULE = [
  {
    day: "Tuesday nights",
    sub: "Casual and beginner-friendly",
    time: "6:00 PM",
    entry: "Free",
  },
  {
    day: "Thursday nights",
    sub: "Mid-power and brew review",
    time: "6:30 PM",
    entry: "Free",
  },
  {
    day: "Sunday showdown",
    sub: "Higher-stakes competitive pods",
    time: "2:00 PM",
    entry: "$5 buy-in",
  },
];

export default function CommanderNightsPage() {
  return (
    <>
      <PageHero
        variant="image"
        image="/images/updated.png"
        imageAlt="Commander night at Kitsune"
        kicker="Weekly at the taproom"
        title="Commander nights"
        description="Casual pods, mid-power tables, and a Sunday showdown — with something on tap."
      />

      {/* ── What is Commander? ── */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introLeft}>
            <p className={styles.heroKicker}>The social format</p>
            <h2 className={styles.introTitle}>What is Commander night?</h2>
            <p className={styles.introBody}>
              Commander is a unique and exciting way to play Magic: The Gathering that focuses on
              legendary creatures, big plays, and social interaction. At Kitsune Brewing Co., our
              Commander Nights are designed to be inclusive, low-stress, and highly interactive.
            </p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <span className={styles.featureMark} aria-hidden="true" />
                <div>
                  <h4 className={styles.featureTitle}>Social play</h4>
                  <p className={styles.featureDesc}>
                    Four-player free-for-all games where politics and alliances matter as much as
                    the cards.
                  </p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureMark} aria-hidden="true" />
                <div>
                  <h4 className={styles.featureTitle}>100-card decks</h4>
                  <p className={styles.featureDesc}>
                    Build around your favorite Legend in a singleton format where no two games are
                    the same.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.introImages}>
            <div
              className={styles.introImg1}
              style={{ backgroundImage: `url('/images/fox - Copy.png')` }}
            />
            <div
              className={styles.introImg2}
              style={{ backgroundImage: `url('/images/1 IMG_0629.jpg')` }}
            />
          </div>
        </div>
      </section>

      {/* ── How to Join ── */}
      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={styles.howHeader}>
            <span className={styles.howLabel}>Getting started</span>
            <h2 className={styles.howTitle}>How a night usually goes</h2>
          </div>
          <div className={styles.howGrid}>
            <div className={styles.howCardLight}>
              <span className={styles.howNum}>01</span>
              <h3 className={styles.howCardTitle}>Bring a deck</h3>
              <p className={styles.howCardDesc}>
                Bring your favorite 100-card Commander deck. Don&apos;t have one? We often have
                loaner decks available for beginners — just ask!
              </p>
            </div>
            <div className={styles.howCardDark}>
              <span className={styles.howNumDark}>02</span>
              <h3 className={styles.howCardTitleDark}>Grab a pint</h3>
              <p className={styles.howCardDescDark}>
                Support your local brewery! Check in at the bar, grab a fresh craft pour, and
                we&apos;ll help find you a pod of players at your power level.
              </p>
              <div className={styles.howCardFooter}>
                <span className={styles.howCardPromo}>Player discount on drafts</span>
              </div>
            </div>
            <div className={styles.howCardLight}>
              <span className={styles.howNum}>03</span>
              <h3 className={styles.howCardTitle}>Sit down and play</h3>
              <p className={styles.howCardDesc}>
                Our community is built on &ldquo;Rule 0&rdquo; conversations. We ensure everyone is
                playing at a compatible power level for maximum fun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Weekly Schedule ── */}
      <section className={styles.scheduleSection}>
        <div className={styles.scheduleInner}>
          <div className={styles.scheduleLeft}>
            <h2 className={styles.scheduleTitle}>Weekly schedule</h2>
            <p className={styles.scheduleSub}>
              We host multiple sessions to accommodate all schedules and styles of play.
            </p>
            <ul className={styles.scheduleList}>
              {SCHEDULE.map((item, i) => (
                <li
                  key={item.day}
                  className={`${styles.scheduleItem} ${i < SCHEDULE.length - 1 ? styles.scheduleItemBorder : ""}`}
                >
                  <div>
                    <h4 className={styles.scheduleDay}>{item.day}</h4>
                    <p className={styles.scheduleSub2}>{item.sub}</p>
                  </div>
                  <div className={styles.scheduleRight}>
                    <span className={styles.scheduleTime}>{item.time}</span>
                    <span className={styles.scheduleEntry}>{item.entry}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.scheduleImage}>
            <div
              className={styles.scheduleImgBg}
              style={{ backgroundImage: `url('/images/uploads/beer and magic.png')` }}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Save a chair.</h2>
          <p className={styles.ctaBody}>
            Drop in for a weekly pod, or book a few tables for your playgroup.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/events" className={styles.ctaBtnOrange}>
              See upcoming nights
            </Link>
            <Link href="/private-events" className={styles.ctaBtnBlack}>
              Host a private table
            </Link>
          </div>
        </div>
      </section>

      {/* ── Discord / Newsletter ── */}
      <section className={styles.discord}>
        <div className={styles.discordInner}>
          <div className={styles.discordText}>
            <h3 className={styles.discordTitle}>Stay in the loop</h3>
            <p className={styles.discordDesc}>
              Connect with other Phoenix Commander players, arrange games, and get event updates.
            </p>
          </div>
          <div className={styles.discordForm}>
            <input
              type="email"
              placeholder="Email for night updates"
              className={styles.discordInput}
              aria-label="Email for updates"
            />
            <button className={styles.discordBtn}>Join</button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
    </>
  );
}
