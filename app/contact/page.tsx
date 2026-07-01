import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import AddressBar from "@/components/AddressBar";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Kitsune Brewing Co. in Phoenix, AZ. Send us a message, find our address, or give us a call.",
};

export default function ContactPage() {
  return (
    <>
      <section className={styles.contactSection}>
        <div className="container">
          <h1 className={styles.contactHeading}>Contact Us</h1>
          <p className={styles.contactSubtitle}>Please complete the form below</p>
          <ContactForm />
        </div>
      </section>
      <AddressBar />
    </>
  );
}
