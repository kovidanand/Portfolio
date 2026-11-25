import test from 'node:test';
import assert from 'node:assert/strict';
import { handleContactRequest, validatePayload, escapeHtml } from '../src/index.js';

function createRequest(body, { method = 'POST', origin = 'https://kovidanand.github.io', ip = '203.0.113.10', contentType = 'application/json' } = {}) {
  const headers = new Headers({
    Origin: origin,
    'CF-Connecting-IP': ip
  });
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  const init = { method, headers };
  if (method !== 'GET' && method !== 'OPTIONS' && body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('https://portfolio-contact.example.workers.dev/', init);
}

const baseEnv = {
  RESEND_API_KEY: 're_test_dummy_secret',
  SENDER_EMAIL: 'Kovid Anand Portfolio <contact@kovidanand.dev>',
  RECIPIENT_EMAIL: 'kovidanand05@gmail.com',
  ALLOWED_ORIGINS: 'https://kovidanand.github.io'
};

test('delivers owner email with Reply-To and sends confirmation copy to visitor', async () => {
  const sentEmails = [];
  const mockFetch = async (_url, options) => {
    sentEmails.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ id: `email_${sentEmails.length}` }), { status: 200 });
  };

  const req = createRequest({
    name: 'Alex Morgan',
    email: 'alex.morgan@company.com',
    subject: 'AI Product Analyst Role',
    message: 'Hi Kovid, we loved your GYMTrack platform and would like to schedule an intro call.',
    website: ''
  });

  const res = await handleContactRequest(req, baseEnv, { fetch: mockFetch, rateLimitStore: new Map() });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.deliveredToOwner, true);
  assert.equal(data.confirmationSent, true);
  assert.equal(sentEmails.length, 2);

  // Check primary email to Kovid
  const ownerEmail = sentEmails[0];
  assert.equal(ownerEmail.from, baseEnv.SENDER_EMAIL);
  assert.deepEqual(ownerEmail.to, ['kovidanand05@gmail.com']);
  assert.equal(ownerEmail.reply_to, 'alex.morgan@company.com');
  assert.equal(ownerEmail.subject, '[Portfolio Contact] AI Product Analyst Role');
  assert.match(ownerEmail.text, /Name: Alex Morgan/);
  assert.match(ownerEmail.text, /Email: alex\.morgan@company\.com/);
  assert.match(ownerEmail.text, /Subject: AI Product Analyst Role/);
  assert.match(ownerEmail.text, /Hi Kovid, we loved your GYMTrack platform/);

  // Check confirmation copy to visitor
  const confirmEmail = sentEmails[1];
  assert.equal(confirmEmail.from, baseEnv.SENDER_EMAIL);
  assert.deepEqual(confirmEmail.to, ['alex.morgan@company.com']);
  assert.equal(confirmEmail.reply_to, 'kovidanand05@gmail.com');
  assert.equal(confirmEmail.subject, 'Your message has been received - Kovid Anand');
  assert.match(confirmEmail.text, /Hello Alex Morgan,/);
  assert.match(confirmEmail.text, /Your message has been successfully received\./);
  assert.match(confirmEmail.text, /Copy of your submitted message:/);
  assert.match(confirmEmail.text, /Hi Kovid, we loved your GYMTrack platform/);
});

test('does NOT send confirmation or claim success if primary Resend delivery fails', async () => {
  const sentEmails = [];
  const mockFetch = async (_url, options) => {
    sentEmails.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ message: 'Domain not verified' }), { status: 403 });
  };

  const req = createRequest({
    name: 'Alex Morgan',
    email: 'alex.morgan@company.com',
    subject: 'Opportunity',
    message: 'Reaching out regarding an AI engineering internship opportunity.'
  });

  const res = await handleContactRequest(req, baseEnv, { fetch: mockFetch, rateLimitStore: new Map() });
  const data = await res.json();

  assert.equal(res.status, 502);
  assert.equal(data.success, false);
  assert.equal(sentEmails.length, 1);
});

test('rejects invalid email and empty/short fields with 400 and fieldErrors', async () => {
  let calledFetch = false;
  const mockFetch = async () => {
    calledFetch = true;
    return new Response('{}', { status: 200 });
  };

  const req = createRequest({
    name: '',
    email: 'not-an-email',
    subject: 'A',
    message: 'Too short'
  });

  const res = await handleContactRequest(req, baseEnv, { fetch: mockFetch, rateLimitStore: new Map() });
  const data = await res.json();

  assert.equal(res.status, 400);
  assert.equal(data.success, false);
  assert.ok(data.fieldErrors.name);
  assert.ok(data.fieldErrors.email);
  assert.ok(data.fieldErrors.subject);
  assert.ok(data.fieldErrors.message);
  assert.equal(calledFetch, false);
});

test('honeypot silently drops bot submission without sending email', async () => {
  let calledFetch = false;
  const mockFetch = async () => {
    calledFetch = true;
    return new Response('{}', { status: 200 });
  };

  const req = createRequest({
    name: 'Spam Bot',
    email: 'bot@spam.example',
    subject: 'Buy cheap SEO',
    message: 'Check out this spam link with enough characters.',
    website: 'https://spam.example'
  });

  const res = await handleContactRequest(req, baseEnv, { fetch: mockFetch, rateLimitStore: new Map() });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(calledFetch, false);
});

test('enforces IP rate limiting on repeated submissions', async () => {
  const store = new Map();
  const mockFetch = async () => new Response(JSON.stringify({ id: 'ok' }), { status: 200 });

  const makeValidReq = () =>
    createRequest(
      {
        name: 'Recruiter',
        email: 'recruiter@example.com',
        subject: 'Interview',
        message: 'Testing repeated submissions for rate limit protection.'
      },
      { ip: '198.51.100.7' }
    );

  for (let i = 0; i < 5; i++) {
    const res = await handleContactRequest(makeValidReq(), baseEnv, {
      fetch: mockFetch,
      rateLimitStore: store,
      now: () => 1000000 + i * 1000
    });
    assert.equal(res.status, 200);
  }

  const limitedRes = await handleContactRequest(makeValidReq(), baseEnv, {
    fetch: mockFetch,
    rateLimitStore: store,
    now: () => 1006000
  });
  assert.equal(limitedRes.status, 429);
  assert.ok(limitedRes.headers.get('Retry-After'));
});

test('returns 503 when Resend credentials are not configured', async () => {
  const req = createRequest({
    name: 'Alex Morgan',
    email: 'alex@example.com',
    subject: 'Hello',
    message: 'Testing unconfigured backend fails honestly.'
  });

  const res = await handleContactRequest(req, { ALLOWED_ORIGINS: 'https://kovidanand.github.io' }, { rateLimitStore: new Map() });
  const data = await res.json();

  assert.equal(res.status, 503);
  assert.equal(data.success, false);
});

test('handles OPTIONS preflight CORS and HTML escaping cleanly', async () => {
  const req = createRequest(undefined, { method: 'OPTIONS', origin: 'https://kovidanand.github.io' });
  const res = await handleContactRequest(req, baseEnv, { rateLimitStore: new Map() });

  assert.equal(res.status, 204);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://kovidanand.github.io');
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

  const validated = validatePayload({
    name: 'Jane\r\nBcc: evil@evil.com',
    email: 'JANE@EXAMPLE.COM',
    subject: 'Hello\nWorld',
    message: 'Valid message body over ten chars.'
  });
  assert.equal(validated.valid, true);
  assert.equal(validated.data.name, 'Jane Bcc: evil@evil.com');
  assert.equal(validated.data.email, 'jane@example.com');
  assert.equal(validated.data.subject, 'Hello World');
});
