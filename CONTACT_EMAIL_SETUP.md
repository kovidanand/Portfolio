# Formspree Contact Form Configuration

The portfolio contact form in `index.html` and `script.js` is connected to Formspree (`https://formspree.io/f/xrpqrwba`).

## Configuration Summary

- **Endpoint**: `https://formspree.io/f/xrpqrwba` (`action` attribute on `#contactForm` in `index.html`)
- **Method & Headers**: `POST` with `Accept: application/json` and `Content-Type: application/json`
- **Mapped Fields**: `name`, `email`, `subject`, `message`, `_replyto`, `_subject`, and `_gotcha` (honeypot spam protection)
- **Recipient**: Configured in the Formspree dashboard (`kovidanand05@gmail.com`)
