const test = require('node:test');
const assert = require('node:assert');
const catalog = require('../data/catalog.default.json');
const { quote, publicQuote, bandPrice, roundUp, findZone } = require('../lib/pricing');
const { isIsland, toPlace } = require('../lib/geo');
const { parseCsv, toObjects, buildCatalog } = require('../lib/catalog');
const token = require('../lib/token');

const ZAGREB = { lat: 45.8, lng: 15.97, region: 'Grad Zagreb, Zagreb', isIsland: false };
const RIJEKA = { lat: 45.327, lng: 14.442, region: 'Primorsko-goranska županija, Rijeka', isIsland: false };
const PULA = { lat: 44.866, lng: 13.85, region: 'Istarska županija, Pula', isIsland: false };
const ZADAR = { lat: 44.119, lng: 15.231, region: 'Zadarska županija, Zadar', isIsland: false };
const SPLIT = { lat: 43.508, lng: 16.44, region: 'Splitsko-dalmatinska županija, Split', isIsland: false };

const q = (location, report = true, serviceId = 'balkon') => quote(catalog, { serviceId, answers: { report }, location });

test("David's regional prices, ex PDV, become the right prices incl. 25% PDV", () => {
  // [location, without report, with report]  (ex PDV: 220/280, 320/380, 420/480, 420/480, 520/580)
  const cases = [
    [ZAGREB, 275, 350],
    [RIJEKA, 400, 475],
    [PULA, 525, 600],
    [ZADAR, 525, 600],
    [SPLIT, 650, 725],
  ];
  for (const [loc, without, withR] of cases) {
    assert.strictEqual(q(loc, false).total, without, `${loc.region} without report`);
    assert.strictEqual(q(loc, true).total, withR, `${loc.region} with report`);
  }
});

test('deposit is 10% of the total incl. PDV', () => {
  const r = q(ZAGREB, true);
  assert.strictEqual(r.deposit, 35);
  assert.strictEqual(q(RIJEKA, true).deposit, 47.5);
});

test('pre-purchase inspection always includes the report', () => {
  assert.strictEqual(q(ZAGREB, false, 'kupnja').total, 350);
});

test('county not listed falls back to distance bands from Zagreb', () => {
  const karlovac = { lat: 45.487, lng: 15.548, region: 'Karlovačka županija, Karlovac', isIsland: false };
  const r = q(karlovac, false);
  assert.ok(!r.manualQuote);
  assert.strictEqual(r._internal.region.startsWith('band'), true);
  assert.strictEqual(r.total, 340); // ~64 km by road -> 120 km band (270) + PDV
});

test('islands and Dubrovnik go to manual quote by default', () => {
  assert.strictEqual(q({ ...SPLIT, isIsland: true }).manualQuote, true);
  const dbk = { lat: 42.65, lng: 18.09, region: 'Dubrovačko-neretvanska županija, Dubrovnik', isIsland: false };
  assert.strictEqual(q(dbk).manualQuote, true);
});

test('too far with no zone -> manual quote', () => {
  const far = { lat: 42.4, lng: 19.3, region: 'Somewhere', isIsland: false };
  assert.strictEqual(q(far).manualQuote, true);
});

test('the browser never sees region, distance or base price', () => {
  const pub = publicQuote(q(SPLIT));
  assert.strictEqual(pub._internal, undefined);
  assert.deepStrictEqual(Object.keys(pub).sort(), ['currency', 'deposit', 'depositPct', 'manualQuote', 'ok', 'total', 'vatPct', 'withReport'].sort());
  const manual = publicQuote(q({ ...SPLIT, isIsland: true }));
  assert.deepStrictEqual(manual, { ok: true, manualQuote: true });
});

test('unknown service and missing location are rejected', () => {
  assert.strictEqual(q(ZAGREB, true, 'nope').ok, false);
  assert.strictEqual(quote(catalog, { serviceId: 'balkon', location: null }).ok, false);
});

test('helpers', () => {
  assert.strictEqual(roundUp(275.0000001, 5), 275);
  assert.strictEqual(roundUp(276, 5), 280);
  assert.strictEqual(bandPrice([{ max_km: 10, price_ex_vat: 1 }], 11), null);
  assert.strictEqual(findZone(catalog.zones, 'SPLITSKO-DALMATINSKA ŽUPANIJA').name, 'Split');
});

test('island detection needs a coastal county', () => {
  assert.strictEqual(isIsland({ city: 'Stari Grad', state: 'Splitsko-dalmatinska županija' }), true);
  assert.strictEqual(isIsland({ city: 'Blato', state: 'Dubrovačko-neretvanska županija' }), true);
  // Blato is also a neighbourhood of Zagreb: must NOT count as an island.
  assert.strictEqual(isIsland({ district: 'Blato', city: 'Zagreb', state: 'Grad Zagreb' }), false);
  assert.strictEqual(isIsland({ city: 'Split', state: 'Splitsko-dalmatinska županija' }), false);
});

test('Photon feature -> place', () => {
  const p = toPlace({
    geometry: { coordinates: [16.44, 43.508] },
    properties: { street: 'Ulica Kralja Zvonimira', housenumber: '5', postcode: '21000', city: 'Split', state: 'Splitsko-dalmatinska županija', countrycode: 'HR' },
  });
  assert.strictEqual(p.label, 'Ulica Kralja Zvonimira 5, 21000 Split');
  assert.strictEqual(p.lat, 43.508);
  assert.match(p.region, /Splitsko/);
});

test('signed tokens cannot be edited', () => {
  const tok = token.sign({ total: 350, exp: Date.now() + 10000 });
  assert.strictEqual(token.verify(tok).total, 350);
  const [body, mac] = tok.split('.');
  const forged = Buffer.from(JSON.stringify({ total: 1, exp: Date.now() + 10000 })).toString('base64url');
  assert.strictEqual(token.verify(`${forged}.${mac}`), null);
  assert.strictEqual(token.verify(token.sign({ exp: Date.now() - 1 })), null);
  assert.ok(body);
});

test('Google Sheet CSV is parsed into a catalog', () => {
  const tab = (csv) => toObjects(parseCsv(csv));
  const cat = buildCatalog({
    settings: tab('key,value\nvat_pct,25\nisland_mode,add\nisland_add_ex_vat,50\n'),
    services: tab('id,name_hr,name_en,group,icon,price_adj,report_required,active\nbalkon,"Curenje – balkon, terasa",Leak,curenje,🏢,0,,da\nold,Stara,Old,curenje,,0,,ne\n'),
    zones: tab('match,name,price_ex_vat\ngrad zagreb,Zagreb,220\ndubrovacko,Dubrovnik,\n'),
    bands: tab('max_km,price_ex_vat\n60,220\n120,270\n'),
  });
  assert.strictEqual(cat.services.length, 1);
  assert.strictEqual(cat.services[0].name_hr, 'Curenje – balkon, terasa');
  assert.strictEqual(cat.settings.island_mode, 'add');
  assert.strictEqual(cat.settings.island_add_ex_vat, 50);
  assert.strictEqual(cat.zones[1].price_ex_vat, null);
  // Islands priced automatically when the sheet says so: 220 + 60 + 50 = 330 * 1.25 = 412.5 -> 415
  const r = quote(cat, { serviceId: 'balkon', answers: { report: true }, location: { ...ZAGREB, isIsland: true } });
  assert.strictEqual(r.total, 415);
});
