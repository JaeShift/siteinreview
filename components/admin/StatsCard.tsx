import styles from "./StatsCard.module.css";

interface Props {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { direction: "up" | "down" | "neutral"; label: string };
  accent?: boolean;
  icon?: React.ReactNode;
}

export default function StatsCard({ label, value, subtext, trend, accent = false, icon }: Props) {
  return (
    <div className={`${styles.card} ${accent ? styles.accent : ""}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {subtext && <span className={styles.subtext}>{subtext}</span>}
        {trend && (
          <span className={`${styles.trend} ${styles[`trend_${trend.direction}`]}`}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.label}
          </span>
        )}
      </div>
    </div>
  );
}
