import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./PageHero.module.css";

type Props = {
  title: ReactNode;
  kicker?: string;
  description?: ReactNode;
  image?: string;
  imageAlt?: string;
  variant?: "standard" | "split" | "image";
  children?: ReactNode;
  className?: string;
};

export default function PageHero({
  title,
  kicker,
  description,
  image,
  imageAlt = "",
  variant = image ? "split" : "standard",
  children,
  className = "",
}: Props) {
  const variantClass = styles[variant];

  return (
    <section className={`${styles.hero} ${variantClass}${className ? ` ${className}` : ""}`}>
      <div className={styles.printFrame} aria-hidden="true" />
      {variant === "standard" ? <div className={styles.brandMark} aria-hidden="true"><Image src="/images/logo.png" alt="" width={160} height={160} /><span>Independent spirit · North Phoenix</span></div> : null}
      {variant === "image" && image ? (
        <Image src={image} alt={imageAlt} fill priority sizes="100vw" className={styles.backdrop} />
      ) : null}
      <div className={styles.copy}>
        {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
        <h1>{title}</h1>
        {description ? <div className={styles.description}>{description}</div> : null}
        {children ? <div className={styles.actions}>{children}</div> : null}
      </div>
      {variant === "split" && image ? (
        <div className={styles.visual}>
          <Image src={image} alt={imageAlt} fill priority sizes="(max-width: 760px) 100vw, 42vw" />
        </div>
      ) : null}
    </section>
  );
}
