import { Resend } from "resend";
import type { ContactFormData } from "./validation";

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
