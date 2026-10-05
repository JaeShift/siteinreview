import type { Metadata } from "next";
import { Anton, Bodoni_Moda } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import MenuEmbed from "@/components/MenuEmbed";
import UpcomingEvents from "@/components/home/UpcomingEvents";
import MapEmbed from "@/components/MapEmbed";
import HeroWordmark from "@/components/HeroWordmark";
import FeaturedInventory from "@/components/home/FeaturedInventory";
import Reveal from "@/components/home/Reveal";
import { getEventsStore, getPrereleaseEventStore, getSinglesStore } from "@/lib/store";
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

export default async function HomePage() {
  const events = selectUpcomingEvents(getEventsStore(), await getPrereleaseEventStore());
  const products = selectFeaturedProducts(getSinglesStore());

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

      <section id="tap-list" className={`${original.home} ${original.menuSection} ${styles.tapSection}`} aria-labelledby="tap-title">
        <div className={styles.tapIntro}>
          <header className={`${original.sectionHead} ${styles.tapHead}`}><div><p className={`${original.eyebrow} ${styles.tapEyebrow}`}><span>A little adventure<br className={styles.mobileBreak} /> in every pour</span></p><h2 id="tap-title">Find your pour.<br /><span>Your kind of good.</span></h2></div><p>Hazy, crisp, tart, or a little unexpected. <span>Find your next favorite pour.</span></p></header>
          <figure className={styles.tapFigure}>
            <div className={`${original.tapFeature} ${styles.tapPhoto}`}><Image src="/images/uploads/fox-tails-tap-panorama.png" alt="Handcrafted fox-tail tap handles at Kitsune" fill sizes="100vw" /><div><span>From our taps.</span><strong>To your table.</strong></div><span className={original.photoIndex}>KITSUNE / NORTH PHOENIX</span></div>
            <figcaption className={styles.tapCaption}>Kitsune / North Phoenix<span aria-hidden="true" /></figcaption>
          </figure>
        </div>
        <a className={styles.lineupLink} href="#taproom-lineup"><span>Fresh from the taps</span><strong>The taproom lineup</strong><i aria-hidden="true"><span /><ArrowDown size={24} /><span /></i></a>
        <div id="taproom-lineup" className={styles.tapMenu}><MenuEmbed /></div>
      </section>

      <section id="calendar" className={styles.eventsSection} aria-label="Events and taproom calendar">
        <UpcomingEvents events={events} />
      </section>
      <section id="magic" className={styles.shopSection} aria-labelledby="shop-title">
        <Reveal><header className={styles.sectionHead}><div><p className={styles.eyebrow}>For your next game</p><h2 id="shop-title">Featured in the shop.</h2></div><Link href="/card-shop" className={styles.textLink}>Shop all cards <ArrowUpRight size={18} aria-hidden="true" /></Link></header></Reveal>
        <Reveal>{products.length ? <FeaturedInventory products={products} /> : <div className={styles.emptyShop}><p>Check the card shop for the latest available inventory.</p><Link href="/card-shop" className={styles.primaryButton}>Browse Magic <ArrowUpRight size={18} aria-hidden="true" /></Link></div>}</Reveal>
        <div className={styles.shopFootnote}><p>Find your next card. Make yourself at home.</p><Link href="/shop">Looking for Kitsune merchandise? <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      </section>

      <section id="discover" className={styles.communitySection} aria-labelledby="community-title">
        <Reveal className={styles.communityGrid}><div className={styles.communityPhoto}><Image src="/images/updated.png" alt="Cards and conversation beneath the Kitsune fox mural in the taproom" fill sizes="(max-width: 760px) 100vw, 50vw" /><span>Good company comes with the territory.</span></div><div className={styles.communityCopy}><p className={styles.eyebrow}>The spirit of Kitsune</p><h2 id="community-title">A brewery.<br /><em>A gathering place.</em></h2><p>Independent beer, Japanese inspiration, and a love for the neighborhood. Kitsune brings people together in North Phoenix—around a pint, a table, or a favorite game.</p><div className={styles.communityLinks}><Link href="/mtg-and-more">Magic & more <ArrowUpRight size={18} aria-hidden="true" /></Link><Link href="/commander-nights">Find your Commander pod <ArrowUpRight size={18} aria-hidden="true" /></Link><Link href="/private-events">Host a private event <ArrowUpRight size={18} aria-hidden="true" /></Link></div></div></Reveal>
      </section>

      <section id="visit" className={styles.visitSection} aria-labelledby="visit-title"><div className={styles.visitCopy}><p className={styles.eyebrow}>Your neighborhood brewery</p><h2 id="visit-title">Find the fox.<br /><em>Stay a while.</em></h2><address>3321 E Bell Rd, Suite B-5<br />Phoenix, AZ 85032</address><div className={styles.visitActions}><a href={DIRECTIONS_URL} className={styles.primaryButton}>Get directions <ArrowUpRight size={18} aria-hidden="true" /></a><Link href="/contact" className={styles.textLink}>Get in touch <ArrowUpRight size={18} aria-hidden="true" /></Link></div><div className={styles.hours}><h3>Taproom hours</h3><ul>{TAPROOM_HOURS.map(day => <li key={day.day}><span>{day.day}</span><span>{formatDayHours(day)}</span></li>)}</ul><p>All times local to Phoenix.</p></div></div><div className={styles.map}><MapEmbed /></div></section>
    </div>
  );
}
