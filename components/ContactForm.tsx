"use client";

import { useState } from "react";
import type { ContactFormData } from "@/lib/validation";

type FieldErrors = Partial<Record<keyof ContactFormData, string[]>>;

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) {
          setFieldErrors(data.fields);
          setStatus("error");
          setErrorMessage("Please fix the errors below.");
        } else {
          setStatus("error");
          setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h3>Message Sent!</h3>
        <p>
          Thanks for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          className="btn btn-outline"
          onClick={() => setStatus("idle")}
          style={{ marginTop: "20px" }}
        >
          Send Another
        </button>

        <style jsx>{`
          .success-message {
            text-align: center;
            padding: 48px 24px;
            background-color: var(--color-bg);
            border: 2px solid var(--color-visited);
          }
          .success-icon {
            width: 56px;
            height: 56px;
            background-color: var(--color-visited);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            margin: 0 auto 20px;
          }
          h3 {
            font-family: var(--font-heading);
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.01em;
            line-height: 1em;
            margin-bottom: 12px;
          }
          p {
            font-family: var(--font-body);
            font-size: 16px;
            font-weight: 400;
            letter-spacing: 0.01em;
            line-height: 1.8em;
            color: var(--color-text-light);
          }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="contact-form">
      {status === "error" && errorMessage && !Object.keys(fieldErrors).length && (
        <div className="form-error-banner">{errorMessage}</div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name <span className="required">*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={handleChange}
            className={`form-input ${fieldErrors.firstName ? "has-error" : ""}`}
            disabled={status === "loading"}
          />
          {fieldErrors.firstName && (
            <span className="field-error">{fieldErrors.firstName[0]}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name <span className="required">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={handleChange}
            className={`form-input ${fieldErrors.lastName ? "has-error" : ""}`}
            disabled={status === "loading"}
          />
          {fieldErrors.lastName && (
            <span className="field-error">{fieldErrors.lastName[0]}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email <span className="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          className={`form-input ${fieldErrors.email ? "has-error" : ""}`}
          disabled={status === "loading"}
        />
        {fieldErrors.email && (
          <span className="field-error">{fieldErrors.email[0]}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="subject" className="form-label">
          Subject <span className="required">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          className={`form-input ${fieldErrors.subject ? "has-error" : ""}`}
          disabled={status === "loading"}
        />
        {fieldErrors.subject && (
          <span className="field-error">{fieldErrors.subject[0]}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="message" className="form-label">
          Message <span className="required">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          className={`form-input ${fieldErrors.message ? "has-error" : ""}`}
          disabled={status === "loading"}
        />
        {fieldErrors.message && (
          <span className="field-error">{fieldErrors.message[0]}</span>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary submit-btn"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending…" : "Submit"}
      </button>

      <style jsx>{`
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .required {
          color: var(--color-accent);
        }

        .has-error {
          border-color: #c0392b !important;
        }

        /* field-error — small futura-pt label style */
        .field-error {
          font-family: var(--font-heading);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #c0392b;
        }

        .form-error-banner {
          background-color: #fdf2f2;
          border: 1px solid #e74c3c;
          color: #c0392b;
          padding: 12px 16px;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.01em;
          line-height: 1.6em;
        }

        .submit-btn {
          align-self: flex-start;
          min-width: 140px;
          border-radius: 8px;
        }

        textarea.form-input {
          resize: vertical;
          min-height: 120px;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </form>
  );
}
