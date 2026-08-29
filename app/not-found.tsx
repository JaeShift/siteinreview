import Link from "next/link";
import styles from "./public-state.module.css";

export default function NotFound() {
  return (
    <section className={styles.state} aria-labelledby="not-found-title">
      <div className={styles.panel}>
        <p className={styles.eyebrow}>404 / Lost in the den</p>
        <h1 id="not-found-title" className={styles.title}>
          This trail went cold.
        </h1>
        <p className={styles.copy}>
          The page you were looking for has moved, sold out, or never made it
          onto the menu.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Return home
          </Link>
          <Link href="/events" className={styles.button}>
            Explore events
          </Link>
        </div>
      </div>
    </section>
  );
}
