"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./public-state.module.css";

export default function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={styles.state} aria-labelledby="error-title">
      <div className={styles.panel}>
        <p className={styles.eyebrow}>Something spilled</p>
        <h1 id="error-title" className={styles.title}>
          Let&apos;s try that again.
        </h1>
        <p className={styles.copy}>
          We hit an unexpected problem. Retry the page, or head back to a known
          trail.
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.button} onClick={reset}>
            Try again
          </button>
          <Link href="/" className={styles.button}>
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
