import Image from "next/image";
import Link from "next/link";
import styles from "./EventCard.module.css";

type Props = {
  title: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  description?: string;
};

export default function EventCard({
  title,
  price,
  imageUrl,
  imageAlt,
  href,
  description,
}: Props) {
  return (
    <Link href={href} className={styles.eventCard}>
      <div className={styles.eventCardImageWrap}>
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
      </div>
      <div className={styles.eventCardBody}>
        <h3 className={styles.eventCardTitle}>{title}</h3>
        {description && <p className={styles.eventCardDesc}>{description}</p>}
        <p className={styles.eventCardPrice}>{price}</p>
        <span className={`btn btn-primary ${styles.eventCardCta}`}>View Details</span>
      </div>
    </Link>
  );
}
