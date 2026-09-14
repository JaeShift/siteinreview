import TaproomMenu from "./TaproomMenu";
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

  return <TaproomMenu menu={menu} sourceUrl={TAPLIST_URL} />;
}
