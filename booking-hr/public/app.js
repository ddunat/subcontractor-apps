(() => {
  'use strict';

  const T = {
    hr: {
      eyebrow: 'DC Building Inspectors',
      title: 'Rezervirajte pregled online',
      testBanner: 'Testni način rada – cijene i plaćanje još nisu konačni.',
      s1: 'Što trebate pregledati?',
      s2: 'Gdje se nalazi nekretnina?',
      s3: 'Odaberite termin',
      s4: 'Vaši podaci',
      groups: { curenje: 'Detekcija curenja', vlaga: 'Vlaga i plijesan', pregled: 'Pregledi nekretnina' },
      addressLabel: 'Adresa nekretnine',
      addressPh: 'Počnite upisivati ulicu i mjesto…',
      addressHint: 'Odaberite adresu s popisa da vidite cijenu.',
      noResults: 'Nema rezultata – pokušajte s ulicom i mjestom.',
      searchDown: 'Pretraga adresa trenutno ne radi. Pokušajte ponovno za minutu.',
      reportLegend: 'Pisano izvješće',
      reportYes: 'Da, želim pisano izvješće s fotografijama i preporukama',
      reportNo: 'Ne, dovoljan mi je usmeni nalaz na licu mjesta',
      yourPrice: 'Vaša cijena',
      inclVat: 'PDV uključen',
      depositToday: 'Polog danas:',
      restAfter: 'Ostatak plaćate nakon obavljene usluge.',
      validUntil: (d) => `Cijena zajamčena do ${d}`,
      manualTitle: 'Za ovu lokaciju šaljemo osobnu ponudu',
      manualText: 'Ostavite podatke i javit ćemo vam se s cijenom i terminom, najkasnije sljedeći radni dan.',
      back: 'Natrag',
      continue: 'Nastavi',
      morning: 'Prijepodne', morningSub: '8–12 h',
      afternoon: 'Poslijepodne', afternoonSub: '12–17 h',
      pickTime: 'Odaberite vrijeme',
      noSlots: 'Nema slobodnih termina taj dan – odaberite drugi dan.',
      loading: 'Učitavanje…',
      name: 'Ime i prezime',
      email: 'E-mail',
      phone: 'Mobitel',
      notes: 'Opišite problem (neobavezno)',
      notesPh: 'Npr. mrlja na stropu ispod balkona, pojavila se nakon kiše…',
      consent: 'Slažem se da DC Building Inspectors obrađuje moje podatke radi dogovora i izvršenja usluge.',
      pay: (a) => `Plati polog ${a} i rezerviraj`,
      sendRequest: 'Pošalji zahtjev',
      secure: '🔒 Sigurno plaćanje karticom preko Stripea',
      sumService: 'Usluga', sumAddress: 'Adresa', sumWhen: 'Termin', sumPrice: 'Cijena', sumDeposit: 'Polog danas',
      withReport: 's pisanim izvješćem', withoutReport: 'bez pisanog izvješća',
      errors: {
        name: 'Upišite ime i prezime.', email: 'Provjerite e-mail adresu.', phone: 'Provjerite broj mobitela.',
        consent: 'Potrebna je vaša suglasnost za obradu podataka.', quote_expired: 'Ponuda je istekla – molimo krenite ispočetka.',
        slot_taken: 'Taj termin je upravo zauzet – odaberite drugi.', date: 'Odaberite termin.',
        rate_limited: 'Previše pokušaja – pričekajte minutu.', generic: 'Nešto nije u redu. Pokušajte ponovno ili nas nazovite.',
      },
      paidTitle: 'Rezervacija potvrđena!',
      paidText: 'Polog je plaćen. Poslat ćemo vam potvrdu e-mailom i SMS-om s detaljima termina.',
      requestTitle: 'Zahtjev zaprimljen!',
      requestText: 'Javit ćemo vam se uskoro da potvrdimo termin.',
      quoteTitle: 'Hvala!',
      quoteText: 'Pripremamo vašu osobnu ponudu i javit ćemo se najkasnije sljedeći radni dan.',
      cancelledTitle: 'Plaćanje nije dovršeno',
      cancelledText: 'Termin nije rezerviran. Možete pokušati ponovno – cijena vrijedi 24 sata.',
      restart: 'Nova rezervacija',
    },
    en: {
      eyebrow: 'DC Building Inspectors',
      title: 'Book an inspection online',
      testBanner: 'Test mode – prices and payments are not final yet.',
      s1: 'What do you need inspected?',
      s2: 'Where is the property?',
      s3: 'Choose a time',
      s4: 'Your details',
      groups: { curenje: 'Leak detection', vlaga: 'Damp & mould', pregled: 'Property inspections' },
      addressLabel: 'Property address',
      addressPh: 'Start typing the street and town…',
      addressHint: 'Pick the address from the list to see your price.',
      noResults: 'No results – try the street and town.',
      searchDown: 'Address search is down right now. Please try again in a minute.',
      reportLegend: 'Written report',
      reportYes: 'Yes, I want a written report with photos and recommendations',
      reportNo: 'No, findings explained on site are enough',
      yourPrice: 'Your price',
      inclVat: 'VAT (PDV) included',
      depositToday: 'Deposit today:',
      restAfter: 'You pay the rest after the service.',
      validUntil: (d) => `Price guaranteed until ${d}`,
      manualTitle: 'We send a personal quote for this location',
      manualText: 'Leave your details and we will contact you with a price and time, by the next working day at the latest.',
      back: 'Back',
      continue: 'Continue',
      morning: 'Morning', morningSub: '8am–12pm',
      afternoon: 'Afternoon', afternoonSub: '12–5pm',
      pickTime: 'Pick a time',
      noSlots: 'No free times that day – please pick another day.',
      loading: 'Loading…',
      name: 'Full name',
      email: 'Email',
      phone: 'Mobile',
      notes: 'Describe the problem (optional)',
      notesPh: 'E.g. stain on the ceiling under the balcony, appeared after rain…',
      consent: 'I agree that DC Building Inspectors may process my details to arrange and carry out the service.',
      pay: (a) => `Pay ${a} deposit and book`,
      sendRequest: 'Send request',
      secure: '🔒 Secure card payment via Stripe',
      sumService: 'Service', sumAddress: 'Address', sumWhen: 'When', sumPrice: 'Price', sumDeposit: 'Deposit today',
      withReport: 'with written report', withoutReport: 'without written report',
      errors: {
        name: 'Please enter your full name.', email: 'Please check your email.', phone: 'Please check your mobile number.',
        consent: 'We need your consent to process your details.', quote_expired: 'This quote has expired – please start again.',
        slot_taken: 'That time was just taken – please pick another.', date: 'Please choose a time.',
        rate_limited: 'Too many attempts – please wait a minute.', generic: 'Something went wrong. Please try again or call us.',
      },
      paidTitle: 'Booking confirmed!',
      paidText: 'Your deposit is paid. We will email and text you the appointment details.',
      requestTitle: 'Request received!',
      requestText: 'We will be in touch shortly to confirm your time.',
      quoteTitle: 'Thank you!',
      quoteText: 'We are preparing your personal quote and will contact you by the next working day.',
      cancelledTitle: 'Payment not completed',
      cancelledText: 'Your time is not booked yet. You can try again – the price is valid for 24 hours.',
      restart: 'New booking',
    },
  };

  const params = new URLSearchParams(location.search);
  const state = {
    lang: params.get('lang') === 'en' ? 'en' : 'hr',
    catalog: null,
    service: null,
    place: null, // { label, ref }
    report: true,
    quote: null,
    date: null,
    slot: null,
    window: null,
    step: 'service',
  };
  const tracking = params.get('src') || document.referrer || '';

  const $ = (sel) => document.querySelector(sel);
  const t = (k) => T[state.lang][k];
  const fmtEur = (n) =>
    new Intl.NumberFormat(state.lang === 'en' ? 'en-IE' : 'hr-HR', {
      style: 'currency', currency: 'EUR', minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    }).format(n);
  const fmtDate = (d, opts) => new Intl.DateTimeFormat(state.lang === 'en' ? 'en-GB' : 'hr-HR', { timeZone: 'Europe/Zagreb', ...opts }).format(d);

  async function api(path, body) {
    const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'generic'), { code: data.error || 'generic' });
    return data;
  }

  // ---------- text + language ----------
  function applyText() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-t]').forEach((el) => {
      const v = t(el.dataset.t);
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('[data-tp]').forEach((el) => (el.placeholder = t(el.dataset.tp)));
    $('#address').placeholder = t('addressPh');
    $('#langBtn').textContent = state.lang === 'hr' ? 'EN' : 'HR';
  }

  // ---------- steps ----------
  const ORDER = ['service', 'address', 'schedule', 'contact'];
  function show(step) {
    state.step = step;
    ['service', 'address', 'schedule', 'contact', 'done'].forEach((s) => ($(`#step-${s}`).hidden = s !== step));
    const idx = ORDER.indexOf(step);
    $('#stepper').innerHTML = ORDER.map((_, i) => `<li class="${i <= idx || step === 'done' ? 'on' : ''}"></li>`).join('');
    if (step === 'contact') renderContact();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.addEventListener('click', (e) => {
    if (!e.target.matches('[data-back]')) return;
    const idx = ORDER.indexOf(state.step);
    let prev = ORDER[Math.max(0, idx - 1)];
    if (state.step === 'contact' && state.quote?.manualQuote) prev = 'address';
    show(prev);
  });

  // ---------- 1. services ----------
  function renderServices() {
    const groups = {};
    for (const s of state.catalog.services) (groups[s.group] ||= []).push(s);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    $('#serviceGroups').innerHTML = Object.entries(groups)
      .map(([g, list]) => `
        <p class="group-title">${esc(t('groups')[g] || g)}</p>
        <div class="services">${list.map((s) => `
          <button type="button" class="svc" data-id="${esc(s.id)}">
            <span class="ico">${esc(s.icon)}</span><strong>${esc(s.name)}</strong><small>${esc(s.desc)}</small>
          </button>`).join('')}
        </div>`)
      .join('');
  }
  $('#serviceGroups').addEventListener('click', (e) => {
    const btn = e.target.closest('.svc');
    if (!btn) return;
    state.service = state.catalog.services.find((s) => s.id === btn.dataset.id);
    $('#chosenService').textContent = `${state.service.icon} ${state.service.name}`;
    $('#reportBox').hidden = state.service.reportRequired;
    if (state.service.reportRequired) state.report = true;
    show('address');
    if (state.place) refreshQuote();
    else $('#address').focus();
  });

  // ---------- 2. address + quote ----------
  let acTimer = null;
  let acSeq = 0;
  let acItems = [];
  let acActive = -1;
  const input = $('#address');
  const list = $('#suggestions');

  function closeList() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); acActive = -1; }
  function renderList(items, message) {
    acItems = items;
    list.innerHTML = message
      ? `<li class="empty">${message}</li>`
      : items.map((p, i) => `<li role="option" id="opt-${i}" data-i="${i}">${p.label.replace(/</g, '&lt;')}</li>`).join('');
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  input.addEventListener('input', () => {
    state.place = null;
    resetQuote();
    clearTimeout(acTimer);
    const q = input.value.trim();
    if (q.length < 3) return closeList();
    acTimer = setTimeout(async () => {
      const seq = ++acSeq;
      try {
        const data = await api(`/api/places?q=${encodeURIComponent(q)}`);
        if (seq !== acSeq) return;
        data.places.length ? renderList(data.places) : renderList([], t('noResults'));
      } catch {
        if (seq === acSeq) renderList([], t('searchDown'));
      }
    }, 300);
  });
  input.addEventListener('keydown', (e) => {
    if (list.hidden || !acItems.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      acActive = (acActive + (e.key === 'ArrowDown' ? 1 : -1) + acItems.length) % acItems.length;
      list.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', String(i === acActive)));
      input.setAttribute('aria-activedescendant', `opt-${acActive}`);
    } else if (e.key === 'Enter' && acActive >= 0) {
      e.preventDefault();
      pick(acItems[acActive]);
    } else if (e.key === 'Escape') closeList();
  });
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li) { e.preventDefault(); pick(acItems[Number(li.dataset.i)]); }
  });
  input.addEventListener('blur', () => setTimeout(closeList, 150));

  function pick(place) {
    state.place = place;
    input.value = place.label;
    closeList();
    refreshQuote();
  }

  document.querySelectorAll('input[name="report"]').forEach((r) =>
    r.addEventListener('change', () => {
      state.report = r.value === 'yes';
      if (state.place) refreshQuote();
    })
  );

  function resetQuote() {
    state.quote = null;
    $('#priceCard').hidden = true;
    $('#manualCard').hidden = true;
    $('#toSchedule').disabled = true;
    $('#addressHint').hidden = false;
  }

  let quoteSeq = 0;
  async function refreshQuote() {
    const seq = ++quoteSeq;
    $('#toSchedule').disabled = true;
    try {
      const q = await api('/api/quote', { serviceId: state.service.id, ref: state.place.ref, report: state.report });
      if (seq !== quoteSeq) return;
      state.quote = q;
      $('#addressHint').hidden = true;
      if (q.manualQuote) {
        $('#priceCard').hidden = true;
        $('#manualCard').hidden = false;
      } else {
        $('#manualCard').hidden = true;
        $('#priceCard').hidden = false;
        $('#priceValue').textContent = fmtEur(q.total);
        $('#depositValue').textContent = `${fmtEur(q.deposit)} (${q.depositPct}%)`;
        $('#validUntil').textContent = t('validUntil')(fmtDate(new Date(q.validUntil), { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }));
      }
      $('#toSchedule').disabled = false;
    } catch (err) {
      if (seq === quoteSeq) { resetQuote(); }
    }
  }
  $('#toSchedule').addEventListener('click', () => {
    if (state.quote?.manualQuote) show('contact');
    else { renderDays(); show('schedule'); }
  });

  // ---------- 3. schedule ----------
  function nextDays(n) {
    const out = [];
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    while (out.length < n) {
      d.setDate(d.getDate() + 1);
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) out.push(new Date(d));
    }
    return out;
  }
  const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  function renderDays() {
    const days = nextDays(15);
    $('#days').innerHTML = days
      .map((d) => {
        const iso = isoDay(d);
        return `<button type="button" class="chip" role="radio" aria-checked="${state.date === iso}" data-day="${iso}">
          <small>${fmtDate(d, { weekday: 'short' })}</small>${fmtDate(d, { day: 'numeric', month: 'numeric' })}</button>`;
      })
      .join('');
    if (state.date) renderTimes();
  }
  $('#days').addEventListener('click', (e) => {
    const b = e.target.closest('[data-day]');
    if (!b) return;
    state.date = b.dataset.day;
    state.slot = null;
    state.window = null;
    $('#toContact').disabled = true;
    document.querySelectorAll('#days .chip').forEach((c) => c.setAttribute('aria-checked', String(c === b)));
    renderTimes();
  });

  async function renderTimes() {
    const box = $('#timeBox');
    if (!state.catalog.calendar) {
      box.innerHTML = `<p class="group-title">${t('pickTime')}</p><div class="windows">
        ${['morning', 'afternoon'].map((w) => `<button type="button" class="chip" role="radio" aria-checked="${state.window === w}" data-window="${w}">${t(w)}<small>${t(w + 'Sub')}</small></button>`).join('')}
      </div>`;
      return;
    }
    box.innerHTML = `<p class="muted"><span class="spinner"></span> ${t('loading')}</p>`;
    const forDate = state.date;
    try {
      const data = await api(`/api/slots?date=${forDate}`);
      if (forDate !== state.date) return;
      if (data.mode === 'window') { state.catalog.calendar = false; return renderTimes(); }
      box.innerHTML = data.slots.length
        ? `<p class="group-title">${t('pickTime')}</p><div class="times">${data.slots
            .map((s) => `<button type="button" class="chip" role="radio" aria-checked="${state.slot === s}" data-slot="${s}">${fmtDate(new Date(s), { hour: '2-digit', minute: '2-digit' })}</button>`)
            .join('')}</div>`
        : `<p class="muted">${t('noSlots')}</p>`;
    } catch {
      state.catalog.calendar = false;
      renderTimes();
    }
  }
  $('#timeBox').addEventListener('click', (e) => {
    const b = e.target.closest('[data-slot],[data-window]');
    if (!b) return;
    state.slot = b.dataset.slot || null;
    state.window = b.dataset.window || null;
    document.querySelectorAll('#timeBox .chip').forEach((c) => c.setAttribute('aria-checked', String(c === b)));
    $('#toContact').disabled = false;
  });
  $('#toContact').addEventListener('click', () => show('contact'));

  // ---------- 4. contact + submit ----------
  function whenText() {
    if (state.slot) return fmtDate(new Date(state.slot), { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    if (state.date) return `${fmtDate(new Date(`${state.date}T12:00:00`), { weekday: 'long', day: 'numeric', month: 'long' })}, ${t(state.window)}`;
    return '';
  }
  function renderContact() {
    const q = state.quote;
    const rows = [
      [t('sumService'), state.service.name],
      [t('sumAddress'), state.place.label],
    ];
    if (!q.manualQuote) {
      rows.push([t('sumWhen'), whenText()]);
      rows.push([t('sumPrice'), `${fmtEur(q.total)} · ${q.withReport ? t('withReport') : t('withoutReport')}`]);
      rows.push([t('sumDeposit'), fmtEur(q.deposit)]);
    }
    const sum = $('#summary');
    sum.innerHTML = '';
    for (const [k, v] of rows) {
      const div = document.createElement('div');
      div.innerHTML = `<span class="muted"></span> <b></b>`;
      div.firstChild.textContent = `${k}:`;
      div.lastChild.textContent = v;
      sum.appendChild(div);
    }
    const payNow = !q.manualQuote && state.catalog.payments;
    $('#submitBtn').textContent = payNow ? t('pay')(fmtEur(q.deposit)) : t('sendRequest');
    document.querySelector('.secure').hidden = !payNow;
  }

  $('#contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const err = $('#formError');
    err.hidden = true;
    const btn = $('#submitBtn');
    const label = btn.textContent;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span>`;
    try {
      const data = await api('/api/book', {
        quoteToken: state.quote.quoteToken,
        name: f.name.value,
        email: f.email.value,
        phone: f.phone.value,
        notes: f.notes.value,
        consent: f.consent.checked,
        slot: state.slot,
        date: state.date,
        window: state.window,
        lang: state.lang,
        tracking,
      });
      if (data.redirect) {
        // Stripe Checkout can't run inside the website's iframe, so open it at the top level.
        try { window.top.location.href = data.redirect; } catch { /* blocked by the host page */ }
        // If the website blocks the redirect, give a link the customer can tap.
        setTimeout(() => {
          err.innerHTML = '';
          const a = document.createElement('a');
          a.href = data.redirect;
          a.target = '_blank';
          a.rel = 'noopener';
          a.className = 'primary';
          a.textContent = `${t('continue')} →`;
          err.appendChild(a);
          err.hidden = false;
        }, 1500);
        return;
      }
      finish(data.mode);
    } catch (ex) {
      err.textContent = t('errors')[ex.code] || t('errors').generic;
      err.hidden = false;
      if (ex.code === 'slot_taken') { state.slot = null; renderDays(); show('schedule'); }
      if (ex.code === 'quote_expired') { resetQuote(); show('address'); }
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  function finish(mode) {
    const key = { paid: 'paid', request: 'request', quote: 'quote', cancelled: 'cancelled' }[mode] || 'request';
    $('#doneTitle').textContent = t(`${key}Title`);
    $('#doneText').textContent = t(`${key}Text`);
    document.querySelector('.tick').textContent = key === 'cancelled' ? '!' : '✓';
    show('done');
  }
  $('#restart').addEventListener('click', () => {
    history.replaceState(null, '', location.pathname + (state.lang === 'en' ? '?lang=en' : ''));
    location.reload();
  });

  $('#langBtn').addEventListener('click', async () => {
    state.lang = state.lang === 'hr' ? 'en' : 'hr';
    applyText();
    await loadCatalog();
    if (state.service) {
      state.service = state.catalog.services.find((s) => s.id === state.service.id);
      $('#chosenService').textContent = `${state.service.icon} ${state.service.name}`;
    }
    if (state.step === 'schedule') renderDays();
    if (state.step === 'contact') renderContact();
    if (state.quote && !state.quote.manualQuote) refreshQuote();
  });

  async function loadCatalog() {
    const cal = state.catalog?.calendar;
    state.catalog = await api(`/api/catalog?lang=${state.lang}`);
    if (cal === false) state.catalog.calendar = false;
    $('#testBanner').hidden = !state.catalog.testMode;
    renderServices();
  }

  // Tell the embedding page how tall we are, so the iframe can fit without scrollbars.
  if (window.parent !== window && 'ResizeObserver' in window) {
    new ResizeObserver(() =>
      window.parent.postMessage({ type: 'dc-booking-height', height: document.documentElement.scrollHeight }, '*')
    ).observe(document.body);
  }

  (async function init() {
    applyText();
    try {
      await loadCatalog();
    } catch {
      $('#serviceGroups').textContent = t('errors').generic;
    }
    const status = params.get('status');
    if (status === 'paid' || status === 'cancelled') finish(status);
    else show('service');
  })();
})();
