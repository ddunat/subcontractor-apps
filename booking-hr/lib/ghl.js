// GoHighLevel (LeadConnector API v2) for the Croatian location.
const BASE = 'https://services.leadconnectorhq.com';
const KEY = process.env.GHL_API_KEY;
const LOCATION = process.env.GHL_LOCATION_ID;
const CALENDAR = process.env.GHL_CALENDAR_ID;
const PIPELINE = process.env.GHL_PIPELINE_ID;
const STAGE_NEW = process.env.GHL_STAGE_NEW_ID;
const STAGE_PAID = process.env.GHL_STAGE_PAID_ID;
const TZ = 'Europe/Zagreb';

const enabled = Boolean(KEY && LOCATION);
const calendarEnabled = Boolean(enabled && CALENDAR);

async function call(method, path, body, version = '2021-07-28') {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      Version: version,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GHL ${method} ${path} ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

function splitName(full) {
  const parts = String(full).trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

async function upsertContact({ name, email, phone, address, tags, source }) {
  const data = await call('POST', '/contacts/upsert', {
    locationId: LOCATION,
    ...splitName(name),
    name,
    email,
    phone,
    address1: address,
    country: 'HR',
    timezone: TZ,
    source: source || 'Web booking',
    tags,
  });
  return data.contact?.id;
}

async function addTags(contactId, tags) {
  return call('POST', `/contacts/${contactId}/tags`, { tags });
}

async function addNote(contactId, body) {
  return call('POST', `/contacts/${contactId}/notes`, { body });
}

async function createOpportunity({ contactId, name, value }) {
  if (!PIPELINE || !STAGE_NEW) return null;
  const data = await call('POST', '/opportunities/', {
    locationId: LOCATION,
    pipelineId: PIPELINE,
    pipelineStageId: STAGE_NEW,
    status: 'open',
    contactId,
    name,
    monetaryValue: value,
    source: 'Web booking',
  });
  return data.opportunity?.id || null;
}

async function markOpportunityPaid(opportunityId) {
  if (!opportunityId || !STAGE_PAID) return;
  await call('PUT', `/opportunities/${opportunityId}`, { pipelineStageId: STAGE_PAID, status: 'open' });
}

// Returns ISO start times for one day, e.g. ["2026-10-21T09:00:00+02:00", ...]
async function freeSlots(dateStr) {
  const start = new Date(`${dateStr}T00:00:00Z`).getTime();
  const end = start + 24 * 3600 * 1000 - 1;
  const data = await call(
    'GET',
    `/calendars/${CALENDAR}/free-slots?startDate=${start}&endDate=${end}&timezone=${encodeURIComponent(TZ)}`,
    null,
    '2021-04-15'
  );
  return data[dateStr]?.slots || [];
}

async function createAppointment({ contactId, startTime, title, address }) {
  return call(
    'POST',
    '/calendars/events/appointments',
    {
      calendarId: CALENDAR,
      locationId: LOCATION,
      contactId,
      startTime,
      title,
      address,
      appointmentStatus: 'confirmed',
    },
    '2021-04-15'
  );
}

module.exports = {
  enabled,
  calendarEnabled,
  upsertContact,
  addTags,
  addNote,
  createOpportunity,
  markOpportunityPaid,
  freeSlots,
  createAppointment,
};
