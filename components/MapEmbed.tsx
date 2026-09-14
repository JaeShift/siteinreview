import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { DIRECTIONS_URL } from "@/lib/taproom-hours";
import styles from "./MapEmbed.module.css";

export default function MapEmbed({ preview = false }: { preview?: boolean }) {
  if (preview) return (
    <div className={`${styles.mapWrapper} ${styles.mapPreview}`}>
      <a className={styles.staticMapLink} href={DIRECTIONS_URL} aria-label="Get directions to Kitsune Brewing Company, 3321 East Bell Road, Suite B-5">
        <Image src="/images/home/taproom-map.svg" alt="Street map showing Kitsune Brewing Company on East Bell Road in North Phoenix" fill sizes="(max-width: 900px) 100vw, 50vw" className={styles.staticMapImage} />
      </a>
      <a className={styles.mapExternal} href={DIRECTIONS_URL}>Get directions to Kitsune <ArrowUpRight size={18} aria-hidden="true" /></a>
      <a className={styles.mapAttribution} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Map © OpenStreetMap contributors</a>
    </div>
  );
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
