import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import SocialLinks from "@/components/SocialLinks";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Kitsune Brewing Co. in Phoenix, AZ. Send us a message, find our address, or give us a call.",
};

export default function ContactPage() {
  return (
    <>
      <div className="page-banner">
        <h1>Contact Us</h1>
      </div>

      <section className={styles.contactSection}>
        <div className={`container ${styles.contactGrid}`}>
          <div>
            <p className={styles.contactSubtitle}>Please complete the form below</p>
            <ContactForm />
          </div>

          <aside className={styles.contactInfoCol}>
            <div className={styles.infoBlock}>
              <h3 className={styles.infoHeading}>Address</h3>
              <address className={styles.infoAddress}>
                3321 E Bell Rd Suite B-5<br />
                Phoenix, AZ 85032
              </address>
            </div>

            <div className={styles.infoBlock}>
              <h3 className={styles.infoHeading}>Phone</h3>
              <a href="tel:+16022458593" className={styles.infoLink}>
                (602) 245-8593
              </a>
            </div>

            <div className={styles.infoBlock}>
              <h3 className={styles.infoHeading}>Email</h3>
              <a href="mailto:Tyler@KitsuneBeerCo.com" className={styles.infoLink}>
                Tyler@KitsuneBeerCo.com
              </a>
            </div>

            <div className={styles.infoBlock}>
              <h3 className={styles.infoHeading}>Follow Us</h3>
              <SocialLinks iconSize={24} />
            </div>

            <div className={styles.infoBlock}>
              <h3 className={styles.infoHeading}>Hours</h3>
              <ul className={styles.hoursList}>
                {[
                  ["Mon", "3pm – 9pm"],
                  ["Tue", "3pm – 9pm"],
                  ["Wed", "3pm – 9pm"],
                  ["Thu", "3pm – 9pm"],
                  ["Fri", "Closed"],
                  ["Sat", "Closed"],
                  ["Sun", "Closed"],
                ].map(([day, h]) => (
                  <li key={day} className={styles.hoursRow}>
                    <span className={styles.hoursDay}>{day}</span>
                    <span className={h === "Closed" ? styles.closed : undefined}>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
