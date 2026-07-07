"use client";

import { useState } from "react";
import type { MtgEvent } from "@/lib/events-data";
import { formatEventDate } from "@/lib/events-data";
import styles from "./RegistrationForm.module.css";

interface Props {
  event: MtgEvent;
  onSuccess?: (confirmationNumber: string) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  confirmEmail?: string;
  phone?: string;
}

type CustomAnswers = Record<string, string>;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.firstName.trim()) errors.firstName = "First name is required.";
  if (!data.lastName.trim()) errors.lastName = "Last name is required.";
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.confirmEmail.trim()) {
    errors.confirmEmail = "Please confirm your email address.";
  } else if (data.confirmEmail !== data.email) {
    errors.confirmEmail = "Email addresses do not match.";
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
    confirmEmail: "",
    phone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [duplicateError, setDuplicateError] = useState("");
  const [customAnswers, setCustomAnswers] = useState<CustomAnswers>({});
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }
    setForm((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
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
      // Paid events → redirect to Stripe Checkout
      if (event.entryFee > 0) {
        const res = await fetch("/api/checkout/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventSlug: event.slug, ...form }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error(data.error ?? "Checkout failed");
      }

      // Free events → POST to /api/register
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          ...form,
          customAnswers: Object.keys(customAnswers).length ? customAnswers : undefined,
          selectedAddOns: selectedAddOns.length ? selectedAddOns : undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setDuplicateError(data.message ?? "You are already registered for this event.");
        setStatus("idle");
        return;
      }
      if (res.ok && data.confirmationNumber) {
        setConfirmationNumber(data.confirmationNumber);
        setStatus("success");
        onSuccess?.(data.confirmationNumber);
      } else {
        throw new Error(data.error ?? "Registration failed");
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
      {duplicateError && (
        <div className={styles.duplicateBanner} role="alert">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6v4M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>{duplicateError}</span>
        </div>
      )}
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
            placeholder="John"
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
          placeholder="kitsune@example.com"
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label className="form-label" htmlFor="reg-confirm-email">Confirm Email Address *</label>
        <input
          id="reg-confirm-email"
          className={`form-input ${errors.confirmEmail ? styles.inputError : ""}`}
          type="email"
          value={form.confirmEmail}
          onChange={set("confirmEmail")}
          autoComplete="off"
          placeholder="kitsune@example.com"
        />
        {errors.confirmEmail && <span className={styles.error}>{errors.confirmEmail}</span>}
      </div>

      <div className={styles.field}>
        <label className="form-label" htmlFor="reg-phone">Phone Number *</label>
        <input
          id="reg-phone"
          className={`form-input ${errors.phone ? styles.inputError : ""}`}
          type="tel"
          value={form.phone}
          onChange={handlePhoneChange}
          autoComplete="tel"
          placeholder="(602) 555-1234"
        />
        {errors.phone && <span className={styles.error}>{errors.phone}</span>}
      </div>

      {/* Custom Questions */}
      {event.customQuestions && event.customQuestions.length > 0 && (
        <>
          {event.customQuestions.map((q) => (
            <div key={q.id} className={styles.field}>
              <label className="form-label" htmlFor={`custom-${q.id}`}>
                {q.label}{q.required ? " *" : ""}
              </label>
              <input
                id={`custom-${q.id}`}
                className="form-input"
                value={customAnswers[q.id] ?? ""}
                onChange={(e) =>
                  setCustomAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                required={q.required}
              />
            </div>
          ))}
        </>
      )}

      {/* Add-Ons */}
      {event.addOns && event.addOns.length > 0 && (
        <div className={styles.field}>
          <label className="form-label">Add-Ons (optional)</label>
          {event.addOns.map((addon) => (
            <label key={addon.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={selectedAddOns.includes(addon.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedAddOns((prev) => [...prev, addon.id]);
                  } else {
                    setSelectedAddOns((prev) => prev.filter((id) => id !== addon.id));
                  }
                }}
              />
              {addon.label} — ${addon.price.toFixed(2)}
            </label>
          ))}
        </div>
      )}

      <button
        type="submit"
        className={`btn btn-primary ${styles.submitBtn}`}
        disabled={status === "loading"}
      >
        {status === "loading"
          ? (event.entryFee > 0 ? "Redirecting to payment…" : "Registering…")
          : (event.entryFee > 0 ? `Register & Pay $${event.entryFee}` : "Complete Registration")}
      </button>

      <p className={styles.privacyNote}>
        Your information will only be used for event coordination. We will never share or sell your data.
      </p>
    </form>
  );
}
