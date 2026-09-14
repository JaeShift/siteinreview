import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import AddressBar from "@/components/AddressBar";
import PageSection from "@/components/PageSection";
import PageHero from "@/components/ui/PageHero";
import styles from "./contact.module.css";
export const metadata: Metadata = { title: "Say Hello", description: "Get in touch with Kitsune Brewing Co. in North Phoenix. Questions, events, or your next visit — we'd love to hear from you." };
export default function ContactPage() {
  return (
    <>
      <PageHero kicker="Good conversations start here" title="Hey, neighbor." />
      <PageSection surface="cream" size="md">
        <div className={styles.contactSection}>
          <aside className={styles.contactInfo}>
            <h2>Come on in.<br />Or drop a line.</h2>
            <p>Questions about beer, Magic, or getting your group together? Send us a message.</p>
            <address>3321 E Bell Rd, Suite B-5<br />Phoenix, AZ 85032</address>
            <a href="tel:+16022458593">(602) 245-8593</a>
            <a href="mailto:Tyler@KitsuneBeerCo.com">Tyler@KitsuneBeerCo.com</a>
          </aside>
          <div className={styles.formPanel}>
            <h2>Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </PageSection>
      <AddressBar />
    </>
  );
}
