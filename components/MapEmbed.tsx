"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import styles from "./MapEmbed.module.css";

export default function MapEmbed({ preview = false }: { preview?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`${styles.mapWrapper} ${preview ? styles.mapPreview : ""}`}>
      {preview && !expanded && <div className={styles.mapIntro}>
        <MapPin size={48} strokeWidth={1.25} aria-hidden="true" />
        <p className={styles.mapLabel}>North Phoenix, Arizona</p>
        <h3>Find us on Bell Road.</h3>
        <p>3321 E Bell Rd · Suite B-5</p>
        <button type="button" onClick={() => setExpanded(true)}>Show interactive map <span aria-hidden="true">↗</span></button>
      </div>}
      {(!preview || expanded) && <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.686131234576!2d-112.01328312380821!3d33.63937933941697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872b71a745da3db1%3A0x6fc2e6b0265490f6!2sKitsune%20Brewing%20Company!5e0!3m2!1sen!2sus!4v1748886554927!5m2!1sen!2sus"
        title="Kitsune Brewing Co. Location"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className={styles.mapIframe}
      />}
      {preview && <a className={styles.mapExternal} href="https://www.google.com/maps/search/?api=1&query=Kitsune+Brewing+Company+Phoenix+AZ" target="_blank" rel="noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a>}
    </div>
  );
}
