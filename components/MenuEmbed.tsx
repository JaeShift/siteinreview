import styles from "./MenuEmbed.module.css";

export default function MenuEmbed() {
  return (
    <div className={styles.menuEmbedWrapper}>
      <iframe
        src="https://taplist.io/ew8u/"
        title="Kitsune Brewing Co. Menu"
        allowFullScreen
        loading="lazy"
        className={styles.menuIframe}
      />
    </div>
  );
}
