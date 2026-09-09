"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { MerchandiseProduct } from "@/lib/merchandise-data";
import styles from "./shop.module.css";

export default function ShopClient({ products }: { products: MerchandiseProduct[] }) {
  const { addToCart, openCart } = useCart();
  const [category, setCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );
  const visible = category === "All"
    ? products
    : products.filter((product) => product.category === category);

  return (
    <>
      <div className={styles.filters} aria-label="Filter merchandise">
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? styles.filterActive : styles.filter}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingBag size={32} strokeWidth={1.4} />
          <h2>Merch is coming soon.</h2>
          <p>Check back for Kitsune apparel, glassware, and taproom goods.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {visible.map((product) => (
            <article className={styles.card} key={product.id}>
              <div className={styles.imageWrap}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={styles.image}
                  />
                ) : (
                  <div className={styles.imageFallback}>
                    <ShoppingBag size={40} strokeWidth={1.2} />
                  </div>
                )}
                <span className={styles.category}>{product.category}</span>
              </div>
              <div className={styles.cardBody}>
                <div>
                  <h2>{product.name}</h2>
                  <p>{product.description}</p>
                  {product.sizes.length > 0 && (
                    <label className={styles.sizePicker}>
                      Size
                      <select
                        value={selectedSizes[product.id] ?? product.sizes[0]}
                        onChange={(event) => setSelectedSizes((current) => ({
                          ...current,
                          [product.id]: event.target.value,
                        }))}
                      >
                        {product.sizes.map((size) => <option key={size}>{size}</option>)}
                      </select>
                    </label>
                  )}
                </div>
                <div className={styles.cardFooter}>
                  <strong>${product.price.toFixed(2)}</strong>
                  <button
                    onClick={() => {
                      const selectedSize = product.sizes.length
                        ? selectedSizes[product.id] ?? product.sizes[0]
                        : undefined;
                      addToCart({
                        ...product,
                        id: selectedSize ? `${product.id}::${selectedSize}` : product.id,
                        inventoryId: product.id,
                        selectedSize,
                      });
                      openCart();
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
