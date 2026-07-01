import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/Hero";
import PageSection from "@/components/PageSection";
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
    <>
      {/* Hero Banner */}
      <Hero
        src="/images/banner.png"
        alt="Kitsune Brewing Co. — Phoenix, Arizona"
      />

      {/* What's On Tap — Menu */}
      <PageSection background="white" id="menu">
        <Image src="/images/whats-on.png" alt="What's On Tap?" width={500} height={58} className={styles.sectionHeading} />
        <MenuEmbed />
      </PageSection>

      {/* What's Going On — Events Calendar */}
      <PageSection background="light" id="events" className={styles.eventsSection}>
        <Image src="/images/whats-going-on.png" alt="What's Going On at Kitsune?" width={500} height={58} className={styles.sectionHeading} />
        <CalendarEmbed />
      </PageSection>

      {/* Where Are We — Map + Address */}
      <PageSection background="white" id="location">
        <Image src="/images/where-are-we.png" alt="Where Are We?" width={500} height={58} className={styles.sectionHeading} />
        <MapEmbed />
      </PageSection>
    </>
  );
}
