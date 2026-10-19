// Loads prices from the Google Sheet (tabs: settings, services, zones, bands).
// Falls back to data/catalog.default.json if the sheet isn't set or fails.
// The sheet is re-read at most every 5 minutes.
const fallback = require('../data/catalog.default.json');
const { toNumber } = require('./pricing');

const SHEET_ID = process.env.PRICING_SHEET_ID;
const TTL_MS = 5 * 60 * 1000;

let current = { ...fallback, source: 'default' };
let loadedAt = 0;

// Minimal CSV parser (handles quotes, commas and newlines inside quotes).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

function toObjects(rows) {
  const [head, ...rest] = rows;
  const keys = head.map((h) => h.trim().toLowerCase());
  return rest.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

const yes = (v) => /^(1|true|da|yes|x)$/i.test(String(v).trim());

async function fetchTab(name) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`sheet tab ${name}: ${res.status}`);
  return toObjects(parseCsv(await res.text()));
}

function buildCatalog({ settings, services, zones, bands }) {
  const s = {};
  for (const r of settings) {
    if (!r.key) continue;
    const n = toNumber(r.value, NaN);
    s[r.key] = Number.isFinite(n) && !/^[a-z]/i.test(r.value) ? n : r.value;
  }
  const cat = {
    settings: { ...fallback.settings, ...s },
    services: services
      .filter((r) => r.id && (r.active === '' || r.active === undefined || yes(r.active)))
      .map((r) => ({
        id: r.id,
        group: r.group || 'curenje',
        icon: r.icon || '',
        price_adj: toNumber(r.price_adj, 0),
        report_required: yes(r.report_required),
        name_hr: r.name_hr,
        name_en: r.name_en || r.name_hr,
        desc_hr: r.desc_hr || '',
        desc_en: r.desc_en || r.desc_hr || '',
      })),
    zones: zones
      .filter((r) => r.match)
      .map((r) => ({ match: r.match, name: r.name || r.match, price_ex_vat: r.price_ex_vat === '' ? null : toNumber(r.price_ex_vat, null) })),
    bands: bands
      .map((r) => ({ max_km: toNumber(r.max_km, NaN), price_ex_vat: toNumber(r.price_ex_vat, NaN) }))
      .filter((b) => Number.isFinite(b.max_km) && Number.isFinite(b.price_ex_vat)),
  };
  if (!cat.services.length) throw new Error('sheet has no services');
  return cat;
}

async function getCatalog() {
  if (!SHEET_ID || Date.now() - loadedAt < TTL_MS) return current;
  loadedAt = Date.now(); // also throttles retries when the sheet fails
  try {
    const [settings, services, zones, bands] = await Promise.all(
      ['settings', 'services', 'zones', 'bands'].map(fetchTab)
    );
    current = { ...buildCatalog({ settings, services, zones, bands }), source: 'sheet' };
  } catch (err) {
    console.error('[catalog] sheet load failed, keeping previous prices:', err.message);
  }
  return current;
}

module.exports = { getCatalog, parseCsv, toObjects, buildCatalog };
