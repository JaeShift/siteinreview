import type { Metadata } from "next";
import SinglesClient from "./SinglesClient";
import { getSinglesStore } from "@/lib/store";
import styles from "./singles.module.css";

export const metadata: Metadata = {
  title: "Shop Magic",
  description:
    "Browse our MTG singles, sealed product, booster boxes, and commander decks at Kitsune Brewing Co. in Phoenix, AZ.",
};

export const dynamic = "force-dynamic";

export default function SinglesPage() {
  const cards = getSinglesStore();
  return (
    <>
      <section className={styles.banner}>
        <div
          className={styles.bannerBg}
          style={{ backgroundImage: `url('/images/singles-cards.png')` }}
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>SHOP MAGIC</h1>
          <div className={styles.bannerAccent} />
        </div>
      </section>

      <SinglesClient initialCards={cards} />
    </>
  );
}
