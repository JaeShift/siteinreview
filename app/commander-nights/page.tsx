import type { Metadata } from "next";
import Link from "next/link";
import styles from "./commander-nights.module.css";

export const metadata: Metadata = {
  title: "Commander Nights | Kitsune Brewing Co.",
  description:
    "Join Commander Night at Kitsune Brewing Co. in Phoenix, AZ. Casual EDH for all power levels — Tuesday, Thursday, and Sunday sessions.",
};

const SCHEDULE = [
  {
    day: "TUESDAY NIGHTS",
    sub: "Casual & Beginner Friendly",
    time: "6:00 PM",
    entry: "FREE ENTRY",
  },
  {
    day: "THURSDAY NIGHTS",
    sub: "Mid-Power & Brew Review",
    time: "6:30 PM",
    entry: "FREE ENTRY",
  },
  {
    day: "SUNDAY SHOWDOWN",
    sub: "Higher Stakes / Competitive pods",
    time: "2:00 PM",
    entry: "$5 BUY-IN",
  },
];

export default function CommanderNightsPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url('/images/banner.png')` }}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>COMMANDER NIGHTS</h1>
          <div className={styles.heroAccent} />
          <p className={styles.heroSub}>
            Experience the ultimate social format in Phoenix&apos;s premier craft taproom.
          </p>
        </div>
      </section>

      {/* ── What is Commander? ── */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introLeft}>
            <h2 className={styles.introTitle}>WHAT IS COMMANDER NIGHT?</h2>
            <p className={styles.introBody}>
              Commander is a unique and exciting way to play Magic: The Gathering that focuses on
              legendary creatures, big plays, and social interaction. At Kitsune Brewing Co., our
              Commander Nights are designed to be inclusive, low-stress, and highly interactive.
            </p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>♟</span>
                <div>
                  <h4 className={styles.featureTitle}>Social Play</h4>
                  <p className={styles.featureDesc}>
                    Four-player free-for-all games where politics and alliances matter as much as
                    the cards.
                  </p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>🃏</span>
                <div>
                  <h4 className={styles.featureTitle}>100-Card Decks</h4>
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
              style={{ backgroundImage: `url('/images/singles-cards.png')` }}
            />
            <div
              className={styles.introImg2}
              style={{ backgroundImage: `url('/images/cases.png')` }}
            />
          </div>
        </div>
      </section>

      {/* ── How to Join ── */}
      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <div className={styles.howHeader}>
            <span className={styles.howLabel}>GET STARTED</span>
            <h2 className={styles.howTitle}>HOW TO JOIN THE BATTLE</h2>
          </div>
          <div className={styles.howGrid}>
            <div className={styles.howCardLight}>
              <span className={styles.howNum}>01</span>
              <h3 className={styles.howCardTitle}>BRING YOUR DECK</h3>
              <p className={styles.howCardDesc}>
                Bring your favorite 100-card Commander deck. Don&apos;t have one? We often have
                loaner decks available for beginners — just ask!
              </p>
            </div>
            <div className={styles.howCardDark}>
              <span className={styles.howNumDark}>02</span>
              <h3 className={styles.howCardTitleDark}>GRAB A PINT</h3>
              <p className={styles.howCardDescDark}>
                Support your local brewery! Check in at the bar, grab a fresh craft pour, and
                we&apos;ll help find you a pod of players at your power level.
              </p>
              <div className={styles.howCardFooter}>
                <span className={styles.howCardPromo}>PLAYER DISCOUNT ON DRAFTS</span>
              </div>
            </div>
            <div className={styles.howCardLight}>
              <span className={styles.howNum}>03</span>
              <h3 className={styles.howCardTitle}>PLAY &amp; SOCIALIZE</h3>
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
            <h2 className={styles.scheduleTitle}>WEEKLY SCHEDULE</h2>
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
              style={{ backgroundImage: `url('/images/swirl.png')` }}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>READY TO PLAY?</h2>
          <p className={styles.ctaBody}>
            Whether you&apos;re looking to join our weekly pods or want to book a private table for
            your playgroup, we&apos;ve got you covered.
          </p>
          <div className={styles.ctaBtns}>
            <a
              href="https://www.protix.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaBtnOrange}
            >
              REGISTER FOR NEXT NIGHT
            </a>
            <Link href="/private-events" className={styles.ctaBtnBlack}>
              REQUEST PRIVATE PARTY
            </Link>
          </div>
          <div className={styles.ctaIcons}>
            <span className={styles.ctaIcon}>🃏</span>
            <span className={styles.ctaIcon}>⚔</span>
            <span className={styles.ctaIcon}>⬟</span>
          </div>
        </div>
      </section>

      {/* ── Discord / Newsletter ── */}
      <section className={styles.discord}>
        <div className={styles.discordInner}>
          <div className={styles.discordText}>
            <h3 className={styles.discordTitle}>JOIN OUR DISCORD</h3>
            <p className={styles.discordDesc}>
              Connect with other Phoenix Commander players, arrange games, and get event updates.
            </p>
          </div>
          <div className={styles.discordForm}>
            <input
              type="email"
              placeholder="ENTER EMAIL FOR UPDATES"
              className={styles.discordInput}
              aria-label="Email for updates"
            />
            <button className={styles.discordBtn}>JOIN</button>
          </div>
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
          &copy; {new Date().getFullYear()} KITSUNE BREWING COMPANY. 3321 E BELL RD SUITE B-5 PHOENIX, AZ 85032
        </p>
        <div className={styles.footerBar}>
          <div className={styles.footerBarOrange} />
          <div className={styles.footerBarDim} />
          <div className={styles.footerBarDim} />
        </div>
      </footer>
    </>
  );
}
