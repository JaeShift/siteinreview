import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/Hero";
import PageSection from "@/components/PageSection";
import OnTapMenu from "@/components/OnTapMenu";
import CalendarEmbed from "@/components/CalendarEmbed";
import MapEmbed from "@/components/MapEmbed";
import { getMenuStore } from "@/lib/store";
import type { MenuCategory } from "@/lib/menu-data";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Kitsune Brewing Co. — Phoenix, AZ",
  description:
    "Welcome to Kitsune Brewing Co. — a craft brewery and taproom in Phoenix, AZ. Check out our rotating taps, events calendar, and upcoming MTG nights.",
};

// Always read the latest menu from the store (updated via admin panel)
export const dynamic = "force-dynamic";

export default function HomePage() {
  const menuData = getMenuStore();
  const menuCategories = Object.keys(menuData) as MenuCategory[];

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
        <OnTapMenu menuData={menuData} menuCategories={menuCategories} />
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
