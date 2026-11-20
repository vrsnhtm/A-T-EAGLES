# A&T Accounting — Website & Lead Capture

A production-ready single-page marketing site for a Philippine accounting firm,
with a validated inquiry form that emails the firm and auto-replies to the client.

**Stack:** Vite · React 18 · TypeScript (strict) · Tailwind CSS v3 · Zod ·
lucide-react · Resend · Vercel Serverless Function.

---

## 1. Project structure

```
.
├── api/
│   └── send-inquiry.ts          # Vercel serverless function (Resend email)
├── public/
│   ├── favicon.svg
│   └── images/
│       └── marketing.png        # <-- add your marketing artwork here
├── server/
│   └── dev-api.ts               # Dev-only middleware that runs the api/ handler
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── MarketingBanner.tsx
│   │   ├── WhyUs.tsx
│   │   ├── Process.tsx
│   │   ├── InquiryForm.tsx
│   │   ├── SuccessMessage.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   └── validation.ts        # Shared Zod schema + PH phone helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── .env.example
└── package.json
```

### Install commands

```bash
npm install
npm install resend zod lucide-react
npm install -D @vercel/node
```

(These are already declared in `package.json`; the commands above are only needed
if you start from a blank folder or add packages later.)

---

## 2. Local development

### Start the app (frontend + API)

```bash
npm install
npm run dev
```

Open http://localhost:5173. `npm run dev` also serves `/api/send-inquiry`:
`server/dev-api.ts` loads the real handler from `api/send-inquiry.ts` and exposes it
through the Vite dev server, so the form sends email locally too.

Create `.env.local` (copy `.env.example`) and add your values:

```bash
cp .env.example .env.local
```

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
NOTIFY_TO_EMAIL=onlineateagles@gmail.com
FROM_EMAIL="A&T Accounting <onboarding@resend.dev>"
```

`.env.local` is git-ignored. Never commit real keys. Restart `npm run dev` after
editing it.

### Alternative: `vercel dev`

```bash
vercel dev
```

This runs the same function inside Vercel's local runtime. Either command works;
the plain `npm run dev` is faster.

Production build check:

```bash
npm run build
```

This runs `tsc --noEmit` (strict, zero errors) and then `vite build` into `dist/`.

---

## 3. Email setup with Resend

1. Create an account at <https://resend.com> and add an API key
   (Dashboard → **API Keys** → Create).
2. Put the key in `.env.local` (local) or in Vercel → Project → **Settings →
   Environment Variables** (production). Name: `RESEND_API_KEY`.
3. Set `NOTIFY_TO_EMAIL` to the inbox that should receive inquiries
   (default fallback: `onlineateagles@gmail.com`).
4. Set `FROM_EMAIL` to a sender you are allowed to use.

### Important: `onboarding@resend.dev`

`onboarding@resend.dev` is Resend's shared test sender. It only delivers to the
email address that owns the Resend account, so:

- Internal notifications to your own inbox work fine while testing.
- **Client auto-replies are rejected** for every other address with
  `403 validation_error`, so a real client receives nothing.

### Option A — send client confirmations from Gmail (no domain needed)

The function uses Gmail SMTP for the client email whenever `SMTP_USER` and
`SMTP_PASS` are set. The client input stays in `To` and the firm inbox stays on
`Cc`; only the sender changes, from the test address to the firm's own mailbox.

1. Enable 2-Step Verification: <https://myaccount.google.com/security>.
2. Create an App Password: <https://myaccount.google.com/apppasswords>
   (name it "A&T website").
3. Add both values to `.env.local` (and to Vercel env vars when deployed):

   ```env
   SMTP_USER=onlineateagles@gmail.com
   SMTP_PASS=the16characterpassword
   ```

4. Restart `npm run dev`. Confirmations send from
   `A&T Accounting <onlineateagles@gmail.com>` and reach any client.

Leave both variables unset to keep using Resend.

### Option B — verify your own domain (best deliverability)

1. In Resend, go to **Domains → Add Domain** and enter the firm's domain
   (e.g. `yourfirm.ph`).
2. Add the DNS records Resend shows (SPF, DKIM, and DMARC if prompted) at your
   registrar or DNS host.
3. Wait for verification — usually minutes, up to a few hours.
4. Update `FROM_EMAIL` to a verified address on that domain, e.g.:

   ```env
   FROM_EMAIL="A&T Accounting <inquiries@yourfirm.ph>"
   ```

5. Redeploy (or restart `vercel dev`) so the new value is picked up.

### Two emails per submission

| Email | Recipient | Notes |
| --- | --- | --- |
| Internal notification | `NOTIFY_TO_EMAIL` | Subject: `New Inquiry: {service} - {fullName}`; `Reply-To` set to the client; HTML table of all 7 fields + Asia/Manila timestamp. |
| Auto-reply | Client's business email | Subject: `Thank you for contacting us, {firstName}! Here's what happens next`; mobile-friendly inline-CSS marketing email with plain-text fallback. |
| Copy of the auto-reply | `CC` on the client email → `NOTIFY_TO_EMAIL` | The client stays in `To`, the firm inbox is added as `cc` on the same send; omitted when the client used the firm's own address. |

The client email is sent through Gmail SMTP when `SMTP_USER` and `SMTP_PASS`
are set, otherwise through Resend (which only reaches the account owner until a
domain is verified). If the internal notification fails, the API returns an
error because the lead was not captured. A failed client auto-reply is logged
but does not fail the request, since the inquiry itself was delivered.

---

## 4. Marketing image

Drop your artwork at:

```
public/images/marketing.png
```

The site references it as `/images/marketing.png`. No code change is needed if you
keep that filename. To swap or add images, edit
`src/components/MarketingBanner.tsx` — the comment above the component explains
how. Keep a descriptive `alt` attribute and `loading="lazy"` for every image.

If the file is missing, the section shows a friendly fallback message instead of a
broken image.

---

## 5. Deploy to Vercel

### Option A — GitHub + dashboard

1. Push this project to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repository.
3. Vercel auto-detects **Vite**:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   (`vercel.json` already encodes this.)
4. Add the environment variables under **Settings → Environment Variables**:
   - `RESEND_API_KEY`
   - `NOTIFY_TO_EMAIL`
   - `FROM_EMAIL`
5. Click **Deploy**.
6. After the first deploy, verify the domain in Resend and update `FROM_EMAIL`,
   then trigger a redeploy.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel            # preview deployment
vercel --prod     # production deployment
```

Then add the environment variables in the dashboard and redeploy:

```bash
vercel env add RESEND_API_KEY
vercel env add NOTIFY_TO_EMAIL
vercel env add FROM_EMAIL
vercel --prod
```

### Routing

`vercel.json`:

- builds the Vite SPA to `dist`,
- rewrites every non-`/api` path to `index.html` (so anchors and refreshes work),
- leaves `/api/send-inquiry` handled by the serverless function.

### Smoke test in production

1. Open the deployed URL, scroll to the form, submit a real inquiry.
2. Confirm the internal notification arrived (`Reply-To` should be your test email).
3. Confirm the auto-reply arrived in the client inbox (requires a verified domain).
4. Check the function logs in Vercel → **Deployments → Functions** if a send fails.

---

## 6. Form & API behavior

### Client (`src/components/InquiryForm.tsx`)

- Client-side validation with the same Zod schema as the server.
- Inline errors with `aria-invalid`, `aria-describedby`, and focus moved to the
  first invalid field.
- Loading state with disabled submit button.
- Success state (`SuccessMessage`) that clears the form.
- Error state with a **Try again** action that preserves the entered values.
- Hidden honeypot field (`companyWebsite`) plus a required Data Privacy consent.

### Server (`api/send-inquiry.ts`)

- `POST` only → `405` otherwise (with `Allow: POST`).
- Zod validation → `400` with `fieldErrors`.
- Honeypot filled → `400`.
- In-memory rate limit: 5 requests per IP per 10 minutes → `429`.
  This is per serverless instance and is best-effort, not a distributed limiter.
- All user input is HTML-escaped before interpolation into email markup.
- Missing `RESEND_API_KEY` → `500` with a helpful message.
- Success → `200 { "success": true }`.

Example request:

```bash
curl -X POST http://localhost:3000/api/send-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Dela Cruz",
    "email": "juan@example.ph",
    "phone": "+639171234567",
    "targetDate": "2026-12-31",
    "service": "Tax Preparation & Compliance Filing",
    "businessAddress": "Unit 1, Building, Makati City — RDO 047",
    "details": "We need quarterly VAT and withholding tax filings for a small retail business.",
    "consent": true,
    "companyWebsite": ""
  }'
```

---

## 7. Customization checklist

- [ ] Replace the firm name in `Navbar.tsx`, `Hero.tsx`, email templates, and `Footer.tsx`.
- [ ] Replace footer contact placeholders (address, phone).
- [ ] Add `public/images/marketing.png`.
- [ ] Update SEO strings and the Open Graph image in `index.html`.
- [ ] Update the firm placeholders in `api/send-inquiry.ts`
      (`FIRM_NAME`, `FIRM_PHONE`, `FIRM_ADDRESS`).
- [ ] Verify the sending domain in Resend and set `FROM_EMAIL`.
- [ ] Set `NOTIFY_TO_EMAIL` to the real inbox.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Email service is not configured` | `RESEND_API_KEY` is empty. Add it to `.env.local` and restart `npm run dev` (or add it in Vercel and redeploy). |
| `We could not deliver your inquiry by email` | Resend rejected the send. Check the terminal for the Resend error — usually a wrong API key, or `onboarding@resend.dev` used for a recipient that is not the Resend account owner. |
| Form fails only in production | Env vars were added after the last deployment — redeploy. |
| Auto-reply not received | Verify the domain in Resend; `onboarding@resend.dev` only sends to the account owner. |
| Auto-reply in spam | Complete SPF/DKIM/DMARC for the sending domain. |
| `405` on the API | The endpoint only accepts `POST`. |
| `429` while testing | Wait 10 minutes, or restart `vercel dev` to clear in-memory limits. |
| Banner shows the fallback | `public/images/marketing.png` is missing or misnamed. |
