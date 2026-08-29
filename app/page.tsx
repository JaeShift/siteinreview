import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import MenuEmbed from "@/components/MenuEmbed";
import CalendarEmbed from "@/components/CalendarEmbed";
import MapEmbed from "@/components/MapEmbed";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Kitsune Brewing Co. — Phoenix, AZ",
  description:
    "Welcome to Kitsune Brewing Co. — a craft brewery and taproom in Phoenix, AZ. Check out our rotating taps, events calendar, and upcoming MTG nights.",
};

export default function HomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-title">
        <Image
          src="/images/updated logo3.png"
          alt="Kitsune fox illustration with blue moon and swirling clouds"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Independently brewed · North Phoenix, Arizona</p>
          <h1 id="home-title">This is our<br />neighborhood.<br />This is our beer.</h1>
          <p className={styles.heroCopy}>
            Built with the belief that great beer should bring people together.
          </p>
          <div className={styles.heroActions}>
            <Link href="#tap-list" className={styles.primaryButton}>See what&apos;s on tap</Link>
            <Link href="#discover" className={styles.lightButton}>Meet Kitsune</Link>
          </div>
        </div>
        <a href="#discover" className={styles.scrollCue} aria-label="Explore the brewery">
          <span>Explore</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <nav className={styles.destinationStrip} aria-label="Explore Kitsune">
        <Link href="#discover"><span>01</span>Kitsune Brewing Co</Link>
        <Link href="/events"><span>02</span>Events</Link>
        <Link href="/card-shop"><span>03</span>Card shop</Link>
        <Link href="/mtg-and-more"><span>04</span>MTG &amp; more</Link>
        <Link href="#visit"><span>05</span>Find us</Link>
      </nav>

      <section id="discover" className={styles.storySection}>
        <div className={styles.storyImage}>
          <Image
            src="/images/updated.png"
            alt="Guests gathering inside the Kitsune Brewing Co. taproom"
            fill
            sizes="(max-width: 800px) 100vw, 52vw"
          />
          <span className={styles.imageStamp}>01 / Kitsune Brewing Co</span>
        </div>
        <div className={styles.storyCopy}>
          <p className={styles.kicker}>Built to bring people together</p>
          <h2>More than a place for beer.</h2>
          <p>
            Born from a love of craft beer, Japanese culture, and bringing people
            together, Kitsune is a North Phoenix brewery where creative pours, game
            nights, and good company share the same table.
          </p>
          <Link href="/contact" className={styles.textLink}>Our story <span>→</span></Link>
        </div>
      </section>

      <section className={styles.exploreSection} aria-labelledby="explore-title">
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>There&apos;s always something going on</p>
            <h2 id="explore-title">Pick your poison.</h2>
          </div>
          <p>A new beer to try. A game to play. A food truck pulling up or one of our community events. Whatever brings you in, there&apos;s usually a reason to stay.</p>
        </header>

        <div className={styles.editorialGrid}>
          <Link href="/mtg-and-more" className={`${styles.featureCard} ${styles.featureCardLarge}`}>
            <Image src="/images/fox - Copy.png" alt="" fill sizes="(max-width: 800px) 100vw, 60vw" />
            <span className={styles.cardScrim} />
            <span className={styles.cardContent}>
              <small>Cards · Games · Community</small>
              <strong>Beer in hand.<br />Cards on the table.</strong>
              <em>Explore MTG &amp; More →</em>
            </span>
          </Link>

          <Link href="#tap-list" className={`${styles.featureCard} ${styles.orangeCard}`}>
            <Image
              src="/images/8815ba60-ddcc-4b88-9f51-825e34cddabf.png"
              alt=""
              fill
              sizes="(max-width: 800px) 100vw, 45vw"
            />
            <span className={styles.cardScrim} />
            <span className={styles.cardContent}>
              <small>Brewed at Kitsune</small>
              <strong>Familiar styles with a twist.</strong>
              <em>See what&apos;s on tap →</em>
            </span>
          </Link>

          <Link href="/food-trucks" className={`${styles.featureCard} ${styles.creamCard}`}>
            <span className={styles.creamCardMark}>
              <Image
                src="/images/logo.png"
                alt="Kitsune Brewing Co."
                width={240}
                height={240}
                className={styles.creamCardLogo}
              />
              <span className={styles.manaSymbols} aria-hidden="true">
                <i className="ms ms-w ms-cost" />
                <i className="ms ms-u ms-cost" />
                <i className="ms ms-b ms-cost" />
                <i className="ms ms-r ms-cost" />
                <i className="ms ms-g ms-cost" />
              </span>
            </span>
          </Link>
        </div>
      </section>

      <section className={styles.gatherSection} aria-labelledby="gather-title" hidden>
        <Image
          src="/images/home/gather.jpg"
          alt="Friends gathering over beer at the Kitsune taproom"
          fill
          sizes="100vw"
          className={styles.gatherImage}
        />
        <div className={styles.gatherShade} />
        <div className={styles.gatherHeading}>
          <p className={styles.eyebrow}>More than a round of drinks</p>
          <h2 id="gather-title">Gather at the den.</h2>
        </div>
        <div className={styles.gatherCards}>
          <article>
            <span>Community</span>
            <h3>Make a night of it</h3>
            <p>Weekly happenings, special releases, and reasons to bring the whole crew.</p>
            <Link href="/calendar">Browse the calendar →</Link>
          </article>
          <article>
            <span>Your occasion</span>
            <h3>Bring the party here</h3>
            <p>Host your next celebration, meetup, or company gathering with Kitsune.</p>
            <Link href="/private-events">Plan a private event →</Link>
          </article>
        </div>
      </section>

      <section id="tap-list" className={`${styles.embedSection} ${styles.tapSection}`} aria-labelledby="tap-title">
        <div className={styles.embedIntro}>
          <div>
            <p className={styles.kicker}>Pouring now</p>
            <h2 id="tap-title">What&apos;s on tap.</h2>
          </div>
          <p>Our lineup changes with the season, our curiosity, and what tastes especially good right now.</p>
        </div>
        <div className={styles.embedFrame}>
          <MenuEmbed />
        </div>
      </section>

      <section id="calendar" className={`${styles.embedSection} ${styles.calendarSection}`} aria-labelledby="calendar-title">
        <div className={styles.embedIntro}>
          <div>
            <p className={styles.kicker}>Save the date</p>
            <h2 id="calendar-title">What&apos;s going on.</h2>
          </div>
          <div className={styles.embedIntroAction}>
            <p>Game nights, brewery gatherings, food trucks, and everything in between.</p>
            <Link href="/events" className={styles.textLink}>View featured events <span>↗</span></Link>
          </div>
        </div>
        <div className={`${styles.embedFrame} ${styles.calendarFrame}`}>
          <CalendarEmbed />
        </div>
      </section>

      <section id="visit" className={styles.visitSection} aria-labelledby="visit-title">
        <div className={styles.visitCopy}>
          <p className={styles.kicker}>3321 E Bell Rd · Phoenix</p>
          <h2 id="visit-title">Find your way to Kitsune.</h2>
          <p>
            Look for the fox at Suite B-5. Bring a friend, find a seat, and let us pour you something good.
          </p>
          <address>
            3321 E Bell Rd, Suite B-5<br />
            Phoenix, AZ 85032
          </address>
          <div className={styles.visitActions}>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Kitsune+Brewing+Company+Phoenix+AZ"
              target="_blank"
              rel="noreferrer"
              className={styles.primaryButton}
            >
              Get directions
            </a>
            <a href="tel:+16022458593" className={styles.outlineButton}>(602) 245-8593</a>
          </div>
        </div>
        <div className={`${styles.embedFrame} ${styles.mapFrame}`}>
          <MapEmbed />
        </div>
      </section>
    </div>
  );
}
