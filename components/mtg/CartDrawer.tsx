"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const { items, totalCount, totalPrice, isOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={closeCart} />}
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`} aria-label="Shopping cart">
        <div className={styles.header}>
          <h2 className={styles.title}>
            CART ({totalCount})
          </h2>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">✕</button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <p className={styles.emptyHint}>Add items to get started.</p>
          </div>
        ) : (
          <>
            <ul className={styles.itemList}>
              {items.map(({ card, quantity }) => (
                <li key={card.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{card.name}</span>
                    <span className={styles.itemMeta}>{card.set} · {card.condition}{card.foil ? " · Foil" : ""}</span>
                    <span className={styles.itemPrice}>${(card.price * quantity).toFixed(2)}</span>
                  </div>
                  <div className={styles.itemControls}>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(card.id, quantity - 1)} aria-label="Decrease">−</button>
                    <span className={styles.qty}>{quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(card.id, quantity + 1)}
                      disabled={quantity >= card.quantity}
                      aria-label="Increase"
                    >+</button>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(card.id)} aria-label="Remove">✕</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                className={`btn btn-primary ${styles.checkoutBtn}`}
                onClick={handleCheckout}
              >
                Checkout
              </button>
              <button className={styles.clearBtn} onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
