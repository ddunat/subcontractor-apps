// DC Building Inspectors EU — online booking with location-based pricing.
// Plain Node (no dependencies). Runs on Railway.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { quote, publicQuote } = require('./lib/pricing');
const { getCatalog } = require('./lib/catalog');
const geo = require('./lib/geo');
const token = require('./lib/token');
const ghl = require('./lib/ghl');
const stripe = require('./lib/stripe');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const publicBase = () =>
  process.env.PUBLIC_URL ||
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : `http://localhost:${PORT}`);

// ---------- helpers ----------

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('too_large'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req) {
  try {
    return JSON.parse((await readBody(req)) || '{}');
  } catch {
    return null;
  }
}

// Simple per-IP rate limit: max N requests per minute per bucket.
const hits = new Map();
function limited(req, bucket, max) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 10000) hits.clear();
  return list.length > max;
}

const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const validPhone = (p) => /^[+0-9 ()/-]{6,20}$/.test(p);
const WINDOWS = { morning: 'prijepodne (8–12 h)', afternoon: 'poslijepodne (12–17 h)' };
const eur = (n) => `€${Number(n).toFixed(2).replace('.', ',')}`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, urlPath) {
  const file = urlPath === '/' ? '/index.html' : urlPath;
  const full = path.normalize(path.join(PUBLIC_DIR, file));
  if (!full.startsWith(PUBLIC_DIR)) return send(res, 404, 'Not found');
  fs.readFile(full, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(full)] || 'application/octet-stream',
      'Cache-Control': file === '/index.html' ? 'no-cache' : 'public, max-age=300',
    });
    res.end(data);
  });
}

function serviceName(catalog, id, lang) {
  const s = catalog.services.find((x) => x.id === id);
  return s ? (lang === 'en' ? s.name_en : s.name_hr) : id;
}

// ---------- API handlers ----------

async function apiCatalog(req, res, url) {
  const catalog = await getCatalog();
  const lang = url.searchParams.get('lang') === 'en' ? 'en' : 'hr';
  send(res, 200, {
    // No prices here on purpose: the price appears only once we know the address.
    services: catalog.services.map((s) => ({
      id: s.id,
      group: s.group,
      icon: s.icon,
      name: lang === 'en' ? s.name_en : s.name_hr,
      desc: lang === 'en' ? s.desc_en : s.desc_hr,
      reportRequired: Boolean(s.report_required),
    })),
    depositPct: catalog.settings.deposit_pct,
    calendar: ghl.calendarEnabled,
    payments: stripe.enabled,
    testMode: catalog.source !== 'sheet' || stripe.testMode,
  });
}

async function apiPlaces(req, res, url) {
  if (limited(req, 'places', 90)) return send(res, 429, { error: 'rate_limited' });
  const q = clean(url.searchParams.get('q'), 120);
  if (q.length < 3) return send(res, 200, { places: [] });
  try {
    const places = await geo.search(q);
    const exp = Date.now() + 6 * 3600 * 1000;
    send(res, 200, {
      places: places.map((p) => ({ label: p.label, ref: token.sign({ t: 'place', ...p, exp }) })),
    });
  } catch (err) {
    console.error('[places]', err.message);
    send(res, 502, { error: 'search_unavailable' });
  }
}

async function apiQuote(req, res) {
  if (limited(req, 'quote', 90)) return send(res, 429, { error: 'rate_limited' });
  const body = await readJson(req);
  if (!body) return send(res, 400, { error: 'bad_json' });
  const place = token.verify(body.ref);
  if (!place || place.t !== 'place') return send(res, 400, { error: 'bad_address' });

  const catalog = await getCatalog();
  const report = body.report !== false;
  const q = quote(catalog, {
    serviceId: clean(body.serviceId, 40),
    answers: { report },
    location: { lat: place.lat, lng: place.lng, region: place.region, isIsland: place.isIsland },
  });
  if (!q.ok) return send(res, 400, publicQuote(q));

  const hours = catalog.settings.quote_valid_hours || 24;
  const exp = Date.now() + hours * 3600 * 1000;
  const out = publicQuote(q);
  out.validUntil = new Date(exp).toISOString();
  out.quoteToken = token.sign({
    t: 'quote',
    serviceId: body.serviceId,
    place: { label: place.label, lat: place.lat, lng: place.lng, region: place.region, isIsland: place.isIsland },
    manualQuote: q.manualQuote,
    withReport: q.withReport,
    total: q.total,
    deposit: q.deposit,
    exp,
  });
  send(res, 200, out);
}

async function apiSlots(req, res, url) {
  if (!ghl.calendarEnabled) return send(res, 200, { mode: 'window' });
  const date = url.searchParams.get('date') || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return send(res, 400, { error: 'bad_date' });
  try {
    send(res, 200, { mode: 'slots', slots: await ghl.freeSlots(date) });
  } catch (err) {
    console.error('[slots]', err.message);
    send(res, 200, { mode: 'window' }); // fall back to "preferred day + time of day"
  }
}

function bookingNote(catalog, q, b, extra) {
  const lines = [
    `🌐 ONLINE REZERVACIJA (${b.lang === 'en' ? 'EN' : 'HR'})`,
    `Usluga: ${serviceName(catalog, q.serviceId, 'hr')}`,
    `Adresa: ${q.place.label}`,
    `Regija za cijenu: ${q.region || '-'}${q.place.isIsland ? ' (otok)' : ''}`,
    q.manualQuote ? 'Cijena: RUČNA PONUDA POTREBNA' : `Cijena: ${eur(q.total)} s PDV-om (${q.withReport ? 's pisanim izvješćem' : 'bez pisanog izvješća'})`,
    q.manualQuote ? null : `Polog (${catalog.settings.deposit_pct}%): ${eur(q.deposit)}`,
    b.slot ? `Termin: ${b.slot}` : b.date ? `Željeni dan: ${b.date}, ${WINDOWS[b.window] || '-'}` : null,
    b.notes ? `Napomena klijenta: ${b.notes}` : null,
    b.tracking ? `Izvor: ${b.tracking}` : null,
    extra,
  ];
  return lines.filter(Boolean).join('\n');
}

async function apiBook(req, res) {
  if (limited(req, 'book', 10)) return send(res, 429, { error: 'rate_limited' });
  const raw = await readJson(req);
  if (!raw) return send(res, 400, { error: 'bad_json' });
  const q = token.verify(raw.quoteToken);
  if (!q || q.t !== 'quote') return send(res, 400, { error: 'quote_expired' });

  const b = {
    name: clean(raw.name, 100),
    email: clean(raw.email, 120).toLowerCase(),
    phone: clean(raw.phone, 20),
    notes: clean(raw.notes, 1000),
    slot: clean(raw.slot, 40),
    date: clean(raw.date, 10),
    window: clean(raw.window, 20),
    lang: raw.lang === 'en' ? 'en' : 'hr',
    tracking: clean(raw.tracking, 300),
  };
  if (b.name.length < 2) return send(res, 400, { error: 'name' });
  if (!validEmail(b.email)) return send(res, 400, { error: 'email' });
  if (!validPhone(b.phone)) return send(res, 400, { error: 'phone' });
  if (raw.consent !== true) return send(res, 400, { error: 'consent' });
  if (!q.manualQuote && !b.slot && !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) return send(res, 400, { error: 'date' });

  const catalog = await getCatalog();
  const svc = serviceName(catalog, q.serviceId, 'hr');
  // Region is internal, so it isn't in the token; work it out again for the staff note.
  q.region = quote(catalog, { serviceId: q.serviceId, answers: { report: q.withReport }, location: q.place })._internal?.region;

  // Re-check the slot is still free right before taking the deposit.
  if (b.slot && ghl.calendarEnabled) {
    try {
      const free = await ghl.freeSlots(b.slot.slice(0, 10));
      if (!free.includes(b.slot)) return send(res, 409, { error: 'slot_taken' });
    } catch (err) {
      console.error('[book] slot re-check failed', err.message);
    }
  }

  let contactId = null;
  let opportunityId = null;
  const tags = ['web-booking', `usluga-${q.serviceId}`, q.manualQuote ? 'zahtjev-ponuda' : 'web-booking-started'];
  if (ghl.enabled) {
    try {
      contactId = await ghl.upsertContact({ name: b.name, email: b.email, phone: b.phone, address: q.place.label, tags });
      opportunityId = await ghl.createOpportunity({
        contactId,
        name: `${svc} – ${q.place.label}`.slice(0, 200),
        value: q.manualQuote ? 0 : q.total,
      });
      await ghl.addNote(contactId, bookingNote(catalog, q, b));
    } catch (err) {
      console.error('[book] GHL', err.message);
    }
  } else {
    console.log('[book] GHL not configured. Booking:\n' + bookingNote(catalog, q, b));
  }

  if (q.manualQuote || !stripe.enabled) {
    return send(res, 200, { ok: true, mode: q.manualQuote ? 'quote' : 'request' });
  }

  try {
    const base = publicBase();
    const session = await stripe.createCheckout({
      amountCents: Math.round(q.deposit * 100),
      productName: `Polog ${catalog.settings.deposit_pct}% – ${svc}`,
      description: `${q.place.label}. Ukupna cijena ${eur(q.total)} s PDV-om; ostatak se plaća nakon usluge.`,
      email: b.email,
      locale: b.lang,
      successUrl: `${base}/?status=paid&lang=${b.lang}`,
      cancelUrl: `${base}/?status=cancelled&lang=${b.lang}`,
      metadata: {
        contactId: contactId || '',
        opportunityId: opportunityId || '',
        serviceId: q.serviceId,
        service: svc.slice(0, 200),
        address: q.place.label.slice(0, 400),
        slot: b.slot,
        date: b.date,
        window: b.window,
        total: String(q.total),
        deposit: String(q.deposit),
        name: b.name,
      },
    });
    send(res, 200, { ok: true, mode: 'pay', redirect: session.url });
  } catch (err) {
    console.error('[book] Stripe', err.message);
    send(res, 502, { error: 'payment_unavailable' });
  }
}

const processed = new Set();
async function stripeWebhook(req, res) {
  let rawBody;
  try {
    rawBody = await readBody(req, 200000);
  } catch {
    return send(res, 413, 'too large');
  }
  const event = stripe.verifyWebhook(rawBody, req.headers['stripe-signature']);
  if (!event) return send(res, 400, 'bad signature');
  send(res, 200, { received: true });

  if (event.type !== 'checkout.session.completed') return;
  const s = event.data.object;
  if (s.payment_status !== 'paid' || processed.has(s.id)) return;
  processed.add(s.id);
  const m = s.metadata || {};
  console.log(`[webhook] deposit paid ${s.amount_total / 100} EUR for ${m.name} (${m.service})`);
  if (!ghl.enabled || !m.contactId) return;
  try {
    await ghl.addTags(m.contactId, ['polog-placen']);
    await ghl.markOpportunityPaid(m.opportunityId);
    let apptMsg = '';
    if (m.slot && ghl.calendarEnabled) {
      try {
        await ghl.createAppointment({
          contactId: m.contactId,
          startTime: m.slot,
          title: `${m.service} – ${m.name}`,
          address: m.address,
        });
        apptMsg = `Termin upisan u kalendar: ${m.slot}`;
      } catch (err) {
        apptMsg = `⚠️ Termin NIJE upisan automatski (${m.slot}) – upišite ručno.`;
        console.error('[webhook] appointment', err.message);
      }
    }
    await ghl.addNote(
      m.contactId,
      [`✅ POLOG PLAĆEN: ${eur(s.amount_total / 100)} (Stripe ${s.payment_intent})`, `Ukupno s PDV-om: ${eur(m.total)}`, apptMsg]
        .filter(Boolean)
        .join('\n')
    );
  } catch (err) {
    console.error('[webhook] GHL', err.message);
  }
}

async function apiStatus(req, res) {
  const catalog = await getCatalog();
  send(res, 200, {
    prices: catalog.source,
    crm: ghl.enabled,
    calendar: ghl.calendarEnabled,
    payments: stripe.enabled ? (stripe.testMode ? 'test' : 'live') : false,
    webhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    stableTokens: Boolean(process.env.QUOTE_SECRET),
  });
}

// ---------- router ----------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (req.method === 'GET' && p === '/health') return send(res, 200, 'ok');
    if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && p === '/api/status') return apiStatus(req, res);
    if (req.method === 'GET' && p === '/api/catalog') return apiCatalog(req, res, url);
    if (req.method === 'GET' && p === '/api/places') return apiPlaces(req, res, url);
    if (req.method === 'POST' && p === '/api/quote') return apiQuote(req, res);
    if (req.method === 'GET' && p === '/api/slots') return apiSlots(req, res, url);
    if (req.method === 'POST' && p === '/api/book') return apiBook(req, res);
    if (req.method === 'POST' && p === '/api/stripe/webhook') return stripeWebhook(req, res);
    if (req.method === 'GET') return serveStatic(req, res, p);
    send(res, 405, 'Method not allowed');
  } catch (err) {
    console.error('[server]', err);
    if (!res.headersSent) send(res, 500, { error: 'server_error' });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`booking-hr listening on ${PORT}`);
    console.log(`  CRM: ${ghl.enabled}  calendar: ${ghl.calendarEnabled}  payments: ${stripe.enabled}`);
  });
}

module.exports = { server, bookingNote };
