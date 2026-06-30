import Image from "next/image";
import styles from "./Hero.module.css";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  showScrollIndicator?: boolean;
};

export default function Hero({
  src,
  alt,
  priority = true,
  showScrollIndicator = false,
}: Props) {
  return (
    <section className={styles.hero}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        style={{ objectFit: "cover", objectPosition: "center top" }}
        sizes="100vw"
      />
      {showScrollIndicator && (
        <div className={styles.scrollIndicator} aria-hidden="true">
          <span className={styles.scrollText}>Scroll</span>
          <span className={styles.scrollArrow}>↓</span>
        </div>
      )}
    </section>
  );
}
