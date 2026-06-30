import Image from "next/image";
import styles from "./EventBanner.module.css";

interface Props {
  imageUrl: string;
  title: string;
  subtitle?: string;
  height?: "sm" | "md" | "lg";
}

export default function EventBanner({ imageUrl, title, subtitle, height = "md" }: Props) {
  return (
    <div className={`${styles.banner} ${styles[height]}`}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        style={{ objectFit: "cover" }}
        sizes="100vw"
        priority
      />
      <div className={styles.overlay} />
      <div className={`container ${styles.content}`}>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <h1 className={styles.title}>{title}</h1>
      </div>
    </div>
  );
}
