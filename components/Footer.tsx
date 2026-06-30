import Link from "next/link";
import Image from "next/image";
import SocialLinks from "./SocialLinks";
import styles from "./Footer.module.css";

const hours = [
  { day: "Monday", hours: "3:00 PM – 9:00 PM" },
  { day: "Tuesday", hours: "3:00 PM – 9:00 PM" },
  { day: "Wednesday", hours: "3:00 PM – 9:00 PM" },
  { day: "Thursday", hours: "3:00 PM – 9:00 PM" },
  { day: "Friday", hours: "Closed" },
  { day: "Saturday", hours: "Closed" },
  { day: "Sunday", hours: "Closed" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.footerInner} container`}>
        <div className={styles.footerLogoCol}>
          <Link href="/" aria-label="Kitsune Brewing Co — Home">
            <Image
              src="/images/logo.png"
              alt="Kitsune Brewing Co"
              width={80}
              height={80}
            />
          </Link>
          <p className={styles.footerTagline}>Kitsune Brewing Company</p>
        </div>

        <div className={styles.footerCol}>
          <h3 className={styles.footerHeading}>Visit Us</h3>
          <address className={styles.footerAddress}>
            <p>3321 E Bell Rd Suite B-5</p>
            <p>Phoenix, AZ 85032</p>
          </address>
          <a href="tel:+16022458593" className={styles.footerLink}>
            (602) 245-8593
          </a>
          <a href="mailto:Tyler@KitsuneBeerCo.com" className={styles.footerLink}>
            Tyler@KitsuneBeerCo.com
          </a>
          <SocialLinks className={styles.footerSocial} iconSize={22} />
        </div>

        <div className={styles.footerCol}>
          <h3 className={styles.footerHeading}>Hours</h3>
          <ul className={styles.footerHours}>
            {hours.map(({ day, hours: h }) => (
              <li key={day} className={styles.footerHoursRow}>
                <span className={styles.footerHoursDay}>{day}</span>
                <span
                  className={
                    h === "Closed"
                      ? styles.footerHoursTimeClosed
                      : styles.footerHoursTime
                  }
                >
                  {h}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerCol}>
          <h3 className={styles.footerHeading}>Navigate</h3>
          <nav className={styles.footerNav} aria-label="Footer navigation">
            <Link href="/" className={styles.footerNavLink}>Home</Link>
            <Link href="/casino-night" className={styles.footerNavLink}>Casino Night</Link>
            <Link href="/mtg-and-more" className={styles.footerNavLink}>MTG and More</Link>
            <Link href="/magic-mamas-pre-release" className={styles.footerNavLink}>Magic Mamas Pre-Release</Link>
            <Link href="/contact" className={styles.footerNavLink}>Contact Us</Link>
          </nav>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={`container ${styles.footerBottomInner}`}>
          <p>© {new Date().getFullYear()} Kitsune Brewing Co. All rights reserved.</p>
          <p>Phoenix, AZ</p>
        </div>
      </div>
    </footer>
  );
}
