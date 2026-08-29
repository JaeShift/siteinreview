import styles from "./MenuEmbed.module.css";
import { getTaplistMenu, TAPLIST_URL } from "@/lib/taplist";

export default async function MenuEmbed() {
  let menu;

  try {
    menu = await getTaplistMenu();
  } catch (error) {
    console.error("Unable to refresh the Taplist menu:", error);

    return (
      <div className={styles.menuUnavailable}>
        <p className={styles.statusLabel}>Live menu temporarily unavailable</p>
        <h3>Our taps are still pouring.</h3>
        <p>Taplist could not be reached just now. Open the live menu directly for the latest lineup.</p>
        <a href={TAPLIST_URL} target="_blank" rel="noreferrer" className={styles.liveMenuLink}>
          View menu on Taplist
        </a>
      </div>
    );
  }

  return (
    <div className={styles.menuEmbedWrapper}>
      <div className={styles.menuToolbar}>
        <div>
          <p className={styles.statusLabel}>Synced from Taplist</p>
          <p className={styles.updatedLabel}>
            {menu.updatedLabel ? `Last updated ${menu.updatedLabel}` : "Live taproom menu"}
          </p>
        </div>
        <nav className={styles.sectionNav} aria-label="Menu categories">
          {menu.sections.map((section) => (
            <a key={section.id} href={`#menu-${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>
      </div>

      <div className={styles.menuSections}>
        {menu.sections.map((section, sectionIndex) => (
          <section
            key={section.id}
            id={`menu-${section.id}`}
            className={styles.menuSection}
            aria-labelledby={`menu-heading-${section.id}`}
          >
            <div className={styles.sectionTitle}>
              <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
              <h3 id={`menu-heading-${section.id}`}>{section.title}</h3>
              <small>{section.items.length} selections</small>
            </div>

            <ol className={styles.itemList}>
              {section.items.map((item, itemIndex) => (
                <li key={item.id} className={styles.menuItem}>
                  <span className={styles.itemNumber}>
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeading}>
                      <div>
                        <h4>{item.name}</h4>
                        {item.producer && <p>{item.producer}</p>}
                      </div>
                      <div className={styles.itemPrices}>
                        {item.prices.map((price) => (
                          <div key={`${price.serving}-${price.price}`}>
                            <span>{price.serving}</span>
                            <strong>{price.price}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                    {(item.style || item.metrics.length > 0) && (
                      <ul className={styles.itemMeta} aria-label={`${item.name} details`}>
                        {item.style && <li>{item.style}</li>}
                        {item.metrics.map((metric) => <li key={metric}>{metric}</li>)}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <p className={styles.menuNote}>
        Availability can change during service.{" "}
        <a href={TAPLIST_URL} target="_blank" rel="noreferrer">Open the source menu ↗</a>
      </p>
    </div>
  );
}
