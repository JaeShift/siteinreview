import { ArrowRight } from "lucide-react";
import { getTaplistMenu, TAPLIST_URL } from "@/lib/taplist";
import VisitStatus from "./VisitStatus";
import styles from "./MobileTapPreview.module.css";

export default async function MobileTapPreview() {
  const menu = await getTaplistMenu().catch(() => null);
  const section = menu?.sections.find((entry) => /^on tap$/i.test(entry.title)) ?? menu?.sections[0];
  const lineup = section?.items ?? [];
  const favorites = ["ksunelite", "forager", "babayaga"];
  const featured = favorites.flatMap((name) => {
    const item = lineup.find((entry) => entry.name.toLowerCase().replace(/[^a-z0-9]/g, "") === name);
    return item ? [item] : [];
  });
  // Feature the house lager, IPA and stout only while they are on the live list.
  const items = [...featured, ...lineup.filter((item) => !featured.includes(item))].slice(0, 3);

  return (
    <section className={styles.preview} aria-labelledby="tap-preview-title">
      <header className={styles.header}>
        <div><h2 id="tap-preview-title">The taproom lineup</h2><p>{menu?.updatedLabel ? `Updated ${menu.updatedLabel.replace(/,?\s+\d{4}\b/, "")}` : "Live from Taplist"}</p></div>
        <a href="#tap-list" aria-label={section ? `See all ${section.items.length} beers on tap` : "See the full tap list"}>{section ? `All ${section.items.length}` : "Full list"}<ArrowRight size={15} aria-hidden="true" /></a>
      </header>
      {items.length > 0 ? <ul className={styles.beers}>
        {items.map((item) => {
          const price = item.prices.find((entry) => /16\s*oz/i.test(entry.serving)) ?? item.prices[0];
          const abv = item.metrics.find((metric) => /ABV|%/i.test(metric));
          return <li key={item.id}>
            <div><h3>{item.name}</h3><p>{[item.style, abv].filter(Boolean).join(" · ")}</p></div>
            {price && <div className={styles.price}><strong>{price.price}</strong><span>{price.serving}</span></div>}
          </li>;
        })}
      </ul> : <p className={styles.unavailable}>The lineup is temporarily unavailable. <a href={TAPLIST_URL} target="_blank" rel="noreferrer">Check the current taps ↗</a></p>}
      <VisitStatus />
    </section>
  );
}
