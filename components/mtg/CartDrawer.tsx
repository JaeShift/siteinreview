"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/lib/cart-context";
import styles from "./CartDrawer.module.css";

interface UndoEntry {
  cartItem: CartItem;
  insertAfterIndex: number; // index in the combined list where the undo row sits
}

export default function CartDrawer() {
  const { items, totalCount, totalPrice, isOpen, closeCart, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const [undoEntry, setUndoEntry] = useState<UndoEntry | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleRemove(cartItem: CartItem, index: number) {
    removeFromCart(cartItem.card.id);
    setUndoEntry({ cartItem, insertAfterIndex: index });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setUndoEntry(null), 5000);
  }

  function handleUndo() {
    if (!undoEntry) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    for (let i = 0; i < undoEntry.cartItem.quantity; i++) addToCart(undoEntry.cartItem.card);
    setUndoEntry(null);
  }

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  // Build a merged list: live items + the undo row injected at the right position
  type Row =
    | { type: "item"; cartItem: CartItem; liveIndex: number }
    | { type: "undo" };

  const rows: Row[] = [];
  items.forEach((cartItem, i) => {
    if (undoEntry && undoEntry.insertAfterIndex === i) {
      rows.push({ type: "undo" });
    }
    rows.push({ type: "item", cartItem, liveIndex: i });
  });
  // If removed item was last (index === items.length), append undo at end
  if (undoEntry && undoEntry.insertAfterIndex >= items.length) {
    rows.push({ type: "undo" });
  }

  const isEmpty = items.length === 0 && !undoEntry;

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={closeCart} />}
      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`} aria-label="Shopping cart">
        <div className={styles.header}>
          <h2 className={styles.title}>CART ({totalCount})</h2>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">✕</button>
        </div>

        {isEmpty ? (
          <div className={styles.empty}>
            <p>Your cart is empty.</p>
            <p className={styles.emptyHint}>Add items to get started.</p>
          </div>
        ) : (
          <>
            <ul className={styles.itemList}>
              {rows.map((row, rowIdx) => {
                if (row.type === "undo") {
                  const { card } = undoEntry!.cartItem;
                  return (
                    <li key="undo-row" className={styles.undoRow}>
                      {card.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={card.imageUrl} alt={card.name} className={`${styles.itemThumb} ${styles.undoThumb}`} />
                      )}
                      <span className={styles.undoText}>
                        <span className={styles.undoCardName}>{card.name}</span>
                        <span className={styles.undoSub}>removed</span>
                      </span>
                      <button className={styles.undoBtn} onClick={handleUndo}>Undo</button>
                    </li>
                  );
                }

                const { cartItem, liveIndex } = row;
                const { card, quantity } = cartItem;
                return (
                  <li key={card.id} className={styles.item}>
                    {card.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.imageUrl} alt={card.name} className={styles.itemThumb} />
                    )}
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{card.name}</span>
                      <span className={styles.itemMeta}>{card.set} · {card.condition}{card.foil ? " · Foil" : ""}</span>
                      <span className={styles.itemPrice}>${(card.price * quantity).toFixed(2)}</span>
                    </div>
                    <div className={styles.itemControls}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => quantity === 1 ? handleRemove(cartItem, liveIndex) : updateQuantity(card.id, quantity - 1)}
                        aria-label="Decrease"
                      >−</button>
                      <span className={styles.qty}>{quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(card.id, quantity + 1)}
                        disabled={quantity >= card.quantity}
                        aria-label="Increase"
                      >+</button>
                      <button className={styles.removeBtn} onClick={() => handleRemove(cartItem, liveIndex)} aria-label="Remove">✕</button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {items.length > 0 && (
              <div className={styles.footer}>
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalPrice}>${totalPrice.toFixed(2)}</span>
                </div>
                <button className={`btn btn-primary ${styles.checkoutBtn}`} onClick={handleCheckout}>
                  Checkout
                </button>
                <button className={styles.clearBtn} onClick={clearCart}>Clear Cart</button>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}
