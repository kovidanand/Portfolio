# Formspree Contact Form Setup

Your portfolio contact form in `index.html` and `script.js` is pre-configured for **Formspree** AJAX delivery (`POST` with `Accept: application/json`), `_replyto`, `_subject`, and `_gotcha` honeypot spam protection.

## Connect Your Formspree Endpoint

1. Sign in at [Formspree](https://formspree.io) and create a new form targeting `kovidanand05@gmail.com`.
2. Copy your Formspree form endpoint URL (e.g., `https://formspree.io/f/abcdefgh`).
3. Share the endpoint URL (or paste it into `action="..."` on `<form id="contactForm">` in `index.html`).
4. *(Optional)* In your Formspree form's **Settings** tab:
   - Keep **Email Notifications** enabled so you receive submissions directly in your inbox (Reply-To is automatically set to the visitor's email via `_replyto`).
   - Enable **Autoresponse** if your Formspree plan includes it, to send an automatic receipt to the visitor.
   - Keep Formspree's built-in **Spam Protection / Akismet** enabled alongside the form's `_gotcha` honeypot field.
