import Image from "next/image";
import type { FoodTruck, FoodTruckScheduleEntry } from "@/lib/food-trucks-data";
import { formatScheduleDate } from "@/lib/food-trucks-data";
import styles from "./FoodTruckCard.module.css";

interface Props {
  truck: FoodTruck;
  entry?: FoodTruckScheduleEntry;
  variant?: "featured" | "card" | "list";
}

export default function FoodTruckCard({ truck, entry, variant = "card" }: Props) {
  if (variant === "featured") {
    return (
      <div className={styles.featured}>
        <div className={styles.featuredImage}>
          <Image
            src={truck.imageUrl}
            alt={truck.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className={styles.featuredBody}>
          <span className={styles.todayLabel}>Today&apos;s Truck</span>
          <h2 className={styles.featuredName}>{truck.name}</h2>
          <p className={styles.cuisine}>{truck.cuisine}</p>
          {entry && (
            <p className={styles.hours}>
              {entry.startTime} – {entry.endTime}
            </p>
          )}
          <p className={styles.desc}>{truck.description}</p>
          <div className={styles.featuredActions}>
            {truck.menuUrl && (
              <a
                href={truck.menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Menu
              </a>
            )}
            {truck.instagram && (
              <a
                href={truck.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className={styles.listItem}>
        <div className={styles.listImageWrap}>
          <Image
            src={truck.imageUrl}
            alt={truck.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="80px"
          />
        </div>
        <div className={styles.listBody}>
          <span className={styles.listName}>{truck.name}</span>
          <span className={styles.listCuisine}>{truck.cuisine}</span>
          {entry && (
            <span className={styles.listHours}>{entry.startTime} – {entry.endTime}</span>
          )}
        </div>
        {truck.instagram && (
          <a
            href={truck.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.listLink}
            aria-label={`${truck.name} on Instagram`}
          >
            ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardImageWrap}>
        <Image
          src={truck.imageUrl}
          alt={truck.name}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 100vw, 300px"
        />
        <span className={styles.cuisineBadge}>{truck.cuisine}</span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{truck.name}</h3>
        {entry && (
          <p className={styles.cardDate}>
            {formatScheduleDate(entry.date)} · {entry.startTime} – {entry.endTime}
          </p>
        )}
        <p className={styles.cardDesc}>{truck.description}</p>
        {truck.menuUrl && (
          <a
            href={truck.menuUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-outline ${styles.cardBtn}`}
          >
            View Menu
          </a>
        )}
      </div>
    </article>
  );
}
