import Link from "next/link";
import styles from "./CTASection.module.css";

interface Props {
  headline: string;
  subtext?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  background?: "black" | "red";
}

export default function CTASection({
  headline,
  subtext,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  background = "black",
}: Props) {
  return (
    <section className={`${styles.cta} ${styles[background]}`}>
      <div className={`container ${styles.inner}`}>
        <h2 className={styles.headline}>{headline}</h2>
        {subtext && <p className={styles.subtext}>{subtext}</p>}
        <div className={styles.actions}>
          <Link href={primaryHref} className={`btn ${styles.primaryBtn}`}>
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link href={secondaryHref} className={`btn btn-outline ${styles.secondaryBtn}`}>
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
