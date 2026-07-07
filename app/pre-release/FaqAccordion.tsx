"use client";

import { useState } from "react";
import styles from "./prerelease.module.css";

const FAQS = [
  {
    q: "What do I need to bring?",
    a: "Just yourself! All materials including your Prerelease Kit and basic lands are provided. You may bring your own dice or sleeves if you prefer.",
  },
  {
    q: "Is there an age limit?",
    a: "Prerelease events are open to all ages. Players under 18 are welcome — Kitsune Brewing Co. is a family-friendly environment during our gaming events.",
  },
  {
    q: "How long do events last?",
    a: "Typically 3–4 hours. We run three rounds of Swiss-style pairings, so plan for around four hours from start to finish.",
  },
  {
    q: "Can I buy cards there?",
    a: "Yes! Our singles inventory and sealed product are available in-store before and after events. Check our card shop online to browse current stock.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={styles.faqRight}>
      {FAQS.map((item, i) => (
        <div key={i} className={styles.faqItem}>
          <button
            className={styles.faqQuestion}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
          >
            <span>{item.q.toUpperCase()}</span>
            <span className={styles.faqIcon}>{openIndex === i ? "−" : "+"}</span>
          </button>
          {openIndex === i && (
            <p className={styles.faqAnswer}>{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
