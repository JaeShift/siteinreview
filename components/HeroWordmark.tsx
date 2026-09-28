import type { HTMLAttributes } from "react";
import Image from "next/image";
import styles from "./HeroWordmark.module.css";

/** Original extended-K lettering with the subtitle tucked beside its descender. */
export default function HeroWordmark({ className = "", tone = "ivory", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: "ivory" | "ink" }) {
  return (
    <span {...props} className={`${styles.lockup} ${tone === "ink" ? styles.ink : ""} ${className}`}>
      <picture>
      <source media="(max-width: 760px)" srcSet="/images/home/mobile-kitsune-brush-v1.webp" />
      <Image
        src="/images/home/kitsune-hero-lettering-flat.svg"
        alt="Kitsune"
        width={537}
        height={229}
        className={styles.lettering}
        priority
        unoptimized
      />
      </picture>
      <span className={styles.subtitle}>Brewing Company</span>
    </span>
  );
}
