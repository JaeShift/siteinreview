import { Resend } from "resend";
import type { ContactFormData } from "./validation";
import type { Registration } from "./store";
import type { MtgEvent } from "./events-data";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY environment variable is not set.");
  }
  return new Resend(key);
}

export async function sendContactEmail(data: ContactFormData) {
  const resend = getResend();
  const toEmail = process.env.CONTACT_EMAIL_TO ?? "Tyler@KitsuneBeerCo.com";
  const fromEmail =
    process.env.CONTACT_EMAIL_FROM ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: `Kitsune Website <${fromEmail}>`,
    to: [toEmail],
    reply_to: data.email,
    subject: `[Contact Form] ${data.subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #000; border-bottom: 2px solid #E8732A; padding-bottom: 12px;">
          New Contact Form Submission
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Name</td>
            <td style="padding: 8px 0;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject</td>
            <td style="padding: 8px 0;">${data.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 24px;">
          <p style="font-weight: bold; color: #555; margin-bottom: 8px;">Message</p>
          <div style="background: #f5f5f5; padding: 16px; border-left: 3px solid #E8732A; white-space: pre-wrap;">
${data.message}
          </div>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Sent from the Kitsune Brewing Co website contact form.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const BRAND_COLOR = "#E8732A";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitsune-brewing.com";

export async function sendEventConfirmationEmail(
  registration: Registration,
  event: MtgEvent
) {
  let resend: Resend;
  try {
    resend = getResend();
  } catch {
    console.warn("sendEventConfirmationEmail: RESEND_API_KEY not set, skipping.");
    return;
  }

  const fromEmail = process.env.CONTACT_EMAIL_FROM ?? "onboarding@resend.dev";
  const statusLabel =
    registration.status === "waitlisted" ? "Waitlisted" : "Confirmed";
  const subject =
    registration.status === "waitlisted"
      ? `Waitlist Confirmation — ${event.title}`
      : `Registration Confirmed — ${event.title}`;

  const { error } = await resend.emails.send({
    from: `Kitsune Brewing Co. <${fromEmail}>`,
    to: [registration.email],
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #0d0d0d; padding: 24px 32px; margin-bottom: 0;">
          <h1 style="color: #fff; font-size: 22px; margin: 0; letter-spacing: 0.05em;">KITSUNE BREWING CO.</h1>
          <p style="color: ${BRAND_COLOR}; margin: 4px 0 0; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">Event Registration</p>
        </div>

        <div style="background: #fff; padding: 32px; border: 1px solid #e5e5e5; border-top: none;">
          <h2 style="font-size: 20px; margin: 0 0 8px;">${statusLabel}: ${event.title}</h2>
          <p style="color: #666; margin: 0 0 24px;">Hi ${registration.firstName}, your ${registration.status === "waitlisted" ? "waitlist spot has been recorded" : "registration is confirmed"}.</p>

          <div style="background: #f9f9f9; border-left: 4px solid ${BRAND_COLOR}; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px;"><strong>Confirmation #:</strong> ${registration.id.toUpperCase()}</p>
            <p style="margin: 0 0 8px;"><strong>Event:</strong> ${event.title}</p>
            <p style="margin: 0 0 8px;"><strong>Date:</strong> ${formatDate(event.date)}</p>
            <p style="margin: 0 0 8px;"><strong>Time:</strong> ${event.time} – ${event.endTime}</p>
            <p style="margin: 0 0 8px;"><strong>Format:</strong> ${event.format}</p>
            <p style="margin: 0 0 8px;"><strong>Location:</strong> ${event.location}</p>
            <p style="margin: 0;"><strong>Entry:</strong> ${event.entryFee === 0 ? "FREE" : `$${event.entryFee}`}</p>
          </div>

          ${
            registration.status === "waitlisted"
              ? `<p style="color: #666; font-size: 14px;">You are on the waitlist. We will notify you if a spot opens up.</p>`
              : `<p style="color: #666; font-size: 14px;">Please bring this confirmation number to the event. See you there!</p>`
          }

          <div style="margin-top: 24px; text-align: center;">
            <a href="${SITE_URL}/events/${event.slug}" style="display: inline-block; background: ${BRAND_COLOR}; color: #fff; padding: 12px 28px; text-decoration: none; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; font-size: 13px;">View Event Details</a>
          </div>
        </div>

        <div style="padding: 16px 32px; background: #f5f5f5; font-size: 12px; color: #999; text-align: center;">
          <p style="margin: 0;">Kitsune Brewing Co. · 3321 E Bell Rd Suite B-5 · Phoenix, AZ 85032</p>
          <p style="margin: 4px 0 0;"><a href="mailto:Tyler@KitsuneBeerCo.com" style="color: #999;">Tyler@KitsuneBeerCo.com</a> · <a href="tel:+16022458593" style="color: #999;">(602) 245-8593</a></p>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("sendEventConfirmationEmail error:", error.message);
  }
}

export async function sendAdminRegistrationNotification(
  registration: Registration,
  event: MtgEvent
) {
  let resend: Resend;
  try {
    resend = getResend();
  } catch {
    console.warn("sendAdminRegistrationNotification: RESEND_API_KEY not set, skipping.");
    return;
  }

  const fromEmail = process.env.CONTACT_EMAIL_FROM ?? "onboarding@resend.dev";
  const toEmail = process.env.CONTACT_EMAIL_TO ?? "Tyler@KitsuneBeerCo.com";

  const { error } = await resend.emails.send({
    from: `Kitsune Website <${fromEmail}>`,
    to: [toEmail],
    subject: `New Registration — ${event.title} (${registration.status})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="border-bottom: 2px solid ${BRAND_COLOR}; padding-bottom: 12px;">New Event Registration</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 130px; color: #555;">Event</td><td>${event.title}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Date</td><td>${formatDate(event.date)} at ${event.time}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Status</td><td>${registration.status}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Name</td><td>${registration.firstName} ${registration.lastName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Email</td><td><a href="mailto:${registration.email}">${registration.email}</a></td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Phone</td><td>${registration.phone}</td></tr>
          ${registration.notes ? `<tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Notes</td><td>${registration.notes}</td></tr>` : ""}
          <tr><td style="padding: 6px 0; font-weight: bold; color: #555;">Confirmation #</td><td>${registration.id.toUpperCase()}</td></tr>
        </table>
        <div style="margin-top: 16px;">
          <a href="${SITE_URL}/admin/registrations" style="color: ${BRAND_COLOR};">View in Admin Roster →</a>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("sendAdminRegistrationNotification error:", error.message);
  }
}

export async function sendWaitlistConfirmationEmail(
  registration: Registration,
  event: MtgEvent
) {
  return sendEventConfirmationEmail(registration, event);
}

export async function sendEventReminderEmail(
  registration: Registration,
  event: MtgEvent
) {
  let resend: Resend;
  try {
    resend = getResend();
  } catch {
    console.warn("sendEventReminderEmail: RESEND_API_KEY not set, skipping.");
    return;
  }

  const fromEmail = process.env.CONTACT_EMAIL_FROM ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: `Kitsune Brewing Co. <${fromEmail}>`,
    to: [registration.email],
    subject: `Reminder: ${event.title} is coming up!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Don't forget — ${event.title}</h2>
        <p>Hi ${registration.firstName}, just a reminder that you're registered for <strong>${event.title}</strong> on <strong>${formatDate(event.date)} at ${event.time}</strong>.</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Confirmation #:</strong> ${registration.id.toUpperCase()}</p>
        <p>See you there!</p>
        <p>— Kitsune Brewing Co. Team</p>
      </div>
    `,
    // SMS: stub — wire Twilio/Resend SMS here when credentials are added
  });

  if (error) {
    console.error("sendEventReminderEmail error:", error.message);
  }
}
