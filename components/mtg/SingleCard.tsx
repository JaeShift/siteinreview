"use client";

import { useState } from "react";
import Image from "next/image";
import type { SingleCard as SingleCardType } from "@/lib/singles-data";
import { formatCondition, getConditionColor } from "@/lib/singles-data";
import { useCart } from "@/lib/cart-context";
import styles from "./SingleCard.module.css";

interface Props {
  card: SingleCardType;
}

export default function SingleCard({ card }: Props) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const conditionColor = getConditionColor(card.condition);

  const inCart = items.find((i) => i.card.id === card.id);

  function handleAdd() {
    addToCart(card);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <>
      <article className={styles.card} onClick={() => setModalOpen(true)} style={{ cursor: "pointer" }}>
        <div className={styles.imageWrap}>
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 223px"
          />
          {card.foil && <span className={styles.foilBadge}>✦ Foil</span>}
          <span className={styles.rarityDot} data-rarity={card.rarity} aria-label={card.rarity} />
        </div>

        <div className={styles.body}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{card.name}</h3>
          </div>
          <div className={styles.meta}>
            <span className={styles.set}>{card.set}</span>
            <span
              className={styles.condition}
              style={{ color: conditionColor }}
              title={formatCondition(card.condition)}
            >
              {card.condition}
            </span>
          </div>
          <div className={styles.footer}>
            <span className={styles.price}>${card.price.toFixed(2)}</span>
            {card.quantity > 0 ? (
              <button
                className={`btn btn-primary ${styles.addBtn} ${added ? styles.addedBtn : ""}`}
                aria-label={`Add ${card.name} to cart`}
                onClick={(e) => { e.stopPropagation(); handleAdd(); }}
                disabled={inCart ? inCart.quantity >= card.quantity : false}
              >
                {added ? "✓ Added" : inCart ? `In Cart (${inCart.quantity})` : "Add"}
              </button>
            ) : (
              <span className={styles.soldOut}>Out of Stock</span>
            )}
          </div>
        </div>
      </article>

      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={card.name}>
            <button className={styles.modalClose} onClick={() => setModalOpen(false)} aria-label="Close">✕</button>

            <div className={styles.modalGrid}>
              <div className={styles.modalImageWrap}>
                <Image
                  src={card.imageUrl}
                  alt={card.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="400px"
                />
                {card.foil && <span className={styles.foilBadge}>✦ Foil</span>}
                <span className={styles.rarityDot} data-rarity={card.rarity} aria-label={card.rarity} />
              </div>

              <div className={styles.modalInfo}>
                <h2 className={styles.modalName}>{card.name}</h2>

                <div className={styles.modalDetails}>
                  <div className={styles.modalRow}>
                    <span className={styles.modalLabel}>Set</span>
                    <span className={styles.modalValue}>{card.set}</span>
                  </div>
                  <div className={styles.modalRow}>
                    <span className={styles.modalLabel}>Type</span>
                    <span className={styles.modalValue}>{card.type}</span>
                  </div>
                  <div className={styles.modalRow}>
                    <span className={styles.modalLabel}>Color</span>
                    <span className={styles.modalValue}>{card.color}</span>
                  </div>
                  <div className={styles.modalRow}>
                    <span className={styles.modalLabel}>Rarity</span>
                    <span className={styles.modalValue}>{card.rarity}</span>
                  </div>
                  {card.manaCost && (
                    <div className={styles.modalRow}>
                      <span className={styles.modalLabel}>Mana Cost</span>
                      <span className={styles.modalValue}>{card.manaCost}</span>
                    </div>
                  )}
                  <div className={styles.modalRow}>
                    <span className={styles.modalLabel}>Condition</span>
                    <span className={styles.modalValue} style={{ color: conditionColor }}>
                      {formatCondition(card.condition)}
                    </span>
                  </div>
                  <div className={styles.modalRow}>
                    <span className={styles.modalLabel}>Stock</span>
                    <span className={styles.modalValue}>{card.quantity > 0 ? `${card.quantity} available` : "Out of Stock"}</span>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <span className={styles.modalPrice}>${card.price.toFixed(2)}</span>
                  {card.quantity > 0 ? (
                    <button
                      className={`btn btn-primary ${styles.addBtn} ${added ? styles.addedBtn : ""}`}
                      onClick={handleAdd}
                      disabled={inCart ? inCart.quantity >= card.quantity : false}
                    >
                      {added ? "✓ Added" : inCart ? `In Cart (${inCart.quantity})` : "Add to Cart"}
                    </button>
                  ) : (
                    <span className={styles.soldOut}>Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
