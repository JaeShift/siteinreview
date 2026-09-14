import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { load } from "cheerio";
import { getEventsStore } from "@/lib/store";
import styles from "./mtg.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Magic at Kitsune",
  description: "Commander, prereleases, singles, and sealed Magic products at Kitsune Brewing Co. in North Phoenix.",
};

const destinations = [
  { title: "Commander nights", label: "01 / Find your people", desc: "Your favorite deck. A new pod. One more game with good company.", href: "/commander-nights", action: "Find your night", image: "/images/fox - Copy.png", alt: "Beer, decks, and a Kitsune playmat ready for a game" },
  { title: "Fresh packs. New possibilities.", label: "02 / Prerelease events", desc: "Crack a new set and take your first deck for a spin.", href: "/pre-release", action: "Explore prereleases", image: "/images/uploads/magic spread.png", alt: "Sealed Magic decks and boosters at Kitsune" },
  { title: "Your next great draw.", label: "03 / The card shop", desc: "Singles and sealed Magic for whatever you're building.", href: "/card-shop", action: "Shop Magic", image: "/images/uploads/upclose die.png", alt: "Magic cards and twenty-sided dice beside a Kitsune beer" },
];

function plainText(value: string) {
  const document = load(value);
  document("script, style").remove();
  return document.root().text().replace(/\s+/g, " ").trim();
}

function eventDate(date: string) {
  const day = new Date(`${date}T12:00:00`);
  return {
    month: day.toLocaleDateString("en-US", { month: "short" }),
    day: day.toLocaleDateString("en-US", { day: "numeric" }),
    weekday: day.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

function eventTime(time: string) {
  return time.trim().replace(/\s*(AM|PM)$/i, " $1");
}

export default function MtgPage() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" });
  const schedule = getEventsStore()
    .filter((event) => event.date >= today && !event.hidden)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="magic-hero-title">
        <Image src="/images/uploads/beer and magic.png" alt="Kitsune beer, Magic decks, and boosters gathered on a playmat" fill priority sizes="100vw" className={styles.heroPhoto} />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Magic: The Gathering at Kitsune</p>
          <h1 id="magic-hero-title">Good games.<br /><em>Great company.</em></h1>
          <p className={styles.heroDescription}>A favorite deck. A fresh pour. A seat at the table.<br className={styles.desktopBreak} /> Welcome to the Magic side of Kitsune.</p>
          <div className={styles.heroActions}>
            <a href="#mtg-schedule" className={styles.primaryBtn}>Find a game <ArrowDown size={18} aria-hidden="true" /></a>
            <Link href="/card-shop" className={styles.outlineBtn}>Shop Magic <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={styles.heroNote} aria-hidden="true"><span>Shuffle. Sip.</span><strong>Repeat.</strong></div>
        <span className={styles.photoCredit}>The table is better together.</span>
      </section>

      <div className={styles.tableStrip}><span>Bring your deck.</span><span>Find your people.</span><span>Stay for another.</span></div>

      <section className={styles.explore} aria-labelledby="explore-magic-title">
        <header className={styles.sectionHead}>
          <div><p className={styles.kicker}>A little friendly competition</p><h2 id="explore-magic-title">Find your <em>table.</em></h2></div>
          <p>From a familiar Commander deck to a brand-new set, there&apos;s a place for your kind of Magic.</p>
        </header>
        <nav className={styles.destinationGrid} aria-label="Explore Magic at Kitsune">
          {destinations.map((item, index) => (
            <Link key={item.href} href={item.href} className={`${styles.destination} ${index === 0 ? styles.featuredDestination : ""}`}>
              <div className={styles.destinationPhoto}><Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 100vw, 50vw" /></div>
              <div className={styles.destinationCopy}><p className={styles.cardLabel}>{item.label}</p><h3>{item.title}</h3><p>{item.desc}</p><span className={styles.cardAction}>{item.action}<ArrowUpRight size={22} aria-hidden="true" /></span></div>
            </Link>
          ))}
        </nav>
      </section>

      <section id="mtg-schedule" className={styles.schedule} aria-labelledby="schedule-title">
        <header className={styles.sectionHead}>
          <div><p className={styles.kicker}>Put it on the calendar</p><h2 id="schedule-title">Next <em>up.</em></h2></div>
          <Link href="/calendar" className={styles.textLink}>Full calendar <ArrowUpRight size={18} aria-hidden="true" /></Link>
        </header>
        {schedule.length === 0 ? (
          <div className={styles.empty}><h3>Your next game is out there.</h3><p>New event dates are on the way. Explore Commander nights or check the full calendar for your next visit.</p><Link href="/commander-nights" className={styles.textLink}>Explore Commander <ArrowRight size={18} aria-hidden="true" /></Link></div>
        ) : (
          <ol className={styles.eventList}>
            {schedule.map((event) => {
              const date = eventDate(event.date);
              return <li key={event.slug}>
                <Link href={event.format === "Prerelease" ? "/pre-release" : `/events/${event.slug}`} className={styles.eventCard}>
                  <div className={styles.eventPhoto}>
                    <Image src={event.bannerImageUrl || event.imageUrl || "/images/uploads/upclose die.png"} alt="" fill sizes="(max-width: 700px) 100vw, 45vw" />
                    <time dateTime={event.date} className={styles.dateBadge}><span>{date.month}</span><strong>{date.day}</strong></time>
                  </div>
                  <div className={styles.eventCopy}>
                    <p className={styles.cardLabel}>{event.format} · {date.weekday}</p>
                    <h3>{event.title}</h3>
                    <p className={styles.eventDescription}>{plainText(event.shortDescription)}</p>
                    <div className={styles.eventMeta}><span><Clock3 size={16} aria-hidden="true" />{eventTime(event.time)}{event.endTime ? ` – ${eventTime(event.endTime)}` : ""}</span><span><MapPin size={16} aria-hidden="true" />Kitsune Brewing Co.</span></div>
                    <span className={styles.cardAction}>Event details <ArrowUpRight size={22} aria-hidden="true" /></span>
                  </div>
                </Link>
              </li>;
            })}
          </ol>
        )}
        <Link href="/events" className={styles.allEvents}>Browse all events <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>

      <section className={styles.private} aria-labelledby="private-title">
        <div className={styles.privatePhoto}><Image src="/images/updated.png" alt="Players gathered around the tables at Kitsune" fill sizes="(max-width: 700px) 100vw, 45vw" /><span>Make a night of it.</span></div>
        <div className={styles.privateCopy}>
          <p className={styles.kicker}>Bring the whole crew</p>
          <h2 id="private-title">Your people.<br /><em>Your kind of night.</em></h2>
          <p>A birthday draft, a group meetup, or a private game night. Bring your people. We&apos;ll make room.</p>
          <Link href="/private-events" className={styles.lightBtn}>Plan a private event <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link href="/contact" className={styles.textLink}>Let&apos;s talk <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
