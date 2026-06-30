import Image from "next/image";
import type { SingleCard as SingleCardType } from "@/lib/singles-data";
import { formatCondition, getConditionColor } from "@/lib/singles-data";
import styles from "./SingleCard.module.css";

interface Props {
  card: SingleCardType;
}

export default function SingleCard({ card }: Props) {
  const conditionColor = getConditionColor(card.condition);

  return (
    <article className={styles.card}>
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
            <button className={`btn btn-primary ${styles.addBtn}`} aria-label={`Add ${card.name} to cart`}>
              Add
            </button>
          ) : (
            <span className={styles.soldOut}>Out of Stock</span>
          )}
        </div>
      </div>
    </article>
  );
}
