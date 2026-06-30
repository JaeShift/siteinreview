import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./holding.module.css";

export const metadata: Metadata = {
  title: "Magic Mamas Pre-Release",
  description:
    "Magic Mamas Pre-Release event at Kitsune Brewing Co. Check back soon for details.",
};

export default function MagicMamasPage() {
  return (
    <div className={styles.holdingPage}>
      <div className={styles.holdingContent}>
        <Image
          src="/images/logo.png"
          alt="Kitsune Brewing Co."
          width={120}
          height={120}
          className={styles.holdingLogo}
        />
        <h1 className={styles.holdingTitle}>We Will Be Back!</h1>
        <p className={styles.holdingText}>
          The Magic Mamas Pre-Release page is coming soon. Check back for
          upcoming event details.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
