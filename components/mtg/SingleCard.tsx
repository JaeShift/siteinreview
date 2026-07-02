"use client";

import { useState } from "react";
import Image from "next/image";
import type { SingleCard as SingleCardType } from "@/lib/singles-data";
import { formatCondition, getConditionColor, formatSetDisplay, normalizeRarity } from "@/lib/singles-data";
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

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    addToCart(card);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <>
      <article className={styles.card} onClick={() => setModalOpen(true)}>
        {/* Standalone card image */}
        <div className={styles.imageWrap}>
          <div
            className={styles.imageBg}
            style={{ backgroundImage: `url('${card.imageUrl}')` }}
          />
        </div>

        {/* Separate info panel below */}
        <div className={styles.body} style={{ position: "relative" }}>
          {card.foil && <span className={styles.foilBadge}>✦ Foil</span>}
          <div className={styles.bodyTop}>
            <h3 className={styles.name}>{card.name}</h3>
            <p className={styles.setName}>{formatSetDisplay(card.set, card.setCode, card.collectorNumber)}</p>
          </div>
          <div className={styles.metaFixed}>
            <p className={styles.metaRarity}>{normalizeRarity(card.rarity)}</p>
            <p className={styles.metaCond} style={{ color: conditionColor }}>{formatCondition(card.condition)}</p>
          </div>
          <p className={styles.price}>${card.price.toFixed(2)}</p>
          <button
            className={styles.viewBtn}
            onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
            aria-label={`View ${card.name}`}
          >
            VIEW PRODUCT →
          </button>
        </div>
      </article>

      {modalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setModalOpen(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={card.name}
          >
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
              </div>

              <div className={styles.modalInfo}>
                <h2 className={styles.modalName}>{card.name}</h2>

                <div className={styles.modalDetails}>
                  {[
                    ["Set", formatSetDisplay(card.set, card.setCode, card.collectorNumber)],
                    ["Type", card.type],
                    ["Color", card.color],
                    ["Rarity", normalizeRarity(card.rarity)],
                    ...(card.manaCost ? [["Mana Cost", card.manaCost]] : []),
                    ["Condition", formatCondition(card.condition)],
                    ["Stock", card.quantity > 0 ? (card.quantity <= 3 ? `${card.quantity} available — Low Stock` : `${card.quantity} available`) : "Out of Stock"],
                  ].map(([label, value]) => (
                    <div key={label} className={styles.modalRow}>
                      <span className={styles.modalLabel}>{label}</span>
                      <span
                        className={styles.modalValue}
                        style={label === "Condition" ? { color: conditionColor } : undefined}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
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
