"use client";

import { useState } from "react";
import type { TaplistMenu } from "@/lib/taplist";
import styles from "./MenuEmbed.module.css";

export default function TaproomMenu({ menu, sourceUrl }: { menu: TaplistMenu; sourceUrl: string }) {
  const [activeId, setActiveId] = useState(menu.sections[0]?.id);
  const section = menu.sections.find((entry) => entry.id === activeId) ?? menu.sections[0];

  return (
    <div className={styles.menuEmbedWrapper}>
      <div className={styles.menuToolbar}>
        <div><p className={styles.statusLabel}>The taproom lineup</p><p className={styles.updatedLabel}>{menu.updatedLabel ? `Updated ${menu.updatedLabel}` : "Live from Taplist"}</p></div>
        <nav className={styles.sectionNav} aria-label="Menu categories">
          {menu.sections.map((entry) => <button key={entry.id} type="button" aria-pressed={entry.id === section?.id} aria-controls="taproom-menu-items" onClick={() => setActiveId(entry.id)}>{entry.title}</button>)}
        </nav>
      </div>
      <div id="taproom-menu-items" className={styles.menuSection}>
        {section && <><div className={styles.sectionTitle}><h3>{section.title}</h3><small>{section.items.length} selections</small></div>
          <ol className={styles.itemList}>
            {section.items.map((item, index) => <li key={item.id} className={styles.menuItem}>
              <span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.itemDetails}><div className={styles.itemHeading}><div><h4>{item.name}</h4>{item.producer && <p>{item.producer}</p>}</div><div className={styles.itemPrices}>{item.prices.map((price) => <div key={`${price.serving}-${price.price}`}><span>{price.serving}</span><strong>{price.price}</strong></div>)}</div></div>
              {(item.style || item.metrics.length > 0) && <ul className={styles.itemMeta} aria-label={`${item.name} details`}>{item.style && <li>{item.style}</li>}{item.metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul>}</div>
            </li>)}
          </ol></>}
      </div>
      <p className={styles.menuNote}>Availability changes with the pours. <a href={sourceUrl} target="_blank" rel="noreferrer">Full menu on Taplist ↗</a></p>
    </div>
  );
}
