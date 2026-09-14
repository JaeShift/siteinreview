import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import { getEventsStore } from "@/lib/store";
import styles from "./mtg.module.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Magic at Kitsune", description: "Commander, prereleases, singles, and sealed Magic products at Kitsune Brewing Co. in North Phoenix." };
const destinations = [
 { title: "Commander nights", desc: "Your favorite deck. A new pod. The next great game.", href: "/commander-nights", action: "Find your night" },
 { title: "Pre-release events", desc: "Open a new set and put your first deck to the test.", href: "/pre-release", action: "See the next event" },
 { title: "The card shop", desc: "Singles and sealed product for whatever you’re building.", href: "/card-shop", action: "Shop Magic" },
 { title: "All events", desc: "Find the next gathering on the Kitsune calendar.", href: "/events", action: "See what’s coming" },
];
function formatDay(date: string) { return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
export default function MtgPage() {
 const today = new Date().toISOString().split("T")[0];
 const schedule = getEventsStore().filter((event) => event.date >= today && !event.hidden).sort((a,b) => a.date.localeCompare(b.date)).slice(0,5);
 return <div className={styles.page}>
  <PageHero variant="split" kicker="Magic: The Gathering at Kitsune" title={<>Good games.<br />Great company.</>} description="We brew beer. We build decks. We make room for one more. Welcome to the Magic side of your neighborhood taproom." image="/images/fox - Copy.png" imageAlt="Magic cards and Kitsune beer sharing a playmat"><Link href="/card-shop" className={styles.primaryBtn}>Shop Magic ↗</Link></PageHero>
  <nav className={styles.destinationGrid} aria-label="Explore Magic at Kitsune">{destinations.map(item=><Link key={item.href} href={item.href} className={styles.destination}><h2>{item.title}</h2><p>{item.desc}</p><span>{item.action} ↗</span></Link>)}</nav>
  <section className={styles.schedule}><header className={styles.sectionHead}><div><p className={styles.kicker}>Around the table</p><h2>Next up.</h2></div><Link href="/calendar" className={styles.textLink}>Full calendar ↗</Link></header>{schedule.length===0?<p className={styles.empty}>No upcoming events are listed yet. Check back for the next night at Kitsune.</p>:<ol className={styles.eventList}>{schedule.map(event=><li key={event.slug}><Link href={event.format==="Prerelease"?"/pre-release":`/events/${event.slug}`} className={styles.eventRow}><time dateTime={event.date}>{formatDay(event.date)}</time><div><strong>{event.title}</strong><small>{event.format}{event.shortDescription?` · ${event.shortDescription}`:""}</small></div><span>{event.time}{event.endTime?` – ${event.endTime}`:""}</span></Link></li>)}</ol>}</section>
  <section className={styles.private}><h2>Your crew.<br />Your kind of night.</h2><div><p>A birthday draft, a group meetup, or a private game night. Bring your people to Kitsune.</p><Link href="/private-events" className={styles.primaryBtn}>Plan a private event ↗</Link><Link href="/contact" className={styles.textLink}>Get in touch ↗</Link></div></section>
 </div>;
}
