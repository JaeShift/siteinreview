"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatCondition, formatSetDisplay } from "@/lib/singles-data";
import styles from "./checkout.module.css";

export default function CartReviewClient() {
  const { items, totalPrice, hydrated, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/card-shop");
  }, [hydrated, items, router]);

  if (!hydrated || items.length === 0) return null;

  return (
    <>
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Left column ── */}
        <div className={styles.leftCol}>
          <h1 className={styles.pageTitle}>Your Cart</h1>

          <div className={styles.itemList}>
            {items.map(({ card, quantity }) => (
              <div key={card.id} className={styles.item}>
                <div className={styles.itemImageWrap}>
                  {card.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.itemImageEmpty}>?</div>
                  )}
                </div>

                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <div>
                      <p className={styles.itemName}>{card.name}</p>
                      <p className={styles.itemMeta}>
                        {formatSetDisplay(card.set, card.setCode, card.collectorNumber)}
                        {" · "}
                        {formatCondition(card.condition)}
                        {card.foil ? " · Foil" : ""}
                      </p>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeFromCart(card.id)}
                      aria-label={`Remove ${card.name}`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className={styles.itemBottom}>
                    <div className={styles.qtyControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(card.id, quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(card.id, quantity + 1)}
                        disabled={quantity >= card.quantity}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className={styles.itemPrice}>
                      ${(card.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column — Summary ── */}
        <aside className={styles.summary}>
          <h2 className={styles.summaryTitle}>Summary</h2>
          <div className={styles.summaryDivider} />

          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Subtotal</span>
              <span className={styles.summaryValue}>${totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Shipping</span>
              <span className={styles.summaryNote}>Calculated at checkout</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Taxes</span>
              <span className={styles.summaryNote}>Calculated at checkout</span>
            </div>
          </div>

          <div className={styles.summaryDivider} />

          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span className={styles.totalLabel}>Estimated Total</span>
            <span className={styles.totalValue}>${totalPrice.toFixed(2)}</span>
          </div>

          <button
            className={styles.purchaseBtn}
            onClick={() => router.push("/checkout/payment")}
          >
            Complete Purchase
          </button>

          <Link href="/card-shop" className={styles.continueLink}>
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>

    <footer className={styles.footer}>
      <p className={styles.footerName}>Kitsune Brewing Co.</p>
      <div className={styles.footerLinks}>
        <a href="tel:+16022458593" className={styles.footerLink}>(602) 245-8593</a>
        <a href="http://instagram.com/kitsunebrewingco" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Instagram</a>
        <a href="https://www.facebook.com/KitsuneBrewCo" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Facebook</a>
      </div>
      <p className={styles.footerCopy}>
        &copy; {new Date().getFullYear()} Kitsune Brewing Company. 3321 E Bell Rd Suite B-5 Phoenix, AZ 85032
      </p>
    </footer>
    </>
  );
}
