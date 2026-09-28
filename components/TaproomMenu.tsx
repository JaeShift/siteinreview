"use client";

import { useId, useState } from "react";
import type { TaplistMenu } from "@/lib/taplist";
import styles from "./MenuEmbed.module.css";

function mobileCategoryLabel(title: string) {
  return /^wine and mixed drinks$/i.test(title) ? "Wine" : title;
}

function separateFlavor(name: string) {
  const match = name.match(/^(.*?)\s*(\([^()]+\))$/);
  return match ? { name: match[1], flavor: match[2] } : { name, flavor: "" };
}

export default function TaproomMenu({ menu, sourceUrl }: { menu: TaplistMenu; sourceUrl: string }) {
  const [activeId, setActiveId] = useState(menu.sections[0]?.id);
  const [expanded, setExpanded] = useState(false);
  const menuId = useId();
  const section = menu.sections.find((entry) => entry.id === activeId) ?? menu.sections[0];

  return (
    <div className={`${styles.menuEmbedWrapper} ${styles.liveMenu}`}>
      <div className={styles.menuToolbar}>
        <div className={styles.menuIntro}>
          <p className={styles.statusLabel}>The taproom lineup</p>
          <h2 className={styles.mobileHeading}><span>Find your next pour.</span></h2>
          <p className={styles.updatedLabel}>{menu.updatedLabel ? `Updated ${menu.updatedLabel}` : "Live from Taplist"}</p>
        </div>
        <nav className={styles.sectionNav} aria-label="Menu categories">
          {menu.sections.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={entry.id === section?.id}
              aria-controls={menuId}
              onClick={() => { setActiveId(entry.id); setExpanded(false); }}
            >
              <span className={styles.desktopCategory}>{entry.title}</span>
              <span className={styles.mobileCategory}>{mobileCategoryLabel(entry.title)}</span>
            </button>
          ))}
        </nav>
      </div>
      <div id={menuId} className={styles.menuSection}>
        {section && (
          <>
            <div className={styles.sectionTitle}>
              <h3>{section.title}</h3>
              <small>{section.items.length} selections</small>
            </div>
            <ol id={`${menuId}-items`} className={styles.itemList} data-expanded={expanded}>
              {section.items.map((item, index) => {
                const displayName = separateFlavor(item.name);
                const houseProducer = /^kitsune(?: brewing(?: co\.?| company)?)?$/i.test(item.producer.trim());

                return (
                  <li key={item.id} className={`${styles.menuItem}${index >= 3 ? ` ${styles.additionalItem}` : ""}`}>
                    <span className={styles.itemNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemHeading}>
                        <div>
                          <h4><span className={styles.desktopName}>{item.name}</span><span className={styles.mobileName}>{displayName.name}</span></h4>
                          {item.producer && <p className={houseProducer ? styles.houseProducer : undefined}>{item.producer}</p>}
                        </div>
                        <div className={styles.itemPrices}>
                          {item.prices.map((price, priceIndex) => (
                            <div key={`${price.serving}-${price.price}`} className={priceIndex > 0 ? styles.additionalPrice : undefined}>
                              <span>{price.serving}</span><strong>{price.price}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                      {displayName.flavor && <p className={styles.itemFlavor}>{displayName.flavor}</p>}
                      {(item.style || item.metrics.length > 0) && (
                        <ul className={styles.itemMeta} aria-label={`${item.name} details`}>
                          {item.style && <li>{item.style}</li>}
                          {item.metrics.map((metric) => <li key={metric}>{metric}</li>)}
                        </ul>
                      )}
                      {item.prices.length > 0 && (
                        <ul className={styles.mobileServings} aria-label={`${item.name} serving options`}>
                          {item.prices.map((price, priceIndex) => (
                            <li key={`${price.serving}-${price.price}`}><span>{price.serving}</span>{priceIndex > 0 && <strong>{price.price}</strong>}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            {section.items.length > 3 && (
              <button className={styles.expandButton} type="button" aria-expanded={expanded} aria-controls={`${menuId}-items`} onClick={(event) => {
                const button = event.currentTarget;
                setExpanded(!expanded);
                if (expanded) requestAnimationFrame(() => button.scrollIntoView({ block: "nearest" }));
              }}>
                {expanded ? "Show fewer selections" : `View all ${section.items.length} selections`}<span aria-hidden="true">{expanded ? "↑" : "↓"}</span>
              </button>
            )}
          </>
        )}
      </div>
      <p className={styles.menuNote}>Availability changes with the pours. <a href={sourceUrl} target="_blank" rel="noreferrer">Full menu on Taplist ↗</a></p>
    </div>
  );
}
