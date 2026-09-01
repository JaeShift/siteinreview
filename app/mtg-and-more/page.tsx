import type { Metadata } from "next";
import Link from "next/link";
import { getEventsStore } from "@/lib/store";
import styles from "./mtg.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MTG and More",
  description:
    "Magic events, sealed product, singles, prereleases, Commander nights, and private play at Kitsune Brewing Co. in Phoenix, AZ.",
};

const HERO_IMG = "/images/mtg-more-banner-1920x820-glow-extended.webp";
const BENTO_IMG = "/images/OIP.jpg";

type BentoCard = {
  title: string;
  desc: string;
  href: string;
  btnLabel: string;
  btnStyle: "primary" | "outline";
  colSpan: number;
  height: number;
  img: string;
  tone: "White" | "Blue" | "Black" | "Red" | "Green";
  bgPosition?: string;
  bgSize?: string;
};

const bentoCards: BentoCard[] = [
  {
    title: "SHOP MAGIC",
    desc: "Find the latest sets, collector boosters, and commander decks in stock.",
    href: "/card-shop",
    btnLabel: "EXPLORE SHOP",
    btnStyle: "primary" as const,
    colSpan: 8,
    height: 400,
    img: BENTO_IMG,
    tone: "Blue",
  },
  {
    title: "PRERELEASE",
    desc: "Be the first to play the new sets.",
    href: "/pre-release",
    btnLabel: "LEARN MORE",
    btnStyle: "outline" as const,
    colSpan: 4,
    height: 400,
    img: BENTO_IMG,
    tone: "Red",
  },
  {
    title: "MTG EVENTS",
    desc: "Competitive and social tournaments.",
    href: "/events",
    btnLabel: "VIEW EVENTS",
    btnStyle: "outline" as const,
    colSpan: 4,
    height: 350,
    img: BENTO_IMG,
    tone: "Black",
  },
  {
    title: "COMMANDER NIGHTS",
    desc: "Casual EDH for all power levels.",
    href: "/commander-nights",
    btnLabel: "JOIN A NIGHT",
    btnStyle: "outline" as const,
    colSpan: 4,
    height: 350,
    img: BENTO_IMG,
    tone: "Green",
  },
  {
    title: "SINGLES",
    desc: "Browse our curated selection of power nine, staples, and foils.",
    href: "/card-shop",
    btnLabel: "VIEW INVENTORY",
    btnStyle: "outline" as const,
    colSpan: 4,
    height: 350,
    img: BENTO_IMG,
    tone: "White",
  },
];

const manaSymbols = ["w", "u", "b", "r", "g"];

const CTA_IMG = "/images/swirl.png";

export default function MtgPage() {
  const today = new Date().toISOString().split("T")[0];
  const schedule = getEventsStore()
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
    .map((e) => {
      const d = new Date(e.date + "T00:00:00");
      const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
      const time = e.endTime ? `${e.time} – ${e.endTime}` : e.time;
      return { day, title: e.title.toUpperCase(), desc: e.shortDescription, time, slug: e.slug };
    });

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} style={{ backgroundImage: `url('${HERO_IMG}')` }} />
        <div className={styles.heroVignette} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>MTG &amp; MORE</h1>
          <p className={styles.heroSubtitle}>
            Magic events, sealed product, singles, prereleases, Commander nights, and private play at Kitsune.
          </p>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.arcaneMark} aria-hidden="true">
            <span className={styles.arcaneRing}>
              <i className="ms ms-planeswalker" />
            </span>
          </div>
          <span className={styles.introLabel}>Phoenix&apos;s Premier MTG Hub</span>
          <h2 className={styles.introHeading}>Where Craft Beer Meets the Multiverse</h2>
          <p className={styles.introBody}>
            Kitsune Brewing Co. isn&apos;t just a brewery; it&apos;s a sanctuary for Magic: The Gathering players. We&apos;ve
            curated a space where the competitive spirit of gaming meets the relaxed atmosphere of a modern taproom.
            Whether you&apos;re here for a high-stakes tournament or a casual EDH pod, we provide the perfect environment
            for every Planeswalker.
          </p>
        </div>
      </section>

      {/* ── Bento Feature Cards ── */}
      <section className={styles.bentoSection}>
        <div className={styles.bentoInner}>
          <div className={styles.bentoGrid}>
            {bentoCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`${styles.bentoCard} ${styles[`tone${card.tone}`]}`}
                style={{
                  gridColumn: `span ${card.colSpan}`,
                  height: `${card.height}px`,
                }}
              >
                <div className={styles.bentoImg} style={{ backgroundImage: `url('${card.img}')`, backgroundPosition: card.bgPosition ?? "center", backgroundSize: card.bgSize ?? "cover" }} />
                <div className={styles.bentoGradient} />
                <div className={styles.bentoText}>
                  <h3 className={styles.bentoTitle}>{card.title}</h3>
                  <p className={styles.bentoDesc}>{card.desc}</p>
                  {card.btnLabel && (
                    <span className={card.btnStyle === "primary" ? styles.bentoBtnPrimary : styles.bentoBtnOutline}>
                      {card.btnLabel}
                    </span>
                  )}
                </div>
              </Link>
            ))}

            {/* Private Events — full-width, side gradient */}
            <Link
              href="/private-events"
              className={`${styles.bentoCard} ${styles.bentoCardWide}`}
              style={{ gridColumn: "span 12", height: "300px" }}
            >
              <div className={styles.bentoImg} style={{ backgroundImage: `url('${BENTO_IMG}')`, backgroundPosition: "center", backgroundSize: "cover" }} />
              <div className={styles.bentoGradientSide} />
              <div className={styles.bentoTextCenter}>
                <h3 className={styles.bentoTitleLg}>PRIVATE EVENTS</h3>
                <p className={styles.bentoDescLg}>
                  Host your own private tournament or draft with dedicated table service and premium taproom access.
                </p>
                <span className={styles.bentoBtnUnderline}>BOOK YOUR SPACE</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Weekly Play ── */}
      <section className={styles.scheduleSection}>
        <div className={styles.scheduleInner}>
          <div className={styles.scheduleHeader}>
            <div>
              <span className={styles.scheduleLabel}>Schedule</span>
              <h2 className={styles.scheduleHeading}>MONTHLY PLAY</h2>
            </div>
            <Link href="/events" className={styles.scheduleCalLink}>
              FULL CALENDAR →
            </Link>
          </div>
          <div className={styles.scheduleRows}>
            {schedule.length === 0 ? (
              <p style={{ color: "var(--color-muted)", padding: "24px 0", fontSize: 14 }}>
                No upcoming events scheduled. Check back soon!
              </p>
            ) : schedule.map((row, index) => (
              <Link key={`${row.day}-${row.title}`} href={`/events/${row.slug}`} className={styles.scheduleRow}>
                <i
                  className={`ms ms-${manaSymbols[index % manaSymbols.length]} ms-cost ${styles.scheduleMana}`}
                  aria-hidden="true"
                />
                <span className={styles.scheduleDay}>{row.day}</span>
                <div className={styles.scheduleInfo}>
                  <h4 className={styles.scheduleEventTitle}>{row.title}</h4>
                  <p className={styles.scheduleEventDesc}>{row.desc}</p>
                </div>
                <span className={styles.scheduleTime}>{row.time}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <div className={styles.ctaBg} style={{ backgroundImage: `url('${CTA_IMG}')` }} />
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaHeading}>READY TO PLAY?</h2>
          <p className={styles.ctaBody}>
            Join the Kitsune community and elevate your Magic experience. Visit our taproom today for products, events,
            and a cold brew.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/card-shop" className={styles.ctaBtnPrimary}>SHOP ONLINE</Link>
            <a
              href="https://maps.google.com/?q=Kitsune+Brewing+Co+3321+E+Bell+Rd+Phoenix+AZ+85032"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaBtnOutline}
            >
              GET DIRECTIONS
            </a>
          </div>
        </div>
      </section>

      {/* ── MTG Footer ── */}
      <footer className={styles.mtgFooter}>
        <p className={styles.mtgFooterName}>Kitsune Brewing Co.</p>
        <div className={styles.mtgFooterLinks}>
          <a href="tel:+16022458593" className={styles.mtgFooterLink}>(602) 245-8593</a>
          <a href="http://instagram.com/kitsunebrewingco" target="_blank" rel="noopener noreferrer" className={styles.mtgFooterLink}>Instagram</a>
          <a href="https://www.facebook.com/KitsuneBrewCo" target="_blank" rel="noopener noreferrer" className={styles.mtgFooterLink}>Facebook</a>
        </div>
        <p className={styles.mtgFooterCopy}>
          &copy; {new Date().getFullYear()} Kitsune Brewing Company. 3321 E Bell Rd Suite B-5 Phoenix, AZ 85032
        </p>
      </footer>
    </>
  );
}
