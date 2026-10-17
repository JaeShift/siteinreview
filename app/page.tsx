import type { Metadata } from "next";
import { Anton, Bodoni_Moda } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin, Phone } from "lucide-react";
import MenuEmbed from "@/components/MenuEmbed";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import MapEmbed from "@/components/MapEmbed";
import HeroWordmark from "@/components/HeroWordmark";
import FeaturedInventory from "@/components/home/FeaturedInventory";
import FeaturedMerchandise from "@/components/home/FeaturedMerchandise";
import Reveal from "@/components/home/Reveal";
import { getEventsStore, getMerchandiseStore, getPrereleaseEventStore, getSinglesStore } from "@/lib/store";
import { selectFeaturedProducts, selectUpcomingEvents } from "@/lib/home-content";
import { DIRECTIONS_URL, TAPROOM_HOURS, formatDayHours } from "@/lib/taproom-hours";
import original from "./home.module.css";
import styles from "./landing.module.css";

const mobileDisplay = Anton({ subsets: ["latin"], weight: "400", variable: "--font-mobile-display", display: "swap" });
const mobileItalic = Bodoni_Moda({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-mobile-italic", display: "swap", adjustFontFallback: false });

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Kitsune Brewing Co. — Beer, events & Magic in North Phoenix",
  description: "Independent beer. A place to play. Find upcoming Kitsune events, shop Magic cards, explore the live tap list, and visit our North Phoenix brewery.",
};

function KitsuneStory() {
  return (
    <div className={styles.communityStory}>
      <p>Independent beer, Japanese inspiration, and a love for the neighborhood. Kitsune brings people together in North Phoenix—around a pint, a table, or a favorite game.</p>
      <div className={styles.communityLinks}>
        <Link href="/mtg-and-more">Magic & more <ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link href="/commander-nights">Find your Commander pod <ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link href="/private-events">Host a private event <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}

// Combine consecutive days only while their hours match the shared schedule.
const visitHours = TAPROOM_HOURS.reduce<Array<{ firstDay: string; lastDay: string; hours: string }>>((rows, day) => {
  const hours = formatDayHours(day);
  const previous = rows[rows.length - 1];
  if (previous?.hours === hours) previous.lastDay = day.day;
  else rows.push({ firstDay: day.day, lastDay: day.day, hours });
  return rows;
}, []);

export default async function HomePage() {
  const events = selectUpcomingEvents(getEventsStore(), await getPrereleaseEventStore());
  const products = selectFeaturedProducts(getSinglesStore());
  const merch = getMerchandiseStore().filter(product =>
    product.active && product.quantity > 0 && product.id?.trim() && product.name?.trim()
    && Number.isFinite(product.price) && product.price >= 0
  ).slice(0, 4);

  return (
    <div className={`${styles.page} ${mobileDisplay.variable} ${mobileItalic.variable}`}>
      <section className={styles.hero} aria-label="Kitsune Brewing Company">
        <div className={styles.heroPattern} aria-hidden="true"><picture><source media="(max-width: 760px)" srcSet="/images/home/hero-cream-clouds-mobile-v2.webp" /><Image src="/images/home/hero-cream-clouds-v2.webp" alt="" fill priority quality={90} sizes="100vw" className={styles.heroBackdrop} /></picture></div>
        <div className={`${styles.heroInner} ${styles.desktopHeroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>Independent brewery <span className={styles.kickerSeparator} aria-hidden="true">·</span> <span className={styles.kickerLocation}>North Phoenix</span></p>
            <h1 id="home-title" className={styles.heroHeadline} aria-label="Kitsune Brewing Company"><HeroWordmark tone="ink" aria-hidden="true" className={styles.heroWordmark} /></h1>
            <div className={styles.heroMessage}>
            <p className={styles.heroTagline}><span>Good beer.</span>{" "}<span>Good company.</span></p>
            <p className={styles.heroPromise}><span>Independent beer,</span>{" "}<span>taproom events,</span><br className={styles.heroCopyBreak} /> <span>and a place to belong.</span></p>
            <div className={styles.heroActions}><Link href="/#tap-list" className={styles.outlineButton}>Our beers <ArrowUpRight size={18} aria-hidden="true" /></Link><Link href="/calendar" className={styles.primaryButton}>What’s happening <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <picture><source media="(max-width: 760px)" srcSet="/images/home/mobile-fox-pint-fit-v4.webp" /><Image src="/images/home/hero-cream-glass-v1.webp" alt="An amber pint of Kitsune beer, printed with the orange fox, curling clouds, and blue circle" fill priority quality={95} sizes="(max-width: 760px) 46vw, (max-width: 1100px) 380px, 414px" className={styles.heroGlass} /></picture>
            <Image src="/images/home/hero-cream-glass-print-v2.webp" alt="" aria-hidden="true" fill priority quality={95} sizes="(max-width: 760px) 220px, (max-width: 1100px) 380px, 414px" className={styles.heroGlassPrint} />
          </div>
        </div>
        <div className={styles.mobileDesertHero}>
          <div className={styles.mobileDesertCopy}>
            <p className={styles.mobileDesertKicker}>Independent beer <span aria-hidden="true">/</span> North Phoenix, AZ</p>
            <h1 className={styles.mobileDesertHeadline}><span>Good beer.</span>{" "}<em>Bold pours.</em></h1>
            <p className={styles.mobileDesertPromise}>A fresh pint, an easy conversation,<br /> and a place that feels like yours.</p>
            <div className={styles.mobileDesertActions}>
              <Link href="/#tap-list">What’s on tap <ArrowRight aria-hidden="true" size={20} /></Link>
              <Link href="/calendar">View events <ArrowRight aria-hidden="true" size={20} /></Link>
            </div>
          </div>
          <svg className={styles.mobileReferencePour} viewBox="280 450 308 530" role="img" aria-labelledby="mobile-pour-title">
            <title id="mobile-pour-title">Amber beer in a clear glass resting on a rugged dark rock</title>
            <defs>
              <clipPath id="mobile-pour-outline" clipPathUnits="userSpaceOnUse">
                <path d="M410 480 C434 462 504 454 548 464 Q570 460 588 466 L588 923 Q514 932 435 923 L429 882 L423 794 L417 699 L412 598 Z" />
                <path d="M280 959 L293 957 L300 944 L307 939 L312 925 L321 922 L329 911 L340 906 L352 909 L366 909 L377 902 L387 895 L399 887 L410 883 L424 888 L440 905 L477 918 L538 918 L588 915 L588 980 L280 980 Z" />
              </clipPath>
              <filter id="mobile-print-feather"><feGaussianBlur stdDeviation="1.5" /></filter>
              <mask id="mobile-print-area" maskUnits="userSpaceOnUse" x="435" y="567" width="133" height="194">
                <rect x="439" y="571" width="125" height="186" rx="5" fill="white" filter="url(#mobile-print-feather)" />
              </mask>
            </defs>
            <g clipPath="url(#mobile-pour-outline)">
              <image href="/images/home/mobile-reference-glass-rock.jpg" x="0" y="0" width="588" height="1280" />
              <image href="/images/home/mobile-reference-beer-detail-v5.webp" x="0" y="0" width="588" height="1280" mask="url(#mobile-print-area)" />
            </g>
          </svg>
        </div>
      </section>

      <section id="magic" className={styles.shopSection} aria-labelledby="shop-title">
        <Reveal><header className={styles.shopHeader}><h2 id="shop-title" className={styles.shopHeading}>Featured<br />in the shop.</h2><Link href="/card-shop" className={styles.shopLink}><span>Shop all cards</span><ArrowUpRight size={24} aria-hidden="true" /></Link></header></Reveal>
        <Reveal>{products.length ? <FeaturedInventory products={products} /> : <div className={styles.emptyShop}><p>Check the card shop for the latest available inventory.</p><Link href="/card-shop" className={styles.primaryButton}>Browse Magic <ArrowUpRight size={18} aria-hidden="true" /></Link></div>}</Reveal>
        <div className={styles.shopFootnote}><p>Find your next card. Make yourself at home.</p><Link href="/shop">Looking for Kitsune merchandise? <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </section>

      <section id="tap-list" className={`${original.home} ${original.menuSection} ${styles.tapSection}`} aria-labelledby="tap-title">
        <div className={styles.tapIntro}>
          <a className={styles.lineupLink} href="#taproom-lineup"><span>Fresh from the taps</span><h2 id="tap-title">The taproom lineup</h2><i aria-hidden="true"><span /><ArrowDown size={24} /><span /></i></a>
          <figure className={styles.tapFigure}>
            <div className={`${original.tapFeature} ${styles.tapPhoto}`}><Image src="/images/uploads/fox-tails-tap-panorama.png" alt="Handcrafted fox-tail tap handles at Kitsune" fill sizes="100vw" /><span className={original.photoIndex}>KITSUNE / NORTH PHOENIX</span></div>
            <figcaption className={styles.tapCaption}>Kitsune / North Phoenix<span aria-hidden="true" /></figcaption>
          </figure>
        </div>
        <div id="taproom-lineup" className={styles.tapMenu}><MenuEmbed /></div>
      </section>

      <section id="calendar" className={styles.eventsSection} aria-label="Events and taproom calendar">
        <UpcomingEvents events={events} />
      </section>

      <FeaturedMerchandise products={merch} />

      <section id="discover" className={styles.communitySection} aria-labelledby="community-title">
        <Reveal className={styles.communityGrid}>
          <div className={styles.communityPhoto}>
            <Image src="/images/updated.png" alt="Cards and conversation beneath the Kitsune fox mural in the taproom" fill sizes="(max-width: 760px) 100vw, 50vw" />
            <span>Good company comes with the territory.</span>
          </div>
          <div className={styles.communityCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.communityDesktop}>The spirit of Kitsune</span>
              <span className={styles.communityMobile}>About Kitsune</span>
            </p>
            <h2 id="community-title">
              <span className={styles.communityDesktop}>A brewery.<br /><em>A gathering place.</em></span>
              <span className={styles.communityMobile}>A closer look<br />at Kitsune.</span>
            </h2>
            <p className={`${styles.communityMobile} ${styles.communityTagline}`}>Beer, cards, and a place to belong.</p>
            <details className={`${styles.communityMobile} ${styles.communityDetails}`}>
              <summary>Get to know us <ArrowUpRight size={22} aria-hidden="true" /></summary>
              <KitsuneStory />
            </details>
            <div className={styles.communityDesktop}><KitsuneStory /></div>
          </div>
        </Reveal>
      </section>

      <section id="visit" className={styles.visitSection} aria-labelledby="visit-title">
        <div className={styles.visitHours}>
          <div className={styles.visitHeading}>
            <h2 id="visit-title">Taproom<br />hours</h2>
            <p className={styles.visitTagline}>Good beer.<br />Better company.</p>
            <div className={styles.visitDesert} aria-hidden="true">
              <Image src="/images/home/taproom-desert-sun-v1.png" alt="" fill sizes="(max-width: 760px) 60vw, 30vw" />
            </div>
          </div>
          <div className={styles.hoursCard}>
            <dl className={styles.hoursList}>
              {visitHours.map(row => <div key={row.firstDay}>
                <dt>{row.firstDay === row.lastDay ? row.firstDay : `${row.firstDay.slice(0, 3)}–${row.lastDay.slice(0, 3)}`}</dt>
                <dd>{row.hours}</dd>
              </div>)}
            </dl>
            <p className={styles.hoursTimezone}>Phoenix local time</p>
          </div>
        </div>
        <div className={styles.visitDirections}>
          <div className={styles.visitActions}>
            <a href="tel:+16022458593" className={styles.callLink}><Phone size={20} aria-hidden="true" /><span>Call to confirm</span><ArrowRight size={18} aria-hidden="true" /></a>
            <a href={DIRECTIONS_URL} className={styles.directionsLink}><MapPin size={20} aria-hidden="true" /><span>Get directions</span><ArrowRight size={18} aria-hidden="true" /></a>
          </div>
          <div className={styles.map}><MapEmbed /></div>
        </div>
      </section>
    </div>
  );
}
