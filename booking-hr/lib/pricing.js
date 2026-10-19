// Pricing engine. Pure functions only, so it can be unit tested.
//
// Price = region price (by county, or by distance from the base when the
// county isn't listed) + service adjustment + written report, then PDV.
// The browser only ever receives the final price: region, distance and
// island handling stay on the server.

const DEFAULT_SETTINGS = {
  base_name: 'Zagreb',
  base_lat: 45.815,
  base_lng: 15.9819,
  road_factor: 1.3, // straight-line km -> approximate road km
  vat_pct: 25,
  report_add_ex_vat: 60,
  island_mode: 'quote', // 'quote' = ask for a manual quote, 'add' = add island_add_ex_vat
  island_add_ex_vat: 0,
  deposit_pct: 10,
  round_to: 5,
  quote_valid_hours: 24,
  currency: 'EUR',
};

function toNumber(v, fallback) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(String(v).replace(',', '.').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

// Lowercase and strip Croatian diacritics so "Splitsko-dalmatinska županija"
// matches "splitsko-dalmatinska".
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function roadKm(settings, lat, lng) {
  return haversineKm(settings.base_lat, settings.base_lng, lat, lng) * settings.road_factor;
}

// zones: [{ match: 'splitsko-dalmatinska', name, price_ex_vat }]. A blank
// price means "always quote manually" for that region.
function findZone(zones, regionText) {
  const hay = norm(regionText);
  if (!hay) return null;
  return zones.find((z) => z.match && hay.includes(norm(z.match))) || null;
}

// bands: [{ max_km, price_ex_vat }]. Returns null past the last band.
function bandPrice(bands, km) {
  const sorted = [...bands].sort((a, b) => a.max_km - b.max_km);
  for (const b of sorted) if (km <= b.max_km) return b.price_ex_vat;
  return null;
}

function roundUp(value, step) {
  if (!step || step <= 0) return Math.round(value * 100) / 100;
  // Round to cents first so float noise (275.0000001) doesn't jump to 280.
  const cents = Math.round(value * 100) / 100;
  return Math.ceil(cents / step - 1e-9) * step;
}

// location: { lat, lng, region, isIsland }
//   region: free text holding county/state/city from the geocoder.
// answers: { report: boolean }
function quote(catalog, { serviceId, answers = {}, location }) {
  const s = { ...DEFAULT_SETTINGS, ...catalog.settings };
  const service = catalog.services.find((x) => x.id === serviceId && x.active !== false);
  if (!service) return { ok: false, error: 'unknown_service' };
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
    return { ok: false, error: 'no_location' };
  }
  const manual = (reason) => ({ ok: true, manualQuote: true, _internal: { reason } });

  if (location.isIsland && s.island_mode === 'quote') return manual('island');

  const km = roadKm(s, location.lat, location.lng);
  const zone = findZone(catalog.zones || [], location.region);
  let regionPrice;
  let regionName;
  if (zone) {
    if (zone.price_ex_vat === null || zone.price_ex_vat === undefined) return manual('zone_quote');
    regionPrice = zone.price_ex_vat;
    regionName = zone.name;
  } else {
    regionPrice = bandPrice(catalog.bands || [], km);
    if (regionPrice === null) return manual('too_far');
    regionName = `band<=${Math.round(km)}km`;
  }

  const withReport = service.report_required ? true : answers.report !== false && answers.report !== 'false';
  const island = location.isIsland ? s.island_add_ex_vat : 0;
  const net = regionPrice + (service.price_adj || 0) + (withReport ? s.report_add_ex_vat : 0) + island;
  const total = roundUp(net * (1 + s.vat_pct / 100), s.round_to);
  const deposit = Math.round(total * s.deposit_pct) / 100;

  return {
    ok: true,
    manualQuote: false,
    total,
    deposit,
    depositPct: s.deposit_pct,
    vatPct: s.vat_pct,
    withReport,
    currency: s.currency,
    // Internal only. Stripped before anything goes to the browser.
    _internal: { km: Math.round(km), region: regionName, regionPrice, net },
  };
}

// What the browser is allowed to see.
function publicQuote(q) {
  if (!q.ok) return { ok: false, error: q.error };
  if (q.manualQuote) return { ok: true, manualQuote: true };
  const { _internal, ...rest } = q;
  return rest;
}

module.exports = {
  DEFAULT_SETTINGS,
  norm,
  haversineKm,
  roadKm,
  findZone,
  bandPrice,
  roundUp,
  quote,
  publicQuote,
  toNumber,
};
