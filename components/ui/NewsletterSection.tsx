"use client";

import { useState } from "react";
import styles from "./NewsletterSection.module.css";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Stub: simulate network request
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <h2 className={styles.heading}>Stay in the Loop</h2>
          <p className={styles.subtext}>
            Get notified about upcoming events, food trucks, new singles, and special
            events at Kitsune Brewing Co.
          </p>
        </div>

        {status === "success" ? (
          <div className={styles.success}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>You&apos;re subscribed! We&apos;ll be in touch.</span>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              className={`form-input ${styles.emailInput}`}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
              aria-label="Email address"
            />
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={status === "loading"}
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
