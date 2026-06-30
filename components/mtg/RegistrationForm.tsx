"use client";

import { useState } from "react";
import type { MtgEvent } from "@/lib/events-data";
import { formatEventDate } from "@/lib/events-data";
import { submitRegistration } from "@/lib/integrations/occasion";
import styles from "./RegistrationForm.module.css";

interface Props {
  event: MtgEvent;
  onSuccess?: (confirmationNumber: string) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.firstName.trim()) errors.firstName = "First name is required.";
  if (!data.lastName.trim()) errors.lastName = "Last name is required.";
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?[\d\s\-().]{7,}$/.test(data.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }
  return errors;
}

export default function RegistrationForm({ event, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStatus("loading");
    try {
      const result = await submitRegistration({ eventSlug: event.slug, ...form });
      if (result.success && result.confirmationNumber) {
        setConfirmationNumber(result.confirmationNumber);
        setStatus("success");
        onSuccess?.(result.confirmationNumber);
      }
    } catch {
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon} aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
            <path d="M14 24l7 7 13-13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className={styles.successTitle}>You&apos;re Registered!</h3>
        <p className={styles.successText}>
          Your spot at <strong>{event.title}</strong> is confirmed.
        </p>
        <div className={styles.confirmationBox}>
          <span className={styles.confirmationLabel}>Confirmation Number</span>
          <span className={styles.confirmationNumber}>{confirmationNumber}</span>
        </div>
        <div className={styles.successDetails}>
          <p><strong>Date:</strong> {formatEventDate(event.date)}</p>
          <p><strong>Time:</strong> {event.time} – {event.endTime}</p>
          <p><strong>Location:</strong> 3321 E Bell Rd Suite B-5, Phoenix, AZ 85032</p>
        </div>
        <p className={styles.successNote}>
          A confirmation will be sent to <strong>{form.email}</strong>. Please bring this
          confirmation number to the event.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.eventSummary}>
        <span className={styles.summaryLabel}>Registering for</span>
        <span className={styles.summaryTitle}>{event.title}</span>
        <span className={styles.summaryDate}>{formatEventDate(event.date)} · {event.time}</span>
        <span className={styles.summaryFee}>Entry: {event.entryFee === 0 ? "FREE" : `$${event.entryFee}`}</span>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className="form-label" htmlFor="reg-first-name">First Name *</label>
          <input
            id="reg-first-name"
            className={`form-input ${errors.firstName ? styles.inputError : ""}`}
            type="text"
            value={form.firstName}
            onChange={set("firstName")}
            autoComplete="given-name"
            placeholder="Jane"
          />
          {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
        </div>
        <div className={styles.field}>
          <label className="form-label" htmlFor="reg-last-name">Last Name *</label>
          <input
            id="reg-last-name"
            className={`form-input ${errors.lastName ? styles.inputError : ""}`}
            type="text"
            value={form.lastName}
            onChange={set("lastName")}
            autoComplete="family-name"
            placeholder="Smith"
          />
          {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label className="form-label" htmlFor="reg-email">Email Address *</label>
        <input
          id="reg-email"
          className={`form-input ${errors.email ? styles.inputError : ""}`}
          type="email"
          value={form.email}
          onChange={set("email")}
          autoComplete="email"
          placeholder="jane@example.com"
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label className="form-label" htmlFor="reg-phone">Phone Number *</label>
        <input
          id="reg-phone"
          className={`form-input ${errors.phone ? styles.inputError : ""}`}
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          autoComplete="tel"
          placeholder="(602) 555-1234"
        />
        {errors.phone && <span className={styles.error}>{errors.phone}</span>}
      </div>

      <div className={styles.field}>
        <label className="form-label" htmlFor="reg-notes">Notes (optional)</label>
        <textarea
          id="reg-notes"
          className={`form-input ${styles.textarea}`}
          value={form.notes}
          onChange={set("notes")}
          placeholder="Deck name, power level preference, accessibility needs…"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${styles.submitBtn}`}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Registering…" : "Complete Registration"}
      </button>

      <p className={styles.privacyNote}>
        Your information will only be used for event coordination. We will never share or sell your data.
      </p>
    </form>
  );
}
