/* Apex & Chill — AndysManClub fundraiser overlay
 * Pure client-side: talks straight to the JustGiving API (CORS is open),
 * so this can be hosted as static files anywhere. No backend.
 *
 * Optional URL params (add to the OBS browser-source URL):
 *   ?mode=bar     show only the progress panel
 *   ?mode=alert   show only the donation alerts
 *   ?sound=0      mute the chime
 *   ?page=...     override the JustGiving page short name
 *   ?appid=...    override the JustGiving application id
 *   ?link=1       show the donation link (config.js -> donateUrl) under the bar
 */
(() => {
  const q = new URLSearchParams(location.search);
  const CONFIG = {
    appId: q.get('appid') || '3ad4beff',
    page: q.get('page') || (window.KIT_CONFIG || {}).jgPage || 'page/apexandchillracing',
    pollMs: 12000,        // how often we re-check JustGiving
    alertMs: 9000,        // how long each alert stays on screen
    sound: q.get('sound') !== '0',
  };
  const API = `https://api.justgiving.com/${CONFIG.appId}/v1`;
  const SEEN_KEY = `amc_seen_${CONFIG.page}`;

  const mode = q.get('mode');
  // Bar-only copies are read-only: they never alert, chime or mark donations as seen,
  // so a separate ?mode=alert copy (sharing localStorage) still catches every donation.
  const barOnly = mode === 'bar';
  if (mode === 'bar' || mode === 'alert') document.body.classList.add(`mode-${mode}`);
  const donateUrl = String((window.KIT_CONFIG || {}).donateUrl || '').trim();
  if (q.get('link') === '1' && donateUrl) {
    const link = document.getElementById('link');
    link.textContent = 'Donate: ' + donateUrl;
    link.hidden = false;
  }

  // ── Elements ──────────────────────────────────────────────────────
  const el = (id) => document.getElementById(id);
  const raisedEl = el('raised'), goalEl = el('goal'), fillEl = el('fill'),
        pctEl = el('pct'), latestEl = el('latest'), alertEl = el('alert'),
        aDonor = el('a-donor'), aAmount = el('a-amount'), aMessage = el('a-message');

  // ── Helpers ───────────────────────────────────────────────────────
  const sym = (code) => (code === 'GBP' || !code ? '£' : `${code} `);
  const money = (n, code) => `${sym(code)}${Number(n || 0).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  const parseJgDate = (s) => { const m = /\/Date\((\d+)/.exec(s || ''); return m ? Number(m[1]) : 0; };

  async function getJSON(url) {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  const getDetails = () => getJSON(`${API}/fundraising/pages/${CONFIG.page}`);
  const getDonations = () => getJSON(`${API}/fundraising/pages/${CONFIG.page}/donations`);

  function loadSeen() { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)) || []); } catch { return new Set(); } }
  function saveSeen(set) { try { localStorage.setItem(SEEN_KEY, JSON.stringify([...set].slice(-500))); } catch {} }

  // ── Animated count-up for the raised total ────────────────────────
  let shownRaised = 0, currency = 'GBP';
  function animateRaised(to) {
    const from = shownRaised, start = performance.now(), dur = 1100;
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      raisedEl.textContent = money(from + (to - from) * eased, currency);
      if (t < 1) requestAnimationFrame(step); else { shownRaised = to; raisedEl.textContent = money(to, currency); }
    }
    requestAnimationFrame(step);
  }

  function renderDetails(d) {
    currency = d.currencyCode || 'GBP';
    const raised = Number(d.grandTotalRaisedExcludingGiftAid ?? d.totalRaisedOnline ?? 0);
    const target = Number(d.fundraisingTarget || 0);
    const pct = Math.max(0, Math.min(100, Number(d.totalRaisedPercentageOfFundraisingTarget ?? (target ? (raised / target) * 100 : 0))));
    goalEl.textContent = target ? money(target, currency) : '—';
    fillEl.style.width = `${pct}%`;
    pctEl.textContent = `${Math.round(pct)}%`;
    if (Math.abs(raised - shownRaised) > 0.001) animateRaised(raised);
  }

  function renderLatest(list) {
    if (!list.length) { latestEl.innerHTML = 'Be the first to donate 💚'; return; }
    const d = list[0];
    latestEl.innerHTML = `Latest: <b>${escapeHtml(d.donorDisplayName || 'Anonymous')}</b> — ${money(d.amount, d.currencyCode)}`;
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  // ── Chime (Web Audio — no sound file needed) ──────────────────────
  let audioCtx;
  function chime() {
    if (!CONFIG.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {   // C5 - E5 - G5
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + i * 0.12;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t); osc.stop(t + 0.55);
      });
    } catch {}
  }

  // ── Alert queue ───────────────────────────────────────────────────
  const queue = [];
  let showing = false;
  function enqueue(d) { queue.push(d); if (!showing) next(); }
  function next() {
    const d = queue.shift();
    if (!d) { showing = false; return; }
    showing = true;
    aDonor.textContent = d.donorDisplayName || 'Anonymous';
    aAmount.textContent = money(d.amount, d.currencyCode);
    aMessage.textContent = (d.message || '').trim().slice(0, 180);
    alertEl.classList.add('show');
    alertEl.setAttribute('aria-hidden', 'false');
    chime();
    setTimeout(() => {
      alertEl.classList.remove('show');
      alertEl.setAttribute('aria-hidden', 'true');
      setTimeout(next, 600);   // wait for fade-out before the next one
    }, CONFIG.alertMs);
  }

  // ── Main loop ─────────────────────────────────────────────────────
  let primed = false;
  async function tick() {
    try {
      const [details, dono] = await Promise.all([getDetails(), getDonations()]);
      const list = (dono.donations || []).slice().sort((a, b) => parseJgDate(b.donationDate) - parseJgDate(a.donationDate));
      renderDetails(details);
      renderLatest(list);

      if (barOnly) return;
      const seen = loadSeen();
      if (!primed && seen.size === 0) {
        // First ever run: remember existing donations without alerting the backlog
        list.forEach((d) => seen.add(String(d.id)));
        saveSeen(seen);
      } else {
        const fresh = list.filter((d) => !seen.has(String(d.id))).reverse(); // oldest first
        fresh.forEach((d) => { enqueue(d); seen.add(String(d.id)); });
        if (fresh.length) saveSeen(seen);
      }
      primed = true;
    } catch (err) {
      console.error('overlay update failed:', err.message);
    }
  }

  tick();
  setInterval(tick, CONFIG.pollMs);

  // ?demo=1 — fire a sample alert so you can preview/position it in OBS
  if (q.get('demo')) {
    setTimeout(() => enqueue({
      id: 'demo', donorDisplayName: 'Demo Donor', amount: '25.00',
      currencyCode: 'GBP', message: 'Great cause — keep it up! #itsokaytotalk',
    }), 1500);
  }
})();
