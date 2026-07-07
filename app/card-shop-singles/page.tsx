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
          style={{ backgroundImage: `url('/images/singles-card.png')` }}
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>SINGLES</h1>
          <div className={styles.bannerAccent} />
        </div>
      </section>

      <SinglesClient initialCards={cards} />
    </>
  );
}
