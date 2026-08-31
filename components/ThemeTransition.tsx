"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  THEME_SPEED_FACTOR,
  type ThemeTransitionId,
  type ThemeTransitionSpeed,
} from "@/lib/site-appearance";
import styles from "./ThemeTransition.module.css";

type Origin = { x: string; y: string };

function wordmarkOrigin(): Origin {
  const mark = document.querySelector("[data-site-wordmark]");
  if (!mark) return { x: "50%", y: "40px" };
  const box = mark.getBoundingClientRect();
  return { x: `${box.left + box.width / 2}px`, y: `${box.top + box.height / 2}px` };
}

function timed(ms: number, speed: ThemeTransitionSpeed) {
  return Math.round(ms * THEME_SPEED_FACTOR[speed]);
}

export default function ThemeTransition({
  arcane,
  effect,
  speed,
}: {
  arcane: boolean;
  effect: ThemeTransitionId;
  speed: ThemeTransitionSpeed;
}) {
  const previous = useRef(arcane);
  const pointer = useRef<{ x: number; y: number; at: number } | null>(null);
  const [phase, setPhase] = useState("idle");
  const [toArcane, setToArcane] = useState(arcane);
  const [origin, setOrigin] = useState<Origin>({ x: "50%", y: "40px" });

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY, at: Date.now() };
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (previous.current === arcane) return;
    previous.current = arcane;

    const last = pointer.current;
    const fromClick = last && Date.now() - last.at < 900;
    setOrigin(fromClick ? { x: `${last.x}px`, y: `${last.y}px` } : wordmarkOrigin());
    setToArcane(arcane);

    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, timed(ms, speed)));
    };

    if (effect === "dusk") {
      setPhase("cover");
      later(() => setPhase("reveal"), 680);
      later(() => setPhase("idle"), 1080);
    } else if (effect === "iris") {
      setPhase("open");
      later(() => setPhase("idle"), 820);
    } else if (effect === "card-flip") {
      setPhase("turn");
      later(() => setPhase("clear"), 820);
      later(() => setPhase("idle"), 1180);
    } else if (effect === "ink-bloom") {
      setPhase("spread");
      later(() => setPhase("clear"), 780);
      later(() => setPhase("idle"), 1120);
    } else if (effect === "mana-seam") {
      setPhase("draw");
      later(() => setPhase("part"), 380);
      later(() => setPhase("clear"), 900);
      later(() => setPhase("idle"), 1180);
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [arcane, effect, speed]);

  if (phase === "idle") return null;

  const from = toArcane ? "cream" : "ink";
  const style = {
    "--ox": origin.x,
    "--oy": origin.y,
    "--s": String(THEME_SPEED_FACTOR[speed]),
  } as CSSProperties;

  return (
    <div
      className={styles.stage}
      data-effect={effect}
      data-from={from}
      data-to={toArcane ? "ink" : "cream"}
      data-state={phase}
      style={style}
      aria-hidden="true"
    >
      {effect === "dusk" && <div className={styles.duskWipe} />}
      {effect === "iris" && <div className={styles.iris} />}
      {effect === "card-flip" && (
        <div className={styles.card}>
          <div className={`${styles.face} ${styles.front}`} />
          <div className={`${styles.face} ${styles.back}`} />
          <div className={styles.foil} />
        </div>
      )}
      {effect === "ink-bloom" && (
        <>
          <svg className={styles.filter} width="0" height="0" aria-hidden="true">
            <filter id="kitsune-ink" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="38" />
            </filter>
          </svg>
          <span className={`${styles.blot} ${styles.blotMain}`} />
          <span className={`${styles.blot} ${styles.blotTwo}`} />
          <span className={`${styles.blot} ${styles.blotThree}`} />
        </>
      )}
      {effect === "mana-seam" && (
        <>
          <div className={`${styles.panel} ${styles.panelLeft}`} />
          <div className={`${styles.panel} ${styles.panelRight}`} />
          <div className={styles.seam} />
        </>
      )}
    </div>
  );
}
