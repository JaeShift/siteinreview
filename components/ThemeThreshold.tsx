import styles from "./ThemeThreshold.module.css";
import { THEME_SPEED_FACTOR, type ThemeTransitionSpeed } from "@/lib/site-appearance";
import type { CSSProperties } from "react";

export default function ThemeThreshold({
  variant,
  speed = "medium",
}: {
  variant: "dusk" | "dawn";
  speed?: ThemeTransitionSpeed;
}) {
  return (
    <div
      className={`${styles.band} ${styles[variant]}`}
      style={{ "--s": String(THEME_SPEED_FACTOR[speed]) } as CSSProperties}
      aria-hidden="true"
    />
  );
}
