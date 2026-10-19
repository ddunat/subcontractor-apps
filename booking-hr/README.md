# DC Building Inspectors EU – online booking (Croatia)

A booking form for the Croatian business. The customer picks a service, types the
property address, sees **one final price including 25% PDV**, picks a time, and pays a
**10% deposit** by card. The booking lands in GoHighLevel (HR location) with all
details. Runs on Railway, embedded on the GoDaddy website.

## How the price is worked out

```
price = region price (ex PDV) + service adjustment + written report (€60) → + 25% PDV → round up to €5
deposit = 10% of that
```

* **Region price** comes from the county (županija) of the address. Agreed prices, ex PDV:
  Zagreb 220, Rijeka (Primorsko-goranska) 320, Istra 420, Zadar 420, Split 520.
* **Counties not listed** use distance bands from Zagreb (road km ≈ straight-line × 1.3).
* **Islands** reached by ferry, and **Dubrovnik**, go to "we'll send a personal quote" by default.
* The customer only ever sees the final price. The region, distance and band never
  reach the browser, so there is no visible travel charge.
* Prices are locked for 24 hours by a signed token, so they can't be edited in the browser.

| Region | Without report | With report |
|---|---|---|
| Zagreb | €275 | €350 |
| Rijeka | €400 | €475 |
| Istra / Zadar | €525 | €600 |
| Split | €650 | €725 |

## Editing prices (Google Sheet)

Until a sheet is connected the app uses `data/catalog.default.json`. To edit prices
without code, create a Google Sheet with four tabs (names exactly as below), share it
as **"Anyone with the link – Viewer"**, and set `PRICING_SHEET_ID` on Railway to the long
ID in the sheet's URL. Changes show up within 5 minutes.

The link is not published anywhere, but anyone who has it can read the sheet, region
prices included. Don't post it publicly.

**settings** – `key`, `value`

| key | example | meaning |
|---|---|---|
| vat_pct | 25 | PDV % |
| report_add_ex_vat | 60 | written report, ex PDV |
| deposit_pct | 10 | deposit % |
| island_mode | quote | `quote` = manual quote, `add` = add `island_add_ex_vat` |
| island_add_ex_vat | 0 | island surcharge when `island_mode` is `add` |
| round_to | 5 | round final price up to this |
| base_lat / base_lng | 45.815 / 15.9819 | distance bands are measured from here (Zagreb) |
| road_factor | 1.3 | straight-line km × this ≈ road km |
| quote_valid_hours | 24 | how long a price is guaranteed |

**services** – `id`, `name_hr`, `name_en`, `desc_hr`, `desc_en`, `group` (`curenje` / `vlaga` / `pregled`), `icon`, `price_adj` (± € ex PDV), `report_required` (da/ne), `active` (da/ne)

**zones** – `match` (part of the county name, no diacritics, e.g. `splitsko-dalmatinska`), `name`, `price_ex_vat` (blank = always manual quote)

**bands** – `max_km`, `price_ex_vat` (past the last band = manual quote)

## Railway variables

| Variable | Needed for | Where to get it |
|---|---|---|
| `QUOTE_SECRET` | price tokens survive restarts | any long random string (already set) |
| `GHL_API_KEY` | bookings into the CRM | GoHighLevel → HR sub-account → Settings → Private Integrations → new token with scopes: contacts.write, contacts.readonly, opportunities.write, calendars.readonly, calendars/events.write |
| `GHL_LOCATION_ID` | CRM | `fSPTLOI7MAzy9VUHFa2k` (already set) |
| `GHL_CALENDAR_ID` | live free times + auto appointments | the shared calendar synced to david@dcinspect.eu (Calendars → settings → ID) |
| `GHL_PIPELINE_ID`, `GHL_STAGE_NEW_ID`, `GHL_STAGE_PAID_ID` | opportunity in the pipeline | Opportunities → pipeline settings |
| `STRIPE_SECRET_KEY` | 10% deposit by card | Stripe (EU account) → Developers → API keys. Use `sk_test_…` first. |
| `STRIPE_WEBHOOK_SECRET` | marking the deposit as paid | Stripe → Developers → Webhooks → add endpoint `https://<domain>/api/stripe/webhook`, event `checkout.session.completed` |
| `PRICING_SHEET_ID` | editing prices in Google Sheets | see above |

Every integration is optional. Without GoHighLevel the booking is written to the
Railway log. Without Stripe the form sends a request without payment. Without a calendar
the customer picks a day and morning/afternoon. `GET /api/status` shows what is switched on.

## What lands in GoHighLevel

* Contact (upserted by email/phone) with tags `web-booking`, `usluga-<service>`, and
  `web-booking-started` (or `zahtjev-ponuda` for manual quotes).
* An opportunity named "Service – address" with the full price as its value.
* A note with service, address, region, price, deposit, chosen time, the customer's
  description and where they came from (page and referrer).
* When the deposit is paid: tag `polog-placen`, opportunity moved to the paid stage,
  the appointment added to the calendar, and a note with the Stripe payment ID.

**Tip:** a GoHighLevel workflow on tag `web-booking-started` that waits 30 minutes and
then texts anyone without `polog-placen` gets back people who dropped out at payment.

## Putting it on the GoDaddy website

GoDaddy Website Builder → edit page → **Add section → HTML** → paste:

```html
<div id="dc-booking"></div>
<script src="https://<railway-domain>/embed.js" defer></script>
```

Add `data-lang="en"` to the div for an English page. Stripe's payment page can't open
inside a frame, so the form opens it full-window. If a browser blocks that, a
"Continue" link appears.

## Fiskalizacija

The deposit is taken by card through Stripe. The full invoice is issued as now, once the
whole service is paid. **Check with your accountant** whether a received deposit
(predujam) needs its own fiscalised receipt or advance invoice. That's outside this app.

## Run locally

```
node server.js     # http://localhost:3000
npm test
```

No dependencies. Node 20+.
