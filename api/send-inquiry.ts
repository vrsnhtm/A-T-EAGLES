import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import {
  collectFieldErrors,
  formatTargetDate,
  inquirySchema,
  type InquiryPayload,
} from "../src/lib/validation.js";

/**
 * POST /api/send-inquiry
 * Sends (1) an internal notification to the firm inbox and (2) a branded
 * auto-reply to the prospect. Requires RESEND_API_KEY.
 */

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Simple in-memory rate limiter. Serverless instances are ephemeral and can be
 * scaled horizontally, so this is a best-effort guard against casual abuse,
 * not a distributed rate limiter.
 */
const requestLog = new Map<string, number[]>();

const DEFAULT_NOTIFY_TO = "onlineateagles@gmail.com";
const DEFAULT_FROM = "onboarding@resend.dev";

/**
 * Resend shows whatever display name sits in the `from` string, so a stale name
 * carried by the configured address (or the Resend account name) would surface
 * in the recipient's inbox. Always present the firm as the sender and keep only
 * the configured address.
 */
function withFirmSenderName(from: string): string {
  const match = from.match(/<([^>]+)>/);
  const address = (match ? match[1] : from).trim();
  return `"${FIRM_NAME}" <${address}>`;
}

const FIRM_NAME = "A & T Eagles";
const FIRM_PHONE = "+63 928 350 6526";
const FIRM_ADDRESS =
  "264 Gov. Pascual Ave, Catmon, Malabon, Metro Manila";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Escape untrusted values before interpolating them into HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escape and keep line breaks inside table cells. */
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const rawForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof rawForwarded === "string" && rawForwarded.trim() !== "") {
    const first = rawForwarded.split(",")[0];
    if (first && first.trim() !== "") return first.trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim() !== "") return realIp.trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );
  recent.push(now);
  requestLog.set(ip, recent);

  // Opportunistically drop stale IPs so the map cannot grow forever.
  if (requestLog.size > 500) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
  }

  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function parseBody(body: unknown): Record<string, unknown> | null {
  if (typeof body === "string") {
    try {
      const parsed: unknown = JSON.parse(body);
      return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  if (body !== null && typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  return null;
}

function manilaTimestamp(): string {
  return `${new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date())} (Asia/Manila)`;
}

function firstNameOf(fullName: string): string {
  const [first] = fullName.trim().split(/\s+/);
  return first && first.length > 0 ? first : "there";
}

/**
 * Optional SMTP sender for the client confirmation.
 *
 * Resend's shared test sender (onboarding@resend.dev) only delivers to the
 * Resend account owner, so a real client address is rejected until the firm
 * verifies a domain. Gmail SMTP credentials let the confirmation reach any
 * recipient from the firm's own mailbox in the meantime. When SMTP_USER and
 * SMTP_PASS are absent, the Resend path is used unchanged.
 */
let smtpTransport: Transporter | null = null;

function getSmtpSender(): { transport: Transporter; user: string } | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return null;

  const port = process.env.SMTP_PORT?.trim() || "465";

  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
      port: Number(port),
      secure: port === "465",
      auth: { user, pass },
    });
  }

  return { transport: smtpTransport, user };
}

/* ------------------------------------------------------------------ */
/* Internal notification email                                         */
/* ------------------------------------------------------------------ */

function buildInternalEmail(payload: InquiryPayload, submittedAt: string): string {
  const rows: Array<[string, string, boolean]> = [
    ["Full Name / Authorized Representative", payload.fullName, false],
    ["Business Email Address", payload.email, false],
    ["Direct Phone / Viber / WhatsApp", payload.phone, false],
    ["Fiscal Year-End / Target Filing Date", formatTargetDate(payload.targetDate), false],
    ["Accounting Service Needed", payload.service, false],
    ["Business Address / Tax Jurisdiction (RDO)", payload.businessAddress, false],
    ["Business Details & Specific Needs", payload.details, true],
    ["Submitted", submittedAt, false],
  ];

  const tableRows = rows
    .map(([label, value, multiline], index) => {
      const background = index % 2 === 0 ? "#FFFFFF" : "#F7F9FC";
      const content = multiline ? escapeMultiline(value) : escapeHtml(value);
      return `
        <tr>
          <td style="padding:12px 16px;background:${background};border-bottom:1px solid #E6EBF2;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#5A6B80;width:38%;vertical-align:top;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">
            ${escapeHtml(label)}
          </td>
          <td style="padding:12px 16px;background:${background};border-bottom:1px solid #E6EBF2;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#0B2545;vertical-align:top;">
            ${content}
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New website inquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#F5F7FA;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E6EBF2;">
            <tr>
              <td style="background:#0B2545;padding:22px 24px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A227;font-weight:700;">
                  ${escapeHtml(FIRM_NAME)}
                </p>
                <h1 style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:21px;line-height:28px;color:#FFFFFF;">
                  New website inquiry
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 24px 8px;">
                <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#3D4C5F;">
                  A new inquiry was submitted through the website. Reply directly to this email to reach the client.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E6EBF2;border-radius:8px;overflow:hidden;border-collapse:collapse;">
                  ${tableRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7A8899;">
                  Sent automatically from the ${escapeHtml(FIRM_NAME)} website inquiry form.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Auto-reply marketing email                                          */
/* ------------------------------------------------------------------ */

function buildAutoReplyEmail(
  payload: InquiryPayload,
  notifyTo: string,
): { html: string; text: string } {
  const firstName = firstNameOf(payload.fullName);
  const safeFirst = escapeHtml(firstName);
  const targetDate = formatTargetDate(payload.targetDate);
  const ctaUrl = `mailto:${notifyTo}?subject=${encodeURIComponent(
    "Free Consultation Request",
  )}`;

  const serviceRow = (title: string, description: string): string => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #EDF1F6;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#0B2545;font-weight:700;vertical-align:top;width:38%;">
        ${escapeHtml(title)}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #EDF1F6;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#52627A;vertical-align:top;">
        ${escapeHtml(description)}
      </td>
    </tr>`;

  const summaryRow = (label: string, value: string): string => `
    <tr>
      <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#5A6B80;width:42%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#0B2545;font-weight:700;">${escapeMultiline(value)}</td>
    </tr>`;

  // The client's copy mirrors the firm's notification so both sides hold the
  // same complete record of what was submitted.
  const summaryItems: Array<[string, string]> = [
    ["Full name / authorized representative", payload.fullName],
    ["Business email address", payload.email],
    ["Direct phone / Viber / WhatsApp", payload.phone],
    ["Fiscal year-end / target filing date", targetDate],
    ["Accounting service needed", payload.service],
    ["Business address / tax jurisdiction (RDO)", payload.businessAddress],
    ["Business details & specific needs", payload.details],
  ];
  const summaryRows = summaryItems.map(([label, value]) => summaryRow(label, value)).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Thank you for contacting ${escapeHtml(FIRM_NAME)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F5F7FA;">
    <div style="display:none;font-size:1px;color:#F5F7FA;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      We received your request, ${safeFirst}. Here is what happens next.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FA;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E6EBF2;">

            <!-- Header -->
            <tr>
              <td style="background:#0B2545;padding:26px 28px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A227;font-weight:700;">
                  ${escapeHtml(FIRM_NAME)}
                </p>
                <h1 style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:32px;color:#FFFFFF;">
                  Thank you, ${safeFirst}!
                </h1>
                <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#C7D4E6;">
                  We have received your inquiry and our team is already reviewing it.
                </p>
              </td>
            </tr>
            <tr><td style="height:4px;background:#C9A227;font-size:0;line-height:0;">&nbsp;</td></tr>

            <!-- Intro -->
            <tr>
              <td style="padding:28px 28px 8px;">
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#3D4C5F;">
                  Hi ${safeFirst},
                </p>
                <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#3D4C5F;">
                  Your request for <strong style="color:#0B2545;">${escapeHtml(payload.service)}</strong> has been received. We will review the details you shared and reply within one business day.
                </p>
              </td>
            </tr>

            <!-- Summary -->
            <tr>
              <td style="padding:0 28px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;border:1px solid #E6EBF2;border-radius:10px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A227;font-weight:700;">
                        Your submission
                      </p>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${summaryRows}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- What happens next -->
            <tr>
              <td style="padding:22px 28px 4px;">
                <h2 style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:24px;color:#0B2545;">
                  What happens next
                </h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#3D4C5F;">
                      <span style="display:inline-block;width:22px;height:22px;border-radius:11px;background:#0B2545;color:#FFFFFF;font-size:12px;line-height:22px;text-align:center;font-weight:700;margin-right:8px;">1</span>
                      We review your details and confirm which filings are due.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#3D4C5F;">
                      <span style="display:inline-block;width:22px;height:22px;border-radius:11px;background:#0B2545;color:#FFFFFF;font-size:12px;line-height:22px;text-align:center;font-weight:700;margin-right:8px;">2</span>
                      We contact you for a free consultation and a clear scope of work.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#3D4C5F;">
                      <span style="display:inline-block;width:22px;height:22px;border-radius:11px;background:#0B2545;color:#FFFFFF;font-size:12px;line-height:22px;text-align:center;font-weight:700;margin-right:8px;">3</span>
                      We collect your documents and handle the preparation and filing.
                    </td>
                  </tr>
                </table>
                <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#5A6B80;">
                  <strong style="color:#0B2545;">Response time:</strong> within one business day, Monday to Friday.
                </p>
              </td>
            </tr>

            <!-- Services / marketing -->
            <tr>
              <td style="padding:26px 28px 8px;">
                <h2 style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:24px;color:#0B2545;">
                  How we can help your business
                </h2>
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#52627A;">
                  We support Philippine businesses end to end, from registration to year-end reporting.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #EDF1F6;">
                  ${serviceRow("BIR tax filing", "Monthly, quarterly and annual returns prepared and filed on time.")}
                  ${serviceRow("SLSP preparation", "Summary List of Sales and Purchases, reconciled and submission-ready.")}
                  ${serviceRow("Bookkeeping", "Clean books, bank reconciliation and management reports.")}
                  ${serviceRow("Payroll", "Payroll processing, payslips and statutory remittances.")}
                  ${serviceRow("Registration", "DTI/SEC, BIR, Mayor's permit and renewal support.")}
                  ${serviceRow("Audit & advisory", "Financial statement audits and practical business advice.")}
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td style="padding:20px 28px 26px;" align="center">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius:8px;background:#C9A227;">
                      <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;padding:14px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#0B2545;text-decoration:none;border-radius:8px;">
                        Book Your Free Consultation
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7A8899;">
                  No obligation. We will confirm the schedule with you.
                </p>
              </td>
            </tr>

            <!-- Deadlines -->
            <tr>
              <td style="padding:0 28px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7EA;border:1px solid #EEDFAF;border-radius:10px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#0B2545;font-weight:700;">
                        Common BIR deadlines to keep in mind
                      </p>
                      <ul style="margin:0;padding-left:18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#52627A;">
                        <li style="margin-bottom:4px;"><strong style="color:#0B2545;">Monthly:</strong> withholding tax, VAT or percentage tax, and statutory remittances, generally due in the first half of the following month.</li>
                        <li style="margin-bottom:4px;"><strong style="color:#0B2545;">Quarterly:</strong> quarterly income tax and VAT returns, generally due within the month after each quarter closes.</li>
                        <li><strong style="color:#0B2545;">Annual:</strong> annual income tax returns and attachments, generally due in the first half of the year.</li>
                      </ul>
                      <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#7A6A35;">
                        Deadlines vary by taxpayer and can be extended. Please confirm current dates with us before filing.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#0B2545;padding:22px 28px;">
                <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#FFFFFF;font-weight:700;">
                  ${escapeHtml(FIRM_NAME)}
                </p>
                <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#C7D4E6;">
                  ${escapeHtml(FIRM_ADDRESS)}
                </p>
                <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#C7D4E6;">
                  ${escapeHtml(FIRM_PHONE)} &middot; ${escapeHtml(notifyTo)}
                </p>
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#93A6BE;">
                  You received this email because you submitted an inquiry through our website. Your personal data is processed in accordance with the Data Privacy Act of 2012 (RA 10173) and is used only to respond to your request. Reply to this email to update or withdraw your information.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Thank you, ${firstName}!`,
    "",
    "Your submission:",
    `Full name / authorized representative: ${payload.fullName}`,
    `Business email address: ${payload.email}`,
    `Direct phone / Viber / WhatsApp: ${payload.phone}`,
    `Fiscal year-end / target filing date: ${targetDate}`,
    `Accounting service needed: ${payload.service}`,
    `Business address / tax jurisdiction (RDO): ${payload.businessAddress}`,
    `Business details & specific needs: ${payload.details}`,
    "",
    "What happens next:",
    "1. We review your details and confirm which filings are due.",
    "2. We contact you for a free consultation and a clear scope of work.",
    "3. We collect your documents and handle the preparation and filing.",
    "",
    "We reply within one business day (Monday to Friday).",
    "",
    "How we can help:",
    "- BIR tax filing: monthly, quarterly and annual returns filed on time",
    "- SLSP preparation: reconciled Summary List of Sales and Purchases",
    "- Bookkeeping: clean books, reconciliation and management reports",
    "- Payroll: processing, payslips and statutory remittances",
    "- Registration: DTI/SEC, BIR, Mayor's permit and renewals",
    "- Audit and advisory: financial statement audits and business advice",
    "",
    `Book your free consultation: ${ctaUrl}`,
    "",
    "Common BIR deadlines (please confirm current dates with us):",
    "- Monthly: withholding tax, VAT or percentage tax, and statutory remittances",
    "- Quarterly: quarterly income tax and VAT returns",
    "- Annual: annual income tax returns and attachments",
    "Deadlines vary by taxpayer and may be extended. Confirm with us before filing.",
    "",
    FIRM_NAME,
    FIRM_ADDRESS,
    `${FIRM_PHONE} | ${notifyTo}`,
    "",
    "Your personal data is processed under the Data Privacy Act of 2012 (RA 10173) and used only to respond to your inquiry. Reply to this email to update or withdraw your information.",
  ].join("\n");

  return { html, text };
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ success: false, message: "Method not allowed. Use POST." });
    return;
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please wait a few minutes and try again.",
    });
    return;
  }

  const body = parseBody(req.body);
  if (!body) {
    res.status(400).json({ success: false, message: "Invalid request body." });
    return;
  }

  // Honeypot: real users never fill the hidden "companyWebsite" field.
  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim() !== "") {
    res.status(400).json({ success: false, message: "Invalid request." });
    return;
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Please correct the highlighted fields and try again.",
      fieldErrors: collectFieldErrors(parsed.error),
    });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    console.error("send-inquiry: RESEND_API_KEY is not configured.");
    res.status(500).json({
      success: false,
      message:
        "Email service is not configured. Please call or email us directly and we will assist you.",
    });
    return;
  }

  const notifyTo = process.env.NOTIFY_TO_EMAIL?.trim() || DEFAULT_NOTIFY_TO;
  const from = withFirmSenderName(process.env.FROM_EMAIL?.trim() || DEFAULT_FROM);
  const payload = parsed.data;
  const resend = new Resend(apiKey);
  const submittedAt = manilaTimestamp();

  // 1) Internal notification to the firm.
  try {
    const { error } = await resend.emails.send({
      from,
      to: [notifyTo],
      replyTo: payload.email,
      subject: `New Inquiry: ${payload.service} - ${payload.fullName}`,
      html: buildInternalEmail(payload, submittedAt),
    });

    if (error) {
      console.error("send-inquiry: internal notification failed:", error.message);
      res.status(502).json({
        success: false,
        message: `We could not deliver your inquiry by email right now. Please try again in a moment, or email us directly at ${DEFAULT_NOTIFY_TO}.`,
      });
      return;
    }
  } catch (error) {
    console.error(
      "send-inquiry: internal notification threw:",
      error instanceof Error ? error.message : "unknown error",
    );
    res.status(502).json({
      success: false,
      message: `We could not deliver your inquiry by email right now. Please try again in a moment, or email us directly at ${DEFAULT_NOTIFY_TO}.`,
    });
    return;
  }

  // 2) Auto-reply to the client, with the firm inbox on CC so the client's
  //    business email and onlineateagles@gmail.com receive it at the same time.
  const { html, text } = buildAutoReplyEmail(payload, notifyTo);
  const clientEmail = payload.email.trim();
  const cc = notifyTo.toLowerCase() === clientEmail.toLowerCase() ? undefined : [notifyTo];
  const autoReplySubject = `Thank you for contacting us, ${firstNameOf(
    payload.fullName,
  )}! Here's what happens next`;
  const smtp = getSmtpSender();

  try {
    if (smtp) {
      // Gmail (or any SMTP relay) delivers to real client addresses, unlike
      // Resend's shared test sender.
      await smtp.transport.sendMail({
        from: `"${FIRM_NAME}" <${smtp.user}>`,
        to: clientEmail,
        cc: cc?.join(", "),
        replyTo: notifyTo,
        subject: autoReplySubject,
        html,
        text,
      });
    } else {
      const { error } = await resend.emails.send({
        from,
        to: [clientEmail],
        cc,
        replyTo: notifyTo,
        subject: autoReplySubject,
        html,
        text,
      });

      if (error) {
        console.error("send-inquiry: client auto-reply failed:", error.message);
      }
    }
  } catch (error) {
    console.error(
      "send-inquiry: client auto-reply threw:",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  res.status(200).json({ success: true });
}
