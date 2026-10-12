import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import SocialLinks from "./SocialLinks";
import styles from "./Footer.module.css";
import KitsuneWordmark from "./KitsuneWordmark";
import { TAPROOM_HOURS, formatDayHours } from "@/lib/taproom-hours";

const footerNavigation = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Merch Shop" },
  { href: "/card-shop", label: "Card Shop" },
  { href: "/pre-release", label: "Pre-Release" },
  { href: "/events", label: "Events" },
  { href: "/private-events", label: "Private Events" },
  { href: "/calendar", label: "Calendar" },
  { href: "/contact", label: "Contact Us" },
];

export default function Footer({
  showHours = true,
  editorial = true,
}: {
  showHours?: boolean;
  editorial?: boolean;
}) {
  return (
    <footer id="site-footer" className={`${styles.footer} ${editorial ? styles.footerHome : ""}`}>
      <div className={styles.mobileFooter}>
        <div className={`${styles.mobileInner} ${styles.mobileUtility}`}>
          <div className={styles.mobileBrandRow}>
            <Link href="/" className={styles.mobileBrand} aria-label="Kitsune Brewing Co — Home"><KitsuneWordmark decorative /><span>Brewing Company</span></Link>
            <SocialLinks className={styles.mobileSocial} iconSize={19} />
          </div>
          <div className={styles.mobileVisit}>
            <address className={styles.mobileAddress}>3321 E Bell Rd, Suite B-5<br />Phoenix, AZ 85032</address>
            <div className={styles.mobileContact}>
              <a href="tel:+16022458593"><Phone size={17} aria-hidden="true" />(602) 245-8593</a>
              <a href="mailto:Tyler@KitsuneBeerCo.com"><Mail size={17} aria-hidden="true" />Tyler@KitsuneBeerCo.com</a>
            </div>
          </div>
          <nav className={styles.mobileNav} aria-label="Mobile footer navigation">
            {footerNavigation.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
          </nav>
          <div className={styles.mobileLegal}>
            <p>© {new Date().getFullYear()} Kitsune Brewing Co.<br />All rights reserved.</p>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </div>
      <div className={`${styles.brandClosing} container`} aria-hidden="true"><span>Good beer.<br /><em>Better company.</em></span><div className={styles.closingSeal}><Image src="/images/logo.png" alt="" width={84} height={84} /><span>North Phoenix<br />Independent spirit</span></div></div>
      <div className={`${styles.footerInner} ${!showHours ? styles.footerInnerCompact : ""} container`}>
        <div className={styles.footerLogoCol}>
          <Link href="/" aria-label="Kitsune Brewing Co — Home">
            {editorial ? (
              <span className={styles.footerWordmark}><KitsuneWordmark decorative className={styles.wordmarkArt} /><small>Brewing Company</small></span>
            ) : (
              <Image
                src="/images/logo.png"
                alt="Kitsune Brewing Co"
                className={styles.footerMark}
                width={80}
                height={80}
              />
            )}
          </Link>
          <p className={styles.footerTagline}>
            Independent craft brewery · North Phoenix
          </p>
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

        {showHours && (
          <div className={styles.footerCol}>
            <h3 className={styles.footerHeading}>Hours</h3>
            <ul className={styles.footerHours}>
              {TAPROOM_HOURS.map((day) => (
                <li key={day.day} className={styles.footerHoursRow}>
                  <span className={styles.footerHoursDay}>{day.day}</span>
                  <span
                    className={styles.footerHoursTime}
                  >
                    {formatDayHours(day)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.footerCol}>
          <h3 className={styles.footerHeading}>Navigate</h3>
          <nav className={styles.footerNav} aria-label="Footer navigation">
            {footerNavigation.map(link => <Link key={link.href} href={link.href} className={styles.footerNavLink}>{link.label}</Link>)}
          </nav>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={`container ${styles.footerBottomInner}`}>
          <p>© {new Date().getFullYear()} Kitsune Brewing Co. All rights reserved.</p>
          <p>Phoenix, AZ</p>
          <Link href="/admin" className={styles.adminLink}>Admin</Link>
        </div>
      </div>
    </footer>
  );
}
