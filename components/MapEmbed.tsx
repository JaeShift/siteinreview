import styles from "./MapEmbed.module.css";

export default function MapEmbed() {
  return (
    <div className={styles.mapWrapper}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.686131234576!2d-112.01328312380821!3d33.63937933941697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b71a745da3db1%3A0x6fc2e6b0265490f6!2sKitsune%20Brewing%20Company!5e0!3m2!1sen!2sus!4v1748886554927!5m2!1sen!2sus"
        title="Kitsune Brewing Co. Location"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className={styles.mapIframe}
      />
    </div>
  );
}
