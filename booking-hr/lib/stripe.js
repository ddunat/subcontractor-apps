// Stripe Checkout over plain HTTPS (no SDK needed).
const crypto = require('node:crypto');

const KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const enabled = Boolean(KEY);
const testMode = Boolean(KEY && KEY.startsWith('sk_test_'));

// Flattens { a: { b: 1 } } into a=..&a[b]=1 form encoding Stripe expects.
function form(obj, prefix, out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return out.join('&');
}

async function createCheckout({ amountCents, productName, description, email, metadata, successUrl, cancelUrl, locale }) {
  const body = form({
    mode: 'payment',
    locale: locale === 'en' ? 'en' : 'hr',
    customer_email: email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: {
      0: {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: amountCents,
          product_data: { name: productName, description },
        },
      },
    },
    metadata,
    payment_intent_data: { metadata, description: productName },
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
  });
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${data.error?.message}`);
  return data;
}

// Checks the Stripe-Signature header. Returns the parsed event or null.
function verifyWebhook(rawBody, header, toleranceSec = 300) {
  if (!WEBHOOK_SECRET || !header) return null;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    })
  );
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = Number(parts.t);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return null;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(`${t}.${rawBody}`).digest('hex');
  const ok = sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
  if (!ok) return null;
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

module.exports = { enabled, testMode, createCheckout, verifyWebhook, form };
