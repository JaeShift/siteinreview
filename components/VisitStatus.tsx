"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { DIRECTIONS_URL, getTaproomStatus } from "@/lib/taproom-hours";
import styles from "./VisitStatus.module.css";

export default function VisitStatus() {
  const [status, setStatus] = useState<ReturnType<typeof getTaproomStatus> | null>(null);
  useEffect(() => {
    const refresh = () => setStatus(getTaproomStatus(new Date()));
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <a className={styles.visitStatus} href={DIRECTIONS_URL}
      title={status?.hours} aria-label={`${status?.label ?? "Taproom hours"}. Get directions to 3321 E Bell Road, Suite B-5, Phoenix.`}>
      <Clock3 size={21} aria-hidden="true" />
      <span className={styles.details}>
        <strong>{status?.label ?? "Today’s taproom hours"}</strong>
        <span className={styles.address}>3321 E Bell Rd</span>
      </span>
      <span className={styles.directions}>Directions<ArrowUpRight size={15} aria-hidden="true" /></span>
    </a>
  );
}
