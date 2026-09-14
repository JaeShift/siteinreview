import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
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
      <PageHero
        kicker="Kitsune Brewing Co. · Phoenix, Arizona"
        title={<>Wear<br />the fox.</>}
        description="Taproom goods, brewery gear, and Kitsune originals—made for regulars, road trips, and the next round."
      />
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
