import styles from "./MtgFooter.module.css";

export default function MtgFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.name}>Kitsune Brewing Co.</p>
      <div className={styles.links}>
        <a href="tel:+16022458593" className={styles.link}>(602) 245-8593</a>
        <a href="http://instagram.com/kitsunebrewingco" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
        <a href="https://www.facebook.com/KitsuneBrewCo" target="_blank" rel="noopener noreferrer" className={styles.link}>Facebook</a>
      </div>
      <p className={styles.copy}>
        &copy; {new Date().getFullYear()} Kitsune Brewing Company. 3321 E Bell Rd Suite B-5 Phoenix, AZ 85032
      </p>
    </footer>
  );
}
