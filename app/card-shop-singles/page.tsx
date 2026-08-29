import type { Metadata } from "next";
import SinglesClient from "@/app/card-shop/SinglesClient";
import { getSinglesStore } from "@/lib/store";
import styles from "@/app/card-shop/singles.module.css";

export const metadata: Metadata = {
  title: "Singles | Kitsune Brewing Co.",
  description:
    "Browse our full MTG singles inventory at Kitsune Brewing Co. in Phoenix, AZ.",
};

export const dynamic = "force-dynamic";

export default function CardShopSinglesPage() {
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
          <div className={styles.bannerMana} aria-hidden="true">
            <i className="ms ms-w ms-cost" />
            <i className="ms ms-u ms-cost" />
            <i className="ms ms-b ms-cost" />
            <i className="ms ms-r ms-cost" />
            <i className="ms ms-g ms-cost" />
          </div>
          <h1 className={styles.bannerTitle}>SINGLES</h1>
          <div className={styles.bannerAccent} />
        </div>
      </section>

      <SinglesClient initialCards={cards} />
    </>
  );
}
