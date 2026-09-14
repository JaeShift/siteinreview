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
    <a className={styles.visitStatus} href={status?.unconfirmed ? "tel:+16022458593" : DIRECTIONS_URL}
      title={status?.hours} aria-label={`${status?.label ?? "Taproom hours and directions"}. 3321 E Bell Road, Suite B-5. ${status?.unconfirmed ? "Call the taproom" : "Get directions"}`}>
      <Clock3 size={21} aria-hidden="true" />
      <span><strong>{status?.label ?? "Taproom hours & directions"}</strong><span>3321 E Bell Rd, Suite B-5</span></span>
      <ArrowUpRight size={18} aria-hidden="true" />
    </a>
  );
}
