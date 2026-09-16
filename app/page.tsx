import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import MenuEmbed from "@/components/MenuEmbed";
import CalendarEmbed from "@/components/CalendarEmbed";
import MapEmbed from "@/components/MapEmbed";
import HeroWordmark from "@/components/HeroWordmark";
import VisitStatus from "@/components/VisitStatus";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Kitsune Brewing Co. — Beer for everybody",
  description: "Independent beer, Magic nights, and a place to belong. Welcome to Kitsune Brewing Company in North Phoenix, founded by Tyler Smith.",
};

export default function HomePage() {
  const { props: desktopHero } = getImageProps({
    src: "/images/home/hero-desktop-v12.png",
    alt: "",
    width: 2172,
    height: 724,
    sizes: "100vw",
  });

  return (
    <div className={styles.home}>
      <section className={styles.poster} aria-labelledby="home-title">
        <div className={styles.heroStage}>
          <picture>
            <source media="(min-width: 761px)" srcSet={desktopHero.srcSet} sizes={desktopHero.sizes} />
            <Image
              src="/images/home/hero-unified-scene-v11.png"
              alt="Kitsune fox pint of amber beer resting on a wooden table in front of a Japanese-inspired mural"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              className={styles.heroBackdrop}
            />
          </picture>
          <div className={styles.heroShade} />
          <div className={styles.heroContent}>
            <span className={styles.heroRule} aria-hidden="true" />
            <div className={styles.heroIdentity}>
              <h1 id="home-title" aria-label="Kitsune"><HeroWordmark className={styles.wordmarkArt} /></h1>
              <p className={styles.heroBrand}><span>Brewing</span><span>Company</span></p>
            </div>
            <p className={styles.heroPromise}>Great beer. Good games.<br />A place to belong.</p>
            <div className={styles.heroActions}>
              <a href="#tap-list" className={styles.solidButton}><span className={styles.heroActionLabel}>Find your beer</span><span className={styles.mobileActionLabel}>Our Beers</span><span className={styles.heroActionArrow} aria-hidden="true">→</span></a>
              <Link href="/mtg-and-more" className={styles.lineButton}><span className={styles.heroActionLabel}>Find your game</span><span className={styles.mobileActionLabel}>Our Games</span><span className={styles.heroActionArrow} aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
        <div className={styles.mobileVisit}><VisitStatus /></div>
        <div className={styles.taproomBar}>
          <p>Your neighborhood taproom</p>
          <span>3321 E Bell Rd · North Phoenix, AZ</span>
          <a href="#visit">Come hang out <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section id="discover" className={styles.manifesto} aria-labelledby="story-title">
        <div className={styles.storyVisual}><figure className={styles.storyPhoto}><Image src="/images/updated.png" alt="Cards and conversation beneath the Kitsune fox mural in the taproom" fill sizes="(max-width: 760px) 100vw, 45vw" /><figcaption>Good company comes with the territory.</figcaption></figure><div className={styles.storySeal}><Image src="/images/logo.png" alt="" fill sizes="112px" /></div></div>
        <div className={styles.manifestoCopy}><p className={styles.eyebrow}>01 / The spirit of Kitsune</p><h2 id="story-title">A brewery with<br /><span>room for you.</span></h2><p>Tyler Smith built Kitsune to bring people together in the neighborhood he grew up in. Inspired by the welcoming bars he visited in Japan, he brought that spirit home to North Phoenix.</p><p>Today, it&apos;s a place for adventurous beer, familiar faces, new friends, and one more game. Beer lover or not, you belong here.</p><a href="#visit" className={styles.storyLink}>Make yourself at home <span aria-hidden="true">↗</span></a></div>
      </section>

      <div className={styles.brandRibbon} aria-hidden="true"><span>Independent spirit</span><Image src="/images/logo.png" alt="" width={38} height={38} /><span>Beer for everybody</span><Image src="/images/logo.png" alt="" width={38} height={38} /><span>North Phoenix, AZ</span></div>

      <section id="tap-list" className={styles.menuSection} aria-labelledby="tap-title">
        <header className={styles.sectionHead}><div><p className={styles.eyebrow}>02 / A little adventure in every pour</p><h2 id="tap-title">Good beer.<br /><span>Your kind of good.</span></h2></div><p>Hazy, crisp, tart, or a little unexpected. Explore the live taproom lineup and find your next favorite pour.</p></header>
        <div className={styles.tapFeature}><Image src="/images/uploads/fox-tails-tap-panorama.png" alt="Handcrafted fox-tail tap handles at Kitsune" fill sizes="100vw" priority /><div><span>From our taps.</span><strong>To your table.</strong></div><span className={styles.photoIndex}>KITSUNE / NORTH PHOENIX</span></div>
        <MenuEmbed />
      </section>

      <section id="magic" className={styles.playSection} aria-labelledby="play-title">
        <div className={styles.playStage}>
          <Image className={styles.playImage} src="/images/uploads/magic spread.png" alt="Magic Commander decks and boosters at Kitsune" fill sizes="100vw" />
          <div className={styles.playShade} aria-hidden="true" />
          <div className={styles.playHeadline}>
            <p className={styles.eyebrow}>03 / Play at Kitsune</p>
            <h2 id="play-title"><span className={styles.magicTitle}>Magic</span><span className={styles.magicSubtitle}>The Gathering</span></h2>
            <p className={styles.playTagline}>Find your next game.</p>
          </div>
        </div>
        <nav className={styles.playLinks} aria-label="Magic at Kitsune">
          <Link href="/commander-nights"><span>Commander nights</span><span aria-hidden="true">↗</span></Link>
          <Link href="/pre-release"><span>Prereleases</span><span aria-hidden="true">↗</span></Link>
          <Link href="/card-shop"><span>Shop Magic</span><span aria-hidden="true">↗</span></Link>
        </nav>
      </section>
      <section id="calendar" className={styles.calendarSection} aria-labelledby="calendar-title">
        <header className={styles.sectionHead}><div><p className={styles.eyebrow}>04 / Make a night of it</p><h2 id="calendar-title">Something good<br /><span>is coming up.</span></h2></div><div><p>Game nights, new releases, and neighborhood hangs. There&apos;s always a reason to make it a Kitsune night.</p><Link href="/events" className={styles.solidButton}>Browse events <span aria-hidden="true">↗</span></Link></div></header>
        <div className={styles.calendarFrame}><CalendarEmbed compact /></div>
        <div className={styles.noticeboard}><Link href="/private-events"><small>Bring your whole crew</small><strong>Your party. Our place.</strong><span>Private events ↗</span></Link><Link href="/shop"><small>Take the fox with you</small><strong>Rep your local.</strong><span>Shop brewery goods ↗</span></Link></div>
      </section>

      <section id="visit" className={styles.visitSection} aria-labelledby="visit-title"><div className={styles.visitCopy}><p className={styles.eyebrow}>05 / Your neighborhood, your brewery</p><h2 id="visit-title">Find the fox.<br />Stay a while.</h2><address>3321 E Bell Rd, Suite B-5<br />Phoenix, AZ 85032</address><a className={styles.solidButton} href="https://www.google.com/maps/dir/?api=1&destination=Kitsune+Brewing+Company+Phoenix+AZ" target="_blank" rel="noreferrer">Get directions <span aria-hidden="true">↗</span></a><Link className={styles.contactLink} href="/contact">Get in touch ↗</Link></div><div className={styles.mapFrame}><MapEmbed preview /></div></section>
    </div>
  );
}
