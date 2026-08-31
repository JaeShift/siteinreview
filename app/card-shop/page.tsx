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
  const cards = getSinglesStore().filter((c) => c.quantity > 0);
  return (
    <>
      <section className={styles.banner}>
        <div
          className={styles.bannerBg}
          style={{ backgroundImage: `url('/images/singles-cards.png')` }}
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerMana} aria-hidden="true">
            <i className="ms ms-w ms-cost" />
            <i className="ms ms-u ms-cost" />
            <i className="ms ms-b ms-cost" />
            <i className="ms ms-r ms-cost" />
            <i className="ms ms-g ms-cost" />
          </div>
          <h1 className={styles.bannerTitle}>SHOP MAGIC</h1>
        </div>
      </section>

      <SinglesClient initialCards={cards} />
    </>
  );
}
