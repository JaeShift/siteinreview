import styles from "./LoadingSkeleton.module.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = "100%", height = "16px", className = "" }: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.cardImage} />
      <div className={styles.cardBody}>
        <Skeleton height="12px" width="60px" />
        <Skeleton height="20px" width="85%" />
        <Skeleton height="14px" width="100%" />
        <Skeleton height="14px" width="70%" />
        <div className={styles.cardFooter}>
          <Skeleton height="16px" width="80px" />
          <Skeleton height="36px" width="120px" />
        </div>
      </div>
    </div>
  );
}

export function SingleCardSkeleton() {
  return (
    <div className={styles.singleSkeleton}>
      <div className={styles.singleImage} />
      <div className={styles.singleBody}>
        <Skeleton height="16px" width="90%" />
        <Skeleton height="12px" width="50%" />
        <div className={styles.singleFooter}>
          <Skeleton height="16px" width="60px" />
          <Skeleton height="32px" width="80px" />
        </div>
      </div>
    </div>
  );
}

interface GridSkeletonProps {
  count?: number;
  type?: "event" | "single";
}

export default function LoadingSkeleton({ count = 6, type = "event" }: GridSkeletonProps) {
  return (
    <div className={type === "event" ? styles.eventGrid : styles.singleGrid} aria-label="Loading…">
      {Array.from({ length: count }).map((_, i) =>
        type === "event" ? <EventCardSkeleton key={i} /> : <SingleCardSkeleton key={i} />
      )}
    </div>
  );
}
