/**
 * Cloudflare Worker for Kovid Anand Portfolio Contact Form
 * Uses Resend HTTP API via standard Web Fetch (zero framework overhead).
 *
 * Required Secrets / Env Vars:
 *   - RESEND_API_KEY (Cloudflare Worker Secret)
 *   - SENDER_EMAIL (Verified domain sender, e.g. "Kovid Anand Portfolio <contact@yourdomain.com>")
 *   - RECIPIENT_EMAIL (Defaults to "kovidanand05@gmail.com")
 *   - ALLOWED_ORIGINS (Comma-separated origins, e.g. "https://kovidanand.github.io")
 */

const EMAIL_REGEX = /^[^\s@<>()[\]\\.,;:\s@"]+(\.[^\s@<>()[\]\\.,;:\s@"]+)*@[^\s@<>()[\]\\.,;:\s@"]+\.[^\s@]{2,}$/;
const RESEND_API_URL = 'https://api.resend.com/emails';
const DEFAULT_RECIPIENT = 'kovidanand05@gmail.com';
const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

const ipRequestLog = new Map();

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeSingleLine(str) {
  return String(str ?? '')
    .replace(/[\r\n\t\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeMultiline(str) {
  return String(str ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

export function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, fieldErrors: {}, error: 'Invalid request payload.' };
  }

  const honeypot = sanitizeSingleLine(body.website);
  if (honeypot.length > 0) {
    return { valid: true, isBot: true, data: null };
  }

  const name = sanitizeSingleLine(body.name);
  const email = sanitizeSingleLine(body.email).toLowerCase();
  const subject = sanitizeSingleLine(body.subject);
  const message = sanitizeMultiline(body.message);

  const fieldErrors = {};

  if (!name || name.length < 2 || name.length > 100) {
    fieldErrors.name = 'Name must be between 2 and 100 characters.';
  }

  if (!email || email.length > 160 || !EMAIL_REGEX.test(email)) {
    fieldErrors.email = 'Please enter a valid email address.';
  }

  if (!subject || subject.length < 2 || subject.length > 160) {
    fieldErrors.subject = 'Subject must be between 2 and 160 characters.';
  }

  if (!message || message.length < 10 || message.length > 3000) {
    fieldErrors.message = 'Message must be between 10 and 3000 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      valid: false,
      fieldErrors,
      error: 'Please check the highlighted fields and try again.'
    };
  }

  return {
    valid: true,
    isBot: false,
    data: { name, email, subject, message }
  };
}

export function checkRateLimit(clientIp, now = Date.now(), store = ipRequestLog) {
  const key = clientIp || 'unknown';
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  for (const [ip, timestamps] of store.entries()) {
    const active = timestamps.filter((t) => t > windowStart);
    if (active.length === 0) {
      store.delete(ip);
    } else if (active.length !== timestamps.length) {
      store.set(ip, active);
    }
  }

  const history = store.get(key) || [];
  if (history.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = history[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  history.push(now);
  store.set(key, history);
  return { allowed: true, retryAfterSec: 0 };
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = (env?.ALLOWED_ORIGINS || 'https://kovidanand.github.io')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const allowedOrigin = configured.includes('*')
    ? origin || '*'
    : configured.includes(origin) || isLocalOrigin
      ? origin
      : configured[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function jsonResponse(payload, status, corsHeaders, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...corsHeaders,
      ...extraHeaders
    }
  });
}

function buildOwnerEmailText({ name, email, subject, message }) {
  return [
    `Name: ${name}`,
    '',
    `Email: ${email}`,
    '',
    `Subject: ${subject}`,
    '',
    'Message:',
    '',
    message
  ].join('\n');
}

function buildOwnerEmailHtml({ name, email, subject, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1f1f1e; line-height: 1.6;">
      <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #2563eb; font-weight: 600;">Portfolio Contact Submission</p>
        <h2 style="margin: 6px 0 0; font-size: 20px; color: #1f1f1e;">${safeSubject}</h2>
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #5c5c57; width: 90px; font-weight: 600;">Name:</td>
          <td style="padding: 6px 0; color: #1f1f1e;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #5c5c57; font-weight: 600;">Email:</td>
          <td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #5c5c57; font-weight: 600;">Subject:</td>
          <td style="padding: 6px 0; color: #1f1f1e;">${safeSubject}</td>
        </tr>
      </table>
      <div style="background: #fafaf7; border: 1px solid #e5e5df; border-radius: 8px; padding: 16px; font-size: 14px; color: #1f1f1e;">
        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #82827c; font-weight: 600;">Message</p>
        <div>${safeMessage}</div>
      </div>
    </div>
  `.trim();
}

function buildConfirmationEmailText({ name, subject, message }) {
  return [
    `Hello ${name},`,
    '',
    'Thank you for reaching out through my portfolio.',
    '',
    'Your message has been successfully received. I appreciate your interest and will get back to you as soon as possible.',
    '',
    '---',
    'Copy of your submitted message:',
    `Subject: ${subject}`,
    '',
    message,
    '---',
    '',
    'Best regards,',
    'Kovid Anand'
  ].join('\n');
}

function buildConfirmationEmailHtml({ name, subject, message }) {
  const safeName = escapeHtml(name);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1f1f1e; line-height: 1.65;">
      <p>Hello ${safeName},</p>
      <p>Thank you for reaching out through my portfolio.</p>
      <p>Your message has been successfully received. I appreciate your interest and will get back to you as soon as possible.</p>
      <div style="margin: 22px 0; background: #fafaf7; border: 1px solid #e5e5df; border-radius: 8px; padding: 16px; font-size: 13.5px;">
        <p style="margin: 0 0 8px; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.05em; color: #82827c; font-weight: 600;">Copy of Your Message</p>
        <p style="margin: 0 0 10px;"><strong>Subject:</strong> ${safeSubject}</p>
        <div style="color: #5c5c57;">${safeMessage}</div>
      </div>
      <p style="margin-bottom: 0;">Best regards,<br/><strong>Kovid Anand</strong></p>
    </div>
  `.trim();
}

export async function handleContactRequest(request, env = {}, deps = {}) {
  const fetchFn = deps.fetch || globalThis.fetch;
  const rateLimitStore = deps.rateLimitStore || ipRequestLog;
  const nowFn = deps.now || (() => Date.now());
  const corsHeaders = getCorsHeaders(request, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      { success: false, error: 'Method not allowed.' },
      405,
      corsHeaders,
      { Allow: 'POST, OPTIONS' }
    );
  }

  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    (request.headers.get('X-Forwarded-For') || '').split(',')[0].trim() ||
    'unknown';

  const rateResult = checkRateLimit(clientIp, nowFn(), rateLimitStore);
  if (!rateResult.allowed) {
    return jsonResponse(
      { success: false, error: 'Too many attempts. Please try again later.' },
      429,
      corsHeaders,
      { 'Retry-After': String(rateResult.retryAfterSec) }
    );
  }

  if (env.CONTACT_RATE_LIMITER && typeof env.CONTACT_RATE_LIMITER.limit === 'function') {
    const { success } = await env.CONTACT_RATE_LIMITER.limit({ key: clientIp });
    if (!success) {
      return jsonResponse(
        { success: false, error: 'Too many attempts. Please try again later.' },
        429,
        corsHeaders
      );
    }
  }

  const contentType = (request.headers.get('Content-Type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return jsonResponse(
      { success: false, error: 'Content-Type must be application/json.' },
      415,
      corsHeaders
    );
  }

  let rawText = '';
  try {
    rawText = await request.text();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid request body.' }, 400, corsHeaders);
  }

  if (new TextEncoder().encode(rawText).byteLength > MAX_BODY_BYTES) {
    return jsonResponse({ success: false, error: 'Payload too large.' }, 413, corsHeaders);
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(rawText);
  } catch {
    return jsonResponse({ success: false, error: 'Malformed JSON body.' }, 400, corsHeaders);
  }

  const validation = validatePayload(parsedBody);
  if (!validation.valid) {
    return jsonResponse(
      {
        success: false,
        error: validation.error,
        fieldErrors: validation.fieldErrors
      },
      400,
      corsHeaders
    );
  }

  if (validation.isBot) {
    // Acknowledge silently without consuming email provider quota.
    return jsonResponse({ success: true }, 200, corsHeaders);
  }

  const apiKey = (env.RESEND_API_KEY || '').trim();
  const senderEmail = (env.SENDER_EMAIL || '').trim();
  const recipientEmail = (env.RECIPIENT_EMAIL || DEFAULT_RECIPIENT).trim();

  if (!apiKey || !senderEmail) {
    console.error('Email service misconfigured: RESEND_API_KEY or SENDER_EMAIL missing.');
    return jsonResponse(
      { success: false, error: 'Our email service is temporarily unavailable.' },
      503,
      corsHeaders
    );
  }

  const { name, email, subject, message } = validation.data;
  const resendEndpoint = (env.RESEND_API_URL || RESEND_API_URL).trim();

  let primaryResponse;
  try {
    primaryResponse = await fetchFn(resendEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [recipientEmail],
        reply_to: email,
        subject: `[Portfolio Contact] ${subject}`,
        text: buildOwnerEmailText({ name, email, subject, message }),
        html: buildOwnerEmailHtml({ name, email, subject, message })
      })
    });
  } catch (err) {
    console.error('Primary Resend API request failed:', err);
    return jsonResponse(
      { success: false, error: 'Unable to send your message right now. Please try again in a moment.' },
      502,
      corsHeaders
    );
  }

  if (!primaryResponse.ok) {
    let errDetail = '';
    try {
      errDetail = await primaryResponse.text();
    } catch {
      errDetail = '';
    }
    console.error(`Primary Resend delivery rejected (${primaryResponse.status}):`, errDetail);
    return jsonResponse(
      { success: false, error: 'Unable to send your message right now. Please try again in a moment.' },
      502,
      corsHeaders
    );
  }

  let primaryData = {};
  try {
    primaryData = await primaryResponse.json();
  } catch {
    primaryData = {};
  }

  // Send confirmation copy to the visitor ONLY after primary delivery succeeds.
  let confirmationSent = false;
  try {
    const confirmResponse = await fetchFn(resendEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [email],
        reply_to: recipientEmail,
        subject: 'Your message has been received - Kovid Anand',
        text: buildConfirmationEmailText({ name, subject, message }),
        html: buildConfirmationEmailHtml({ name, subject, message })
      })
    });

    confirmationSent = confirmResponse.ok;
    if (!confirmResponse.ok) {
      const confirmErr = await confirmResponse.text().catch(() => '');
      console.warn(`Visitor confirmation email not sent (${confirmResponse.status}):`, confirmErr);
    }
  } catch (err) {
    console.warn('Visitor confirmation email request failed:', err);
  }

  return jsonResponse(
    {
      success: true,
      deliveredToOwner: true,
      confirmationSent,
      id: primaryData.id || null
    },
    200,
    corsHeaders
  );
}

export default {
  async fetch(request, env, ctx) {
    return handleContactRequest(request, env);
  }
};
