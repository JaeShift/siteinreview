"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Plus, ShoppingBag } from "lucide-react";
import type { MerchandiseProduct } from "@/lib/merchandise-data";
import { useCart } from "@/lib/cart-context";
import styles from "./FeaturedMerchandise.module.css";

// Visual concepts only. These never enter inventory, pricing, or the cart.
const collectionPreview = [
  { name: "Kitsune tee", image: "/images/merch/tee-concept-v1.webp", alt: "Design concept: a black tee with the Kitsune fox logo" },
  { name: "Kitsune hat", image: "/images/merch/cap-concept-v1.webp", alt: "Design concept: a black cap with the Kitsune fox logo" },
  { name: "Pint glass", image: "/images/merch/pint-concept-v1.webp", alt: "Design concept: a clear pint glass with the Kitsune fox logo" },
];

const priceFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function FeaturedMerchandise({ products }: { products: MerchandiseProduct[] }) {
  const { addToCart, openCart } = useCart();

  return (
    <section id="merch" className={styles.section} aria-labelledby="merch-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>Kitsune<br />Brewing Co.</p>
            <h2 id="merch-title" className={styles.title}>Merch</h2>
          </div>
          <p className={styles.tagline}>Good beer.<br />Better gear.</p>
        </header>

        {!products.length && <p className={styles.previewNote}>Collection preview <span aria-hidden="true">/</span> Product photos coming soon</p>}

        <div className={styles.grid}>
          {products.length ? products.map(product => (
            <article key={product.id} className={styles.product}>
              <Link href={`/shop#${encodeURIComponent(product.id)}`} className={styles.photo} aria-label={`Shop ${product.name}`}>
                {product.imageUrl
                  ? <Image unoptimized src={product.imageUrl} alt={product.name} fill sizes="(max-width: 760px) 90vw, (max-width: 960px) 44vw, 30vw" />
                  : <span className={styles.missingPhoto}><ShoppingBag size={40} strokeWidth={1.2} aria-hidden="true" />Photo coming soon</span>}
              </Link>
              <div className={styles.details}>
                <div>
                  <h3><Link href={`/shop#${encodeURIComponent(product.id)}`}>{product.name}</Link></h3>
                  <p className={styles.price}>{priceFormatter.format(product.price).replace(/\.00$/, "")}</p>
                </div>
                {product.sizes.length > 0 ? (
                  <Link href={`/shop#${encodeURIComponent(product.id)}`} className={styles.action} aria-label={`Choose options for ${product.name}`} title="Choose options">
                    <ArrowUpRight size={24} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                ) : (
                  <button type="button" className={styles.action} aria-label={`Add ${product.name} to cart`} title="Add to cart" onClick={() => {
                    addToCart({ ...product, inventoryId: product.id });
                    openCart();
                  }}>
                    <Plus size={25} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                )}
              </div>
            </article>
          )) : collectionPreview.map(item => (
            <article key={item.name} className={styles.product}>
              <div className={styles.photo}>
                <Image unoptimized src={item.image} alt={item.alt} fill sizes="(max-width: 760px) 90vw, (max-width: 960px) 44vw, 30vw" />
              </div>
              <div className={styles.details}>
                <div><h3>{item.name}</h3><p className={styles.previewLabel}>Design preview</p></div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/shop" className={styles.shopLink}>{products.length ? "Shop all merch" : "Explore merch"} <ArrowRight size={21} strokeWidth={1.5} aria-hidden="true" /></Link>
          <p className={styles.signoff}>Drink. Play. Shop. Belong.</p>
        </div>
      </div>
    </section>
  );
}
