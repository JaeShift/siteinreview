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

  const isWaitlisted = registration.status === "waitlisted";
  const eventUrl = event.format === "Prerelease"
    ? `${SITE_URL}/pre-release`
    : `${SITE_URL}/events/${event.slug}`;

  const { error } = await resend.emails.send({
    from: `Kitsune Brewing Co. <${fromEmail}>`,
    to: [registration.email],
    subject,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f2f2f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f0;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Header -->
      <tr><td style="background:#0d0d0d;padding:32px 40px 28px;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND_COLOR};">Kitsune Brewing Co.</p>
        <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.02em;line-height:1.2;">
          ${isWaitlisted ? "You're on the waitlist." : "You're registered."}
        </h1>
        <p style="margin:10px 0 0;font-size:15px;color:rgba(255,255,255,0.55);line-height:1.5;">
          Hi ${registration.firstName} — ${isWaitlisted ? "your waitlist spot has been recorded for" : "your spot is confirmed for"} <strong style="color:rgba(255,255,255,0.85);">${event.title}</strong>.
        </p>
      </td></tr>

      <!-- Orange rule -->
      <tr><td style="background:${BRAND_COLOR};height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Body -->
      <tr><td style="background:#ffffff;padding:36px 40px 32px;">

        <!-- Event detail rows -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;width:130px;vertical-align:top;">Event</td>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:15px;color:#111;font-weight:600;">${event.title}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;vertical-align:top;">Date</td>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:15px;color:#111;">${formatDate(event.date)}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;vertical-align:top;">Time</td>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:15px;color:#111;">${event.time}${event.endTime ? ` – ${event.endTime}` : ""}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;vertical-align:top;">Location</td>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:15px;color:#111;line-height:1.5;">${event.location}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;vertical-align:top;">Entry</td>
            <td style="padding:11px 0;border-bottom:1px solid #efefef;font-size:15px;color:#111;">${event.entryFee === 0 ? "Free" : `$${event.entryFee}`}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#aaa;vertical-align:top;">Status</td>
            <td style="padding:11px 0;font-size:15px;color:${isWaitlisted ? "#b45309" : "#15803d"};font-weight:600;">${isWaitlisted ? "Waitlisted" : "Confirmed"}</td>
          </tr>
        </table>

        <!-- Note -->
        <p style="margin:28px 0 0;font-size:14px;color:#777;line-height:1.6;">
          ${isWaitlisted
            ? "You're on the waitlist. We'll reach out directly if a spot opens up."
            : "We look forward to seeing you. No need to bring anything — just show up ready to play."}
        </p>

        <!-- CTA -->
        <div style="margin-top:28px;">
          <a href="${eventUrl}" style="display:inline-block;background:#0d0d0d;color:#ffffff;padding:13px 28px;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">View Event Details</a>
        </div>

      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#0d0d0d;padding:24px 40px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.35);">Kitsune Brewing Co. &nbsp;·&nbsp; 3321 E Bell Rd Suite B-5 &nbsp;·&nbsp; Phoenix, AZ 85032</p>
        <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">
          <a href="mailto:Tyler@KitsuneBeerCo.com" style="color:rgba(255,255,255,0.35);text-decoration:none;">Tyler@KitsuneBeerCo.com</a>
          &nbsp;·&nbsp;
          <a href="tel:+16022458593" style="color:rgba(255,255,255,0.35);text-decoration:none;">(602) 245-8593</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>
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
