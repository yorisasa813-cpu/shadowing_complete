/* C1 Climb — bridge to Shadowing Coach (Radio Eikaiwa lessons and audio on this device). Exposes window.C1.radio.
   READ-ONLY toward Shadowing Coach: the 'shadowing-coach' IndexedDB database is opened without a version, only
   read in 'readonly' transactions, and never created (an upgrade is aborted). Nothing here writes to it or to sc.*.
   The lessons, scripts and audio stay on this device; this file only reads them at run time. */
(function () {
  'use strict';
  const C1 = window.C1;
  if (!C1) return;
  const hasDoc = typeof document !== 'undefined';
  const DB_NAME = 'shadowing-coach';
  const STORE = 'kv';

  /* ---------- small helpers ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const dateKey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const today = () => dateKey(new Date());
  const fire = () => { if (hasDoc) try { document.dispatchEvent(new CustomEvent('c1:radio')); } catch (e) { /* ignore */ } };
  const num = (x) => (typeof x === 'number' && isFinite(x) ? x : 0);
  // same order as Shadowing Coach's byDate: date ascending (undated last), then createdAt
  const byDate = (a, b) => (a.date || '9999').localeCompare(b.date || '9999') || (num(a.createdAt) - num(b.createdAt));

  /* lesson number: mirror of Shadowing Coach's titleNo / lessonNoOf (weekday-run correction) */
  const titleNo = (l) => { const m = String(l.title).match(/[(（](\d{1,3})[)）]/); return +((m && m[1]) || 0); };
  const wdIdx = (d) => { const n = Math.round((Date.parse(d) - Date.parse('2000-01-03')) / 864e5); return Math.floor(n / 7) * 5 + Math.min(n % 7, 5); };
  function lessonNumbers(all) {
    const ls = all.filter((x) => titleNo(x) && /^\d{4}-\d{2}-\d{2}$/.test(x.date || '') && new Date(x.date + 'T12:00').getDay() % 6);
    const map = new Map();
    for (const x of ls) {
      const cnt = new Map();
      for (const y of ls) if (Math.abs(Date.parse(y.date) - Date.parse(x.date)) <= 10 * 864e5) { const o = titleNo(y) - wdIdx(y.date); cnt.set(o, (cnt.get(o) || 0) + 1); }
      const own = titleNo(x) - wdIdx(x.date);
      const top = Math.max(...cnt.values());
      const o = cnt.get(own) === top ? own : [...cnt].find((e) => e[1] === top)[0];
      map.set(x.id, o !== own && top >= 3 && top >= (cnt.get(own) || 0) + 2 ? wdIdx(x.date) + o : titleNo(x));
    }
    return (l) => map.get(l.id) || titleNo(l) || null;
  }

  /* ---------- IndexedDB, read-only ---------- */
  function openDb() {
    return new Promise((resolve) => {
      let req;
      let upgraded = false;
      try {
        if (typeof indexedDB === 'undefined' || !indexedDB) return resolve(null);
        req = indexedDB.open(DB_NAME); // no version: never upgrades an existing database
      } catch (e) { return resolve(null); }
      req.onupgradeneeded = (ev) => {
        // the database did not exist: abort so that nothing is created (Shadowing Coach must do its own first run)
        upgraded = true;
        try { ((ev && ev.target && ev.target.transaction) || req.transaction).abort(); } catch (e) { /* ignore */ }
      };
      req.onsuccess = () => {
        const db = req.result;
        if (upgraded || !db || !db.objectStoreNames || !db.objectStoreNames.contains(STORE)) { try { db && db.close(); } catch (e) { /* ignore */ } return resolve(null); }
        db.onversionchange = () => { try { db.close(); } catch (e) { /* ignore */ } }; // never block Shadowing Coach
        resolve(db);
      };
      req.onerror = (ev) => { try { ev && ev.preventDefault && ev.preventDefault(); } catch (e) { /* ignore */ } resolve(null); };
      req.onblocked = () => { /* wait; success or error follows */ };
    });
  }
  function getKeys(db, keys) {
    return new Promise((resolve) => {
      const out = {};
      try {
        const t = db.transaction(STORE, 'readonly');
        const s = t.objectStore(STORE);
        keys.forEach((k) => { const r = s.get(k); r.onsuccess = () => { out[k] = r.result; }; r.onerror = (ev) => { try { ev.preventDefault(); } catch (e) { /* ignore */ } }; });
        t.oncomplete = () => resolve(out);
        t.onerror = t.onabort = () => resolve(out);
      } catch (e) { resolve(out); }
    });
  }
  function readKeys(keys) {
    return openDb().then((db) => {
      if (!db) return null;
      return getKeys(db, keys).then((out) => { try { db.close(); } catch (e) { /* ignore */ } return out; });
    }).catch(() => null);
  }
  function newPerDay() {
    try {
      const s = JSON.parse(localStorage.getItem('sc.settings') || '{}') || {};
      const n = Number(s.newPerDay);
      return isFinite(n) && s.newPerDay != null && s.newPerDay !== '' ? n : 1;
    } catch (e) { return 1; }
  }

  /* ---------- state ---------- */
  let raw = [];          // Shadowing Coach lessons as read (kept private)
  let list = [];         // normalized Lesson objects, oldest first
  let byId = new Map();
  let segs = new Map();  // id -> [ {s,e} | null ]
  let mins = {};         // 'YYYY-MM-DD' -> { listening, speaking }
  let avail = false;
  const missing = new Map(); // id -> audio.v of lessons whose audio record turned out to be absent on this device
  let readyP = null;
  let loadP = null;

  function hasAudioRaw(L) { return !!(L && L.audio && !L.audio.missing && !(missing.has(L.id) && missing.get(L.id) === L.audio.v)); }
  function build() {
    const noOf = lessonNumbers(raw);
    segs = new Map();
    list = raw.slice().sort(byDate).map((L) => {
      const audio = hasAudioRaw(L);
      const sents = Array.isArray(L.sentences) ? L.sentences : [];
      const sg = sents.map((s) => (audio && s && s.seg && num(s.seg.e) > num(s.seg.s) ? { s: num(s.seg.s), e: num(s.seg.e) } : null));
      segs.set(L.id, sg);
      const srs = L.srs && typeof L.srs === 'object' ? L.srs : null;
      return {
        id: L.id,
        title: String(L.title == null ? '' : L.title),
        no: noOf(L),
        date: typeof L.date === 'string' ? L.date : '',
        sentences: sents.map((s, i) => ({ i, speaker: String((s && s.speaker) || ''), en: String((s && s.en) || ''), ja: String((s && s.ja) || ''), hasSeg: !!sg[i] })),
        hasAudio: audio,
        canPlayAll: audio && sents.length > 0 && sg.every(Boolean),
        started: !!srs || (Array.isArray(L.history) && L.history.length > 0),
        due: srs && typeof srs.due === 'string' ? srs.due : null,
        stage: srs && typeof srs.stage === 'number' ? srs.stage : null,
        _srs: srs, _createdAt: num(L.createdAt),
      };
    });
    byId = new Map(list.map((l) => [l.id, l]));
    avail = list.length > 0;
  }
  function buildMinutes(days) {
    const out = {};
    const r1 = (x) => Math.round(x * 10) / 10;
    if (days && typeof days === 'object') for (const d of Object.keys(days)) {
      const rec = days[d];
      if (!rec || !/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
      const sec = num(rec.sec);
      const jaen = rec.modes ? num(rec.modes.jaen) : 0;
      const speaking = r1(jaen / 60);
      const listening = r1(Math.max(0, sec - jaen) / 60);
      if (speaking > 0 || listening > 0) out[d] = { listening, speaking };
    }
    return out;
  }
  const strip = (l) => { const o = Object.assign({}, l); delete o._srs; delete o._createdAt; return o; };

  function load() {
    if (loadP) return loadP;
    loadP = readKeys(['lessons', 'stats']).then((out) => {
      if (!out) { raw = []; mins = {}; }
      else {
        raw = (Array.isArray(out.lessons) ? out.lessons : []).filter((l) => l && typeof l === 'object' && l.id != null && l.id !== 'sample');
        mins = buildMinutes(out.stats && out.stats.days);
      }
      build();
      // the prepared audio is stale if that lesson's audio was replaced or removed
      if (prep.id != null) {
        const L = raw.find((x) => x.id === prep.id);
        if (!L || !hasAudioRaw(L) || (L.audio && L.audio.v) !== prep.v) unprepare();
      }
      return avail;
    }).catch(() => { raw = []; mins = {}; build(); return false; })
      .then((ok) => { loadP = null; fire(); return ok; });
    return loadP;
  }
  function ready() {
    if (!readyP) readyP = new Promise((resolve) => {
      const t = setTimeout(() => resolve(false), 6000);
      load().then((ok) => { clearTimeout(t); resolve(ok); }, () => { clearTimeout(t); resolve(false); });
    });
    return readyP;
  }
  function reload() { if (!readyP) return ready(); return load(); }

  /* ---------- plan, minutes ---------- */
  function todayPlan() {
    const t = today();
    const ls = list.filter((l) => l.sentences.length);
    const reviews = ls.filter((l) => l._srs && l.due && l.due <= t).sort((a, b) => a.due.localeCompare(b.due));
    const startedToday = ls.filter((l) => l._srs && l._srs.first === t).length;
    const fresh = ls.filter((l) => !l._srs).sort((a, b) => byDate({ date: a.date, createdAt: a._createdAt }, { date: b.date, createdAt: b._createdAt }))
      .slice(0, Math.max(0, newPerDay() - startedToday));
    return { due: reviews.length, fresh: fresh.length, total: reviews.length + fresh.length, ids: reviews.concat(fresh).map((l) => l.id) };
  }
  function minutes() {
    const out = {};
    for (const d in mins) out[d] = { listening: mins[d].listening, speaking: mins[d].speaking };
    return out;
  }

  /* ---------- audio: one element owned by the bridge ---------- */
  let audio = null;
  const prep = { id: null, v: null, url: null };
  let cur = null; // the play in progress: { fin }
  function el() {
    if (audio) return audio;
    if (typeof Audio === 'undefined') return null;
    audio = new Audio();
    audio.preload = 'auto';
    try { audio.setAttribute && audio.setAttribute('playsinline', ''); } catch (e) { /* ignore */ }
    audio.preservesPitch = true; audio.webkitPreservesPitch = true; audio.mozPreservesPitch = true;
    return audio;
  }
  function revoke(u) { try { if (u && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(u); } catch (e) { /* ignore */ } }
  function unprepare() {
    stop();
    revoke(prep.url);
    prep.id = null; prep.v = null; prep.url = null;
    if (audio) { try { audio.removeAttribute ? audio.removeAttribute('src') : (audio.src = ''); audio.load(); } catch (e) { /* ignore */ } }
  }
  let prepTok = 0;
  function prepare(id) {
    const L = raw.find((x) => x.id === id);
    if (!L || !hasAudioRaw(L)) return Promise.resolve(false);
    if (prep.id === id && prep.url) return Promise.resolve(true);
    const tok = ++prepTok;
    return readKeys(['audio:' + id]).then((out) => {
      if (tok !== prepTok) return prep.id === id;
      const rec = out && out['audio:' + id];
      if (!rec || !rec.blob) {
        if (out) { missing.set(id, L.audio && L.audio.v); build(); fire(); } // same meaning as Shadowing Coach's audio.missing
        return false;
      }
      const a = el();
      if (!a) return false;
      let url;
      try { url = URL.createObjectURL(rec.blob); } catch (e) { return false; }
      stop();
      revoke(prep.url);
      prep.id = id; prep.v = L.audio && L.audio.v; prep.url = url;
      return new Promise((resolve) => {
        let done = false;
        const fin = (ok) => {
          if (done) return; done = true;
          clearTimeout(timer);
          a.removeEventListener('loadedmetadata', good); a.removeEventListener('canplay', good); a.removeEventListener('error', bad);
          if (!ok && prep.url === url) { revoke(url); prep.id = null; prep.v = null; prep.url = null; }
          resolve(ok && prep.url === url);
        };
        const good = () => fin(true);
        const bad = () => fin(false);
        a.addEventListener('loadedmetadata', good); a.addEventListener('canplay', good); a.addEventListener('error', bad);
        const timer = setTimeout(() => fin(true), 8000); // src is set; a tap can still start it
        try { a.src = url; a.load(); } catch (e) { fin(false); return; }
        if (a.readyState >= 1) fin(true);
      });
    }).catch(() => false);
  }
  function prepared(id) { return prep.id != null && prep.id === id && !!prep.url; }

  const raf = (fn) => (typeof requestAnimationFrame === 'function' && hasDoc && document.visibilityState !== 'hidden' ? requestAnimationFrame(fn) : setTimeout(fn, 30));
  function play(id, i, opts) {
    if (cur) cur.fin(false); // a new play supersedes the previous one
    const a = audio;
    const sg = segs.get(id);
    const seg = sg && sg[i];
    if (!a || !prepared(id) || !seg) return Promise.resolve(false);
    let rate = Number(opts && opts.rate);
    rate = isFinite(rate) && rate > 0 ? Math.min(1.5, Math.max(0.5, rate)) : 1;
    return new Promise((resolve) => {
      let done = false;
      let selfPause = false;
      let guard = null;
      const me = {};
      const fin = (ok) => {
        if (done) return; done = true;
        clearTimeout(guard);
        a.removeEventListener('timeupdate', check); a.removeEventListener('ended', onEnded);
        a.removeEventListener('pause', onPause); a.removeEventListener('error', onError); a.removeEventListener('seeked', onSeeked);
        if (cur === me) { cur = null; selfPause = true; try { a.pause(); } catch (e) { /* ignore */ } }
        resolve(ok);
      };
      me.fin = fin;
      const check = () => { if (done) return; if (a.currentTime >= seg.e - 0.01 || a.ended) fin(true); };
      const tick = () => { if (done) return; check(); if (!done) raf(tick); };
      const onEnded = () => fin(true);
      const onPause = () => { if (!selfPause && a.paused && !done) { if (a.currentTime >= seg.e - 0.05) fin(true); else fin(false); } };
      const onError = () => fin(false);
      const onSeeked = () => { try { a.playbackRate = rate; } catch (e) { /* ignore */ } };
      cur = me;
      a.addEventListener('timeupdate', check); a.addEventListener('ended', onEnded);
      a.addEventListener('pause', onPause); a.addEventListener('error', onError); a.addEventListener('seeked', onSeeked);
      try {
        a.preservesPitch = true; a.webkitPreservesPitch = true; a.mozPreservesPitch = true;
        a.currentTime = seg.s;
        a.defaultPlaybackRate = rate;
        a.playbackRate = rate; // after seeking (and again on 'seeked')
        const p = a.play(); // synchronous inside the tap (iOS)
        if (p && typeof p.catch === 'function') p.catch(() => fin(false));
      } catch (e) { fin(false); return; }
      guard = setTimeout(() => fin(true), (seg.e - seg.s) / rate * 1000 + 4000);
      raf(tick);
    });
  }
  function stop() {
    if (cur) cur.fin(false);
    if (audio) { try { if (!audio.paused) audio.pause(); } catch (e) { /* ignore */ } }
  }

  /* ---------- navigation ---------- */
  function coachUrl() { return '../index.html'; }
  function open() { stop(); try { location.href = coachUrl(); } catch (e) { /* ignore */ } }

  /* ---------- public API (never throws) ---------- */
  const guard = (fn, d) => function () { try { return fn.apply(null, arguments); } catch (e) { return typeof d === 'function' ? d() : d; } };
  const pFalse = () => Promise.resolve(false);
  C1.radio = {
    ready: guard(ready, pFalse),
    reload: guard(reload, pFalse),
    available: guard(() => avail, false),
    lessons: guard(() => list.map(strip), () => []),
    lesson: guard((id) => { const l = byId.get(id); return l ? strip(l) : null; }, null),
    todayPlan: guard(todayPlan, () => ({ due: 0, fresh: 0, total: 0, ids: [] })),
    minutes: guard(minutes, () => ({})),
    prepare: guard(prepare, pFalse),
    prepared: guard(prepared, false),
    play: guard(play, pFalse),
    stop: guard(stop),
    coachUrl: guard(coachUrl, '../index.html'),
    open: guard(open),
  };

  /* re-read when the learner comes back (e.g. from Shadowing Coach) */
  if (hasDoc) {
    try {
      window.addEventListener('pageshow', (e) => { if (e && e.persisted) reload(); });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reload(); });
    } catch (e) { /* ignore */ }
  }
  ready();
})();
