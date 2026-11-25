# Portfolio Direct Email Setup Guide

Your portfolio is hosted statically on **GitHub Pages**, so secret email API keys must never be stored in frontend files (`index.html` or `script.js`).

This repository includes:
- **Frontend Contact Form** in `index.html`, `style.css`, and `script.js` (directly below your displayed email in `#contact`).
- **Serverless Backend** in `worker/src/index.js` (Cloudflare Worker using the Resend API).

---

## Step 1: Configure Resend & Verify Your Sending Domain

1. Create a free account at [Resend](https://resend.com).
2. Go to **Domains → Add Domain** and verify your sending domain (e.g., `kovidanand.dev` or a subdomain like `mail.kovidanand.dev`) by adding the SPF, DKIM, and DMARC DNS records Resend provides.
   > **Important:** Domain verification is required so Resend can send **both**:
   > - Incoming portfolio messages to `kovidanand05@gmail.com` (with `Reply-To` set to the visitor's email), and
   > - Confirmation copy emails directly to arbitrary visitors' email addresses.
   > Without a verified domain, Resend's sandbox (`onboarding@resend.dev`) restricts delivery to your own Resend account email only.
3. Go to **API Keys → Create API Key** and generate a key with **Sending access**. Copy the key (starts with `re_`).

---

## Step 2: Deploy the Cloudflare Worker

From the `worker/` directory:

```bash
cd worker
npm install -g wrangler   # or use: npx wrangler
npx wrangler login
```

Set your secret API key and verified sender address on Cloudflare (never commit secrets to Git):

```bash
npx wrangler secret put RESEND_API_KEY
# Paste your Resend API key (re_...)

npx wrangler secret put SENDER_EMAIL
# Enter: Kovid Anand Portfolio <contact@yourdomain.com>
```

Deploy the Worker:

```bash
npx wrangler deploy
```

Wrangler will output your live Worker URL, for example:
`https://portfolio-contact-worker.<your-subdomain>.workers.dev`

---

## Step 3: Connect the Portfolio Frontend to Your Worker URL

Open `index.html`, find `#contactForm`, and set `data-endpoint` to your deployed Worker URL:

```html
<form class="contact-form" id="contactForm" data-endpoint="https://portfolio-contact-worker.<your-subdomain>.workers.dev" novalidate>
```

Commit and push `index.html` to `main` so GitHub Pages updates.

---

## Local Verification & Testing

Run the automated Worker unit & integration tests (Node.js 20+):

```bash
cd worker
npm test
```

To test locally with a live Worker before deploying:

```bash
cd worker
npx wrangler dev
```
