import type { HTMLAttributes } from "react";
import Image from "next/image";
import styles from "./HeroWordmark.module.css";

/** Original extended-K lettering with the subtitle tucked beside its descender. */
export default function HeroWordmark({ className = "", tone = "ivory", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "ivory" | "ink" }) {
  return (
    <span {...props} className={`${styles.lockup} ${tone === "ink" ? styles.ink : ""} ${className}`}>
      <Image
        src="/images/home/kitsune-hero-lettering-flat.svg"
        alt="Kitsune"
        width={537}
        height={229}
        className={styles.lettering}
        priority
        unoptimized
      />
      <span className={styles.subtitle}>Brewing Company</span>
    </span>
  );
}
