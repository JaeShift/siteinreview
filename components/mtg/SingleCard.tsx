"use client";

import { useState, useRef, useEffect } from "react";
import type { SingleCard as SingleCardType } from "@/lib/singles-data";
import { formatCondition, getConditionColor, formatSetDisplay, normalizeRarity } from "@/lib/singles-data";
import { useCart } from "@/lib/cart-context";
import styles from "./SingleCard.module.css";

const MANA_CLASS: Record<string, string> = {
  // Basic colors
  W: "ms-w", U: "ms-u", B: "ms-b", R: "ms-r", G: "ms-g", C: "ms-c",
  // Numbers
  "0": "ms-0","1": "ms-1","2": "ms-2","3": "ms-3","4": "ms-4","5": "ms-5",
  "6": "ms-6","7": "ms-7","8": "ms-8","9": "ms-9","10": "ms-10",
  "11": "ms-11","12": "ms-12","13": "ms-13","14": "ms-14","15": "ms-15",
  "16": "ms-16","20": "ms-20",
  // Variable / special
  X: "ms-x", Y: "ms-y", Z: "ms-z", S: "ms-s", E: "ms-e",
  T: "ms-tap", Q: "ms-untap",
  // Hybrid (two-color guild pairs, canonical Scryfall order)
  "W/U": "ms-wu", "U/B": "ms-ub", "B/R": "ms-br", "R/G": "ms-rg", "G/W": "ms-gw",
  "W/B": "ms-wb", "U/R": "ms-ur", "B/G": "ms-bg", "R/W": "ms-rw", "G/U": "ms-gu",
  // 2-hybrid
  "2/W": "ms-2w", "2/U": "ms-2u", "2/B": "ms-2b", "2/R": "ms-2r", "2/G": "ms-2g",
  // Phyrexian
  "W/P": "ms-wp", "U/P": "ms-up", "B/P": "ms-bp", "R/P": "ms-rp", "G/P": "ms-gp",
  P: "ms-p",
};

function ManaCost({ cost }: { cost?: string | null }) {
  if (!cost) return null;
  // For double-faced cards Scryfall returns "FRONT // BACK" — show front face only
  const frontCost = cost.split(" // ")[0];
  const symbols = Array.from(frontCost.matchAll(/\{([^}]+)\}/g)).map((m) => m[1]);
  if (!symbols.length) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {symbols.map((sym, i) => {
        const cls = MANA_CLASS[sym.toUpperCase()] ?? "ms-generic";
        return <i key={i} className={`ms ms-cost ${cls}`} style={{ fontSize: 16 }} />;
      })}
    </span>
  );
}

interface Props {
  card: SingleCardType;
}

interface BackFaceData {
  name?: string;
  type_line?: string;
  mana_cost?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
}

export default function SingleCard({ card }: Props) {
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [fromRect, setFromRect] = useState<DOMRect | null>(null);
  const [fetchedBack, setFetchedBack] = useState<BackFaceData | null>(null);
  const modalImgRef = useRef<HTMLImageElement>(null);
  const conditionColor = getConditionColor(card.condition);
  const hasBackFace = !!card.backImageUrl;
  const displayImage = flipped && card.backImageUrl ? card.backImageUrl : card.imageUrl;

  // If the card has a back image but no stored back-face text, fetch it from Scryfall when the modal opens
  useEffect(() => {
    if (!modalOpen || !hasBackFace || card.backOracleText || fetchedBack) return;
    const name = card.name.split(" // ")[0].trim();
    const set = card.setCode?.toLowerCase();
    const num = card.collectorNumber;
    const url = num && set
      ? `https://api.scryfall.com/cards/${set}/${num}`
      : `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}${set ? `&set=${set}` : ""}`;
    fetch(url)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const back = data?.card_faces?.[1];
        if (back) setFetchedBack(back);
      })
      .catch(() => null);
  }, [modalOpen, hasBackFace, card, fetchedBack]);

  const inCart = items.find((i) => i.card.id === card.id);

  function handleAdd() {
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
            style={{ backgroundImage: `url('${displayImage}')` }}
          />
          {hasBackFace && (
            <button
              className={styles.cardFlipBtn}
              onClick={(e) => { e.stopPropagation(); setFlipped((v) => !v); }}
              aria-label={flipped ? "Show front face" : "Show back face"}
              title={flipped ? "Show front" : "Show back"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6"/>
                <path d="M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
          )}
        </div>

        {/* Separate info panel below */}
        <div className={styles.body}>
          <div className={styles.bodyTop}>
            <h3 className={styles.name}>{card.name}</h3>
            <p className={styles.setName}>{formatSetDisplay(card.set, card.setCode, card.collectorNumber)}</p>
          </div>
          <div className={styles.metaFixed}>
            <div className={styles.metaRarityRow}>
              <p className={styles.metaRarity}>{normalizeRarity(card.rarity)}</p>
              {card.foil && <span className={styles.foilBadge}>✦ Foil</span>}
              {card.quantity === 1 && <span className={styles.lowStockBadge}>Low Stock</span>}
            </div>
            <p className={styles.metaCond} style={{ color: conditionColor }}>{formatCondition(card.condition)}</p>
          </div>
          <div className={styles.cardFooter}>
            <span className={styles.price}>${card.price.toFixed(2)}</span>
            <button
              className={styles.quickAddBtn}
              onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
              aria-label={`View ${card.name}`}
              title="View card"
            >
              <span className={styles.quickViewLabel}>VIEW →</span>
            </button>
          </div>
          {card.quantity > 0 ? (
            <button
              className={`${styles.viewBtn} ${added ? styles.viewBtnAdded : ""} ${inCart && inCart.quantity >= card.quantity ? styles.viewBtnMax : ""}`}
              onClick={(e) => { e.stopPropagation(); handleAdd(); }}
              disabled={!!(inCart && inCart.quantity >= card.quantity)}
              aria-label={`Add ${card.name} to cart`}
            >
              {added
                ? "✓ ADDED"
                : inCart && inCart.quantity >= card.quantity
                  ? "MAX IN CART"
                  : "ADD TO CART"}
            </button>
          ) : (
            <button className={`${styles.viewBtn} ${styles.viewBtnSoldOut}`} disabled aria-label={`${card.name} is sold out`}>
              SOLD OUT
            </button>
          )}
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
              <div className={styles.modalImageCol}>
                <div
                  className={styles.modalImageWrap}
                  style={{ cursor: "zoom-in" }}
                  onClick={() => {
                    if (modalImgRef.current) setFromRect(modalImgRef.current.getBoundingClientRect());
                    setLightboxOpen(true);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img ref={modalImgRef} src={displayImage} alt={card.name} className={styles.modalImg} />
                </div>
                {hasBackFace && (
                  <button className={styles.flipBtn} onClick={() => setFlipped((v) => !v)}>
                    Flip Card ↩
                  </button>
                )}
              </div>

              <div className={styles.modalInfo}>
                <div className={styles.modalNameRow}>
                  <h2 className={styles.modalName}>
                    {flipped ? (card.backName || fetchedBack?.name || card.name) : card.name}
                  </h2>
                  {card.foil && <span className={styles.foilBadge}>✦ Foil</span>}
                </div>

                <div className={styles.modalDetails}>
                  {(() => {
                    const mc = flipped ? (card.backManaCost || fetchedBack?.mana_cost) : card.manaCost;
                    return mc ? (
                      <div className={styles.modalRow}>
                        <span className={styles.modalLabel}>Mana Cost</span>
                        <span className={styles.modalValue}><ManaCost cost={mc} /></span>
                      </div>
                    ) : null;
                  })()}
                  {[
                    ["Set", formatSetDisplay(card.set, card.setCode, card.collectorNumber)],
                    ["Type", flipped ? (card.backType || fetchedBack?.type_line || card.type) : card.type],
                    ["Rarity", normalizeRarity(card.rarity)],
                    card.cmc !== undefined ? ["Mana Value", String(card.cmc)] : null,
                    card.colorIdentity?.length ? ["Color Identity", card.colorIdentity.join(", ")] : null,
                    flipped
                      ? (() => {
                          const p = card.backPower || fetchedBack?.power;
                          const t = card.backToughness || fetchedBack?.toughness;
                          return p && t ? ["Power / Toughness", `${p} / ${t}`] : null;
                        })()
                      : (card.power && card.toughness ? ["Power / Toughness", `${card.power} / ${card.toughness}`] : null),
                    ["Condition", formatCondition(card.condition)],
                    card.availability ? ["Availability", card.availability] : null,
                  ]
                    .filter((row): row is [string, string] => row !== null)
                    .map(([label, value]) => (
                    <div key={label as string} className={styles.modalRow}>
                      <span className={styles.modalLabel}>{label}</span>
                      <span className={styles.modalValue} style={label === "Condition" ? { color: conditionColor } : undefined}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {(() => {
                  const oracle = flipped ? (card.backOracleText || fetchedBack?.oracle_text) : card.oracleText;
                  return oracle ? <p className={styles.modalOracle}>{oracle}</p> : null;
                })()}

                {card.formats && card.formats.length > 0 && (
                  <div className={styles.modalFormats}>
                    {card.formats.map((f) => (
                      <span key={f} className={styles.modalFormatTag}>{f}</span>
                    ))}
                  </div>
                )}

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
      {lightboxOpen && (() => {
        const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const r = fromRect;
        const startX = r ? (r.left + r.width / 2) - vw / 2 : 0;
        const startY = r ? (r.top + r.height / 2) - vh / 2 : 0;
        const startS = r ? r.width / Math.min(vw * 0.9, r.width * 3) : 0.3;
        return (
          <div className={styles.lightboxBackdrop} onClick={() => setLightboxOpen(false)}
            style={{
              "--lbX": `${startX}px`,
              "--lbY": `${startY}px`,
              "--lbS": startS,
            } as React.CSSProperties}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayImage} alt={card.name} className={styles.lightboxImg} />
          </div>
        );
      })()}
    </>
  );
}
