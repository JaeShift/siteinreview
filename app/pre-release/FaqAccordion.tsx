"use client";

import { useState } from "react";
import styles from "./prerelease.module.css";

const FAQS = [
  {
    q: "Do I need to bring a deck?",
    a: "No. You'll build your deck at the event using the cards from your Prerelease Kit.",
  },
  {
    q: "What comes in a Prerelease Kit?",
    a: "Your Prerelease Kit includes the sealed product you'll use to build your deck for the event. Contents vary by set.",
  },
  {
    q: "Where is the event located?",
    a: "Kitsune Brewing Co. is located at 3321 E Bell Rd Suite B-5, Phoenix, AZ 85032.",
  },
  {
    q: "How long does a Prerelease event last?",
    a: "Plan for a few hours, including deck building and gameplay. Exact event length may vary based on attendance and number of rounds.",
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
