"use client";

import { useEffect, useState } from "react";

const TZ = "America/Phoenix";

function getNow() {
  return new Date().toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(getNow());
    const id = setInterval(() => setTime(getNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div style={{ textAlign: "right" }}>
      <div style={{
        fontFamily: "var(--font-heading)",
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: "0.04em",
        color: "var(--color-black)",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}>
        {time}
      </div>
      <div style={{
        fontFamily: "var(--font-heading)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "var(--color-text-light)",
        marginTop: 4,
      }}>
        Phoenix, AZ · MST
      </div>
    </div>
  );
}
