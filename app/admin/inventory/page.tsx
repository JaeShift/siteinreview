import type { Metadata } from "next";
import { singles, formatCondition } from "@/lib/singles-data";
import styles from "./admin-inventory.module.css";

export const metadata: Metadata = { title: "Inventory" };

export default function AdminInventoryPage() {
  const totalValue = singles.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const totalQty = singles.reduce((sum, c) => sum + c.quantity, 0);
  const bySet = singles.reduce<Record<string, number>>((acc, c) => {
    acc[c.set] = (acc[c.set] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory</h1>
          <p className={styles.subtitle}>{singles.length} unique cards · {totalQty} total copies</p>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-outline" disabled title="Import CSV (coming soon)">Import CSV</button>
          <button className="btn btn-primary" disabled title="Add card (coming soon)">+ Add Card</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Cards</span>
          <span className={styles.statValue}>{singles.length}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Copies</span>
          <span className={styles.statValue}>{totalQty}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Estimated Value</span>
          <span className={styles.statValue}>${totalValue.toFixed(2)}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Sets Represented</span>
          <span className={styles.statValue}>{Object.keys(bySet).length}</span>
        </div>
      </div>

      {/* Inventory table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <span>Card Name</span>
          <span>Set</span>
          <span>Condition</span>
          <span>Foil</span>
          <span>Rarity</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Total</span>
          <span>Actions</span>
        </div>
        {singles.map((card) => (
          <div key={card.id} className={styles.tableRow}>
            <span className={styles.cardName}>{card.name}</span>
            <span className={styles.setCode}>{card.setCode}</span>
            <span className={styles.condition}>{card.condition}</span>
            <span className={`${styles.foil} ${card.foil ? styles.foilYes : ""}`}>
              {card.foil ? "Foil" : "—"}
            </span>
            <span className={`${styles.rarityBadge} ${styles[`rarity_${card.rarity}`]}`}>
              {card.rarity[0]}
            </span>
            <span className={styles.price}>${card.price.toFixed(2)}</span>
            <span className={`${styles.qty} ${card.quantity <= 2 ? styles.qtyLow : ""}`}>{card.quantity}</span>
            <span className={styles.total}>${(card.price * card.quantity).toFixed(2)}</span>
            <div className={styles.actionsCell}>
              <button className={styles.actionBtn} disabled title="Edit (coming soon)">✎</button>
              <button className={styles.actionBtn} disabled title="Delete (coming soon)">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
