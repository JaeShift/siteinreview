import styles from "./PromoTixEmbed.module.css";

export default function PromoTixEmbed() {
  return (
    <div className={styles.promotixWrapper}>
      <iframe
        src="https://www.promotix.com/events/kitsune-casino-night/embed"
        title="Kitsune Casino Night Tickets"
        loading="lazy"
        className={styles.promotixIframe}
        allowFullScreen
      />
    </div>
  );
}
