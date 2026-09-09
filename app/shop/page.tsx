import type { Metadata } from "next";
import Image from "next/image";
import ShopClient from "./ShopClient";
import { getMerchandiseStore } from "@/lib/store";
import styles from "./shop.module.css";

export const metadata: Metadata = {
  title: "Merch Shop",
  description: "Shop Kitsune Brewing Co. apparel, drinkware, and taproom merchandise.",
};
export const dynamic = "force-dynamic";

export default function ShopPage() {
  const products = getMerchandiseStore().filter(
    (product) => product.active && product.quantity > 0
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p>Kitsune Brewing Co. · Phoenix, Arizona</p>
            <h1>Wear<br />the fox.</h1>
            <span>Taproom goods, brewery gear, and Kitsune originals—made for regulars, road trips, and the next round.</span>
          </div>
          <div className={styles.heroMark} aria-hidden="true">
            <span>Den Supply Co.</span>
            <Image src="/images/logo.png" alt="" width={240} height={240} priority />
            <small>Est. in Phoenix</small>
          </div>
        </div>
      </section>
      <section className={styles.catalog}>
        <header className={styles.catalogHeader}>
          <div>
            <p>From the taproom</p>
            <h2>The den supply.</h2>
          </div>
          <span>{products.length} {products.length === 1 ? "product" : "products"} available</span>
        </header>
        <ShopClient products={products} />
      </section>
    </div>
  );
}
