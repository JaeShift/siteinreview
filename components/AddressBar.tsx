import SocialLinks from "./SocialLinks";
import styles from "./AddressBar.module.css";

export default function AddressBar() {
  return (
    <div className={styles.addressBar}>
      <p className={styles.addressText}>
        3321 E Bell Rd Suite B-5 Phoenix, AZ 85032
      </p>
      <a href="tel:+16022458593" className={styles.phoneLink}>
        (602) 245-8593
      </a>
      <SocialLinks iconWidth={28} iconHeight={32} className={styles.socialLinks} />
    </div>
  );
}
