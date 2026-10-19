// Address search for Croatia using Photon (OpenStreetMap data, free, built
// for search-as-you-type). No API key needed.
const { norm } = require('./pricing');
const islands = require('../data/islands.json');

const PHOTON_URL = process.env.PHOTON_URL || 'https://photon.komoot.io/api/';
const UA = 'DC-Building-Inspectors-booking/1.0 (david@dcinspect.eu)';
const CROATIA_BBOX = '13.2,42.3,19.5,46.6';

const placeSet = new Set(islands.places.map(norm));
const coastal = islands.coastal_counties.map(norm);

function regionText(p) {
  return [p.state, p.county, p.city, p.district].filter(Boolean).join(', ');
}

function isIsland(p) {
  const region = norm(`${p.state || ''} ${p.county || ''}`);
  if (!coastal.some((c) => region.includes(c))) return false;
  return [p.city, p.name, p.district, p.locality, p.town, p.village]
    .filter(Boolean)
    .some((v) => placeSet.has(norm(v)));
}

function label(p) {
  const street = [p.street || (p.type === 'house' ? p.name : ''), p.housenumber].filter(Boolean).join(' ');
  const first = street || p.name;
  const place = [p.postcode, p.city || p.town || p.village || p.locality].filter(Boolean).join(' ');
  return [first, place !== first ? place : null].filter(Boolean).join(', ');
}

// Turn a Photon feature into what the pricing engine needs.
function toPlace(feature) {
  const p = feature.properties || {};
  const [lng, lat] = feature.geometry?.coordinates || [];
  return {
    label: label(p),
    lat,
    lng,
    region: regionText(p),
    isIsland: isIsland(p),
  };
}

const cache = new Map();

async function search(q) {
  const key = norm(q);
  if (cache.has(key)) return cache.get(key);
  const url = `${PHOTON_URL}?q=${encodeURIComponent(q)}&limit=8&bbox=${CROATIA_BBOX}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`photon ${res.status}`);
  const data = await res.json();
  const seen = new Set();
  const places = (data.features || [])
    .filter((f) => (f.properties?.countrycode || '').toUpperCase() === 'HR')
    .map(toPlace)
    .filter((p) => Number.isFinite(p.lat) && p.label && !seen.has(p.label) && seen.add(p.label))
    .slice(0, 6);
  if (cache.size > 2000) cache.clear();
  cache.set(key, places);
  return places;
}

module.exports = { search, toPlace, isIsland, regionText };
