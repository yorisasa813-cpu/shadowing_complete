/* C1 Climb — speaking module: timed monologue, 瞬間英作文 from the learner's imported dialogues (via C1.radio, optional),
   functional-phrase drill, history.
   Stage 1 (B1 learner → B2): B2 prompts, Japanese shown, 60 s prep, PREP frame with easy starters, 100–130 wpm, sample answer.
   Stage 2 (B2 learner → C1): C1 prompts, 30 s prep, frame by prompt type, 130–160 wpm. */
(function () {
  'use strict';
  const C1 = window.C1;
  if (!C1) return;
  const el = C1.el;
  const RAW = window.C1_SPEAK || {};
  const DATA = {
    prompts: Array.isArray(RAW.prompts) ? RAW.prompts : [],
    phrases: Array.isArray(RAW.phrases) ? RAW.phrases : [],
    frames: Array.isArray(RAW.frames) ? RAW.frames : [],
  };
  const MAX_HISTORY = 40;
  const LEVELS = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C2'];
  const TYPE_JA = { opinion: '意見', compare: '比較', speculate: '推測', experience: '経験', problem: '問題解決' };
  const TYPE_FRAME = { opinion: 'prep', compare: 'sides', speculate: 'ppf', experience: 'ppf', problem: 'pcs' };
  const CHECKS_B2 = [
    '最初に自分の意見をはっきり言えた',
    '理由を1つ以上言えた',
    '具体例(自分の経験など)を1つ言えた',
    '最後にもう一度、結論を言えた',
    '長く黙らずに話し続けられた',
    'わからない単語は、かんたんな言葉で言い換えた',
  ];
  const CHECKS_C1 = [
    '構成(型)がはっきりしていた',
    '断定を和らげる表現を2つ以上使った',
    '長い沈黙がなかった',
    '言葉に詰まったとき、止まらずに言い換えた',
    'お題に合った語彙を使った',
  ];

  /* settings that depend on the learner's stage (read at render time) */
  function stageCfg() {
    const st = C1.stage && C1.stage() === 1 ? 1 : 2;
    const lvNow = C1.level ? C1.level() : 'B2';
    return st === 1
      ? { stage: 1, lv: 'B2', alt: 'C1', now: 'B1', target: 'B2', prep: 60, wpmLo: 100, wpmHi: 130, rate: 0.8, checks: CHECKS_B2, upWords: '80-110' }
      : { stage: 2, lv: 'C1', alt: 'B2', now: lvNow === 'B1' ? 'B2' : lvNow, target: 'C1', prep: 30, wpmLo: 130, wpmHi: 160, rate: 0.95, checks: CHECKS_C1, upWords: '120-160' };
  }

  /* ---------- helpers ---------- */
  function ensureStyle() {
    if (document.getElementById('speak-style')) return;
    const s = document.createElement('style');
    s.id = 'speak-style';
    s.textContent = [
      '.speak-q{font-family:var(--font-en);font-weight:600;font-size:21px;line-height:1.35;overflow-wrap:anywhere}',
      '.speak-count{font-family:var(--font-display);font-weight:700;font-size:72px;line-height:1;text-align:center;font-variant-numeric:tabular-nums;letter-spacing:-0.03em}',
      '.speak-count.low{color:var(--bad)}',
      '.speak-steps{display:flex;flex-direction:column;gap:8px}',
      '.speak-step{border-left:3px solid var(--accent);padding-left:10px;min-width:0}',
      '.speak-step .en{font-size:15.5px;overflow-wrap:anywhere}',
      '.speak-partial{min-height:1.6em;font-family:var(--font-en);color:var(--muted);overflow-wrap:anywhere}',
      '.speak-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '.speak-stat{background:var(--sunken);border-radius:var(--r-sm);padding:10px 12px;min-width:0;overflow-wrap:anywhere}',
      '.speak-stat .num{font-size:24px;line-height:1.2;display:block}',
      '.speak-fn{display:block;width:100%;text-align:left;min-height:56px;padding:10px 12px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface);cursor:pointer}',
      '.speak-fn .progress{height:5px;margin-top:6px}',
      '.speak-check{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer}',
      '.speak-check input{flex:0 0 22px;width:22px;height:22px;accent-color:var(--accent)}',
      '.speak-wrap{overflow-wrap:anywhere}',
      '.speak-chipwrap{white-space:normal;max-width:100%}',
      '.speak-seg button{padding:6px 8px}',
      '.speak-ja{font-size:20px;line-height:1.5;font-weight:600;overflow-wrap:anywhere}',
      '.speak-hint{font-family:var(--font-en);font-size:17px;letter-spacing:.02em;overflow-wrap:anywhere}',
      '.speak-diff{font-family:var(--font-en);font-size:16px;line-height:1.8;overflow-wrap:anywhere}',
    ].join('\n');
    document.head.appendChild(s);
  }
  /* append children, skipping null/false (DOM append would insert the text "null") */
  function add(node, ...kids) {
    kids.flat(Infinity).forEach((k) => { if (k != null && k !== false) node.append(k); });
  }
  function norm(s) {
    return String(s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function countWords(s) {
    const m = String(s || '').match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g);
    return m ? m.length : 0;
  }
  /* the fixed, detectable part of a phrase: longest chunk between the "…" gaps */
  function phraseKey(p) {
    const parts = String(p.en || '').split(/…|\.\.\./).map(norm).filter(Boolean);
    let best = '';
    parts.forEach((x) => { if (x.length > best.length) best = x; });
    return best;
  }
  const PHRASE_KEYS = DATA.phrases.map((p) => ({ p: p, key: phraseKey(p) })).filter((x) => x.key.length >= 7);
  function detectPhrases(text) {
    const t = ' ' + norm(text) + ' ';
    return PHRASE_KEYS.filter((x) => t.indexOf(' ' + x.key + ' ') >= 0).map((x) => x.p);
  }
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }
  function lvOf(item) { return item && item.lv === 'B2' ? 'B2' : 'C1'; }
  function lvChip(lv) { return el('span', { class: 'chip ' + (lv === 'B2' ? 'good' : 'gold') }, lv); }
  function getHistory() {
    const h = C1.store.get('speak.history', []);
    return Array.isArray(h) ? h.filter((r) => r && typeof r === 'object') : [];
  }
  function saveRecord(rec) {
    const h = getHistory().filter((r) => r.id !== rec.id);
    h.push(rec);
    h.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    C1.store.set('speak.history', h.slice(0, MAX_HISTORY));
  }
  function secsJa(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    const m = Math.floor(sec / 60), s = sec % 60;
    return m ? m + '分' + (s ? s + '秒' : '') : s + '秒';
  }
  function wpmOf(r) { return typeof r.wpm === 'number' && isFinite(r.wpm) && r.wpm > 0 ? r.wpm : null; }
  /* the oldest stored speech with a wpm, excluding one id */
  function oldestWithWpm(exceptId) {
    let best = null;
    getHistory().forEach((r) => {
      if (r.id === exceptId || wpmOf(r) == null) return;
      if (!best || (Number(r.id) || 0) < (Number(best.id) || 0)) best = r;
    });
    return best;
  }
  /* engage contract: { speeches, firstWpm, lastWpm, bestWpm, phrasesMastered, phrasesTotal } */
  function stats() {
    const out = { speeches: 0, firstWpm: 0, lastWpm: 0, bestWpm: 0, phrasesMastered: 0, phrasesTotal: 0 };
    try {
      const h = getHistory();
      out.speeches = h.length;
      const w = h.filter((r) => wpmOf(r) != null).sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
      if (w.length) {
        out.firstWpm = w[0].wpm;
        out.lastWpm = w[w.length - 1].wpm;
        out.bestWpm = Math.max.apply(null, w.map((r) => r.wpm));
      }
    } catch (e) { /* keep zeros */ }
    out.phrasesTotal = DATA.phrases.length;
    try {
      const d = getDrill();
      out.phrasesMastered = DATA.phrases.filter((p) => p && boxOf(d, p.id) === 3).length; // box 3 = top of the drill's Leitner boxes
    } catch (e) { /* keep zeros */ }
    Object.keys(out).forEach((k) => { if (typeof out[k] !== 'number' || !isFinite(out[k])) out[k] = 0; });
    return out;
  }
  function getDrill() {
    const d = C1.store.get('speak.drill', {});
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  }
  function boxOf(d, id) {
    const v = d[id];
    return v && typeof v.box === 'number' ? Math.max(0, Math.min(3, v.box)) : 0;
  }
  /* functions (opening, hedging…) with their phrases; lvFilter 'B2' | 'C1' | 'all' */
  function fnList(lvFilter) {
    const seen = {};
    const out = [];
    DATA.phrases.forEach((p) => {
      if (lvFilter !== 'all' && lvOf(p) !== lvFilter) return;
      if (!seen[p.fn]) { seen[p.fn] = { fn: p.fn, fnJa: p.fnJa, items: [] }; out.push(seen[p.fn]); }
      seen[p.fn].items.push(p);
    });
    return out;
  }
  function mastery(d, items) {
    if (!items.length) return 0;
    return Math.round(items.reduce((s, p) => s + boxOf(d, p.id), 0) / (items.length * 3) * 100);
  }
  function frameById(id) { return DATA.frames.find((f) => f.id === id) || DATA.frames[0] || null; }
  function promptById(id) { return DATA.prompts.find((p) => p.id === id) || null; }
  function poolFor(lv) {
    const pool = DATA.prompts.filter((p) => lvOf(p) === lv);
    return pool.length ? pool : DATA.prompts;
  }
  function todaysPrompt(lv) {
    const pool = poolFor(lv);
    if (!pool.length) return null;
    const off = C1.store.get('speak.offset', null);
    const extra = off && off.date === C1.today() && typeof off.n === 'number' ? off.n : 0;
    return pool[(hashStr(C1.today() + lv) + extra) % pool.length];
  }
  /* ---------- 瞬間英作文 from the learner's imported dialogues (bridge C1.radio; optional) ----------
     Sentence review state lives in our own store: speak.radio = { '<lessonId>:<i>': { box, due, seen } }.
     Box 1..4 → next review in 1, 3, 7, 21 days. Nothing here ever writes to Shadowing Coach's data. */
  const RZ_DAYS = [1, 1, 3, 7, 21];
  const RZ_TOP = 4;
  const RZ_LONG = 3; // box ≥ 3 = reviewed at 7-day intervals or longer
  const RZ_SIZE = 10;
  const RZ_CARD_MS = 60000;
  function rzCall(name) {
    const r = C1.radio;
    if (!r || typeof r[name] !== 'function') return undefined;
    try { return r[name].apply(r, Array.prototype.slice.call(arguments, 1)); } catch (e) { return undefined; }
  }
  function rzOn() { return rzCall('available') === true; }
  function rzLessons() {
    if (!rzOn()) return [];
    const l = rzCall('lessons');
    if (!Array.isArray(l)) return [];
    return l.filter((x) => x && x.id != null && Array.isArray(x.sentences))
      .map((x, n) => ({ x: x, n: n }))
      .sort((a, b) => {
        const da = typeof a.x.date === 'string' ? a.x.date : '9999', db = typeof b.x.date === 'string' ? b.x.date : '9999';
        return da < db ? -1 : da > db ? 1 : a.n - b.n;
      }).map((o) => o.x);
  }
  function rzUsable(s) {
    return !!s && typeof s.en === 'string' && countWords(s.en) >= 4 && typeof s.ja === 'string' && s.ja.trim() !== '' && s.i != null;
  }
  function rzKey(lid, i) { return String(lid) + ':' + i; }
  function getRz() {
    const d = C1.store.get('speak.radio', {});
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  }
  function rzBox(e) { return e && typeof e.box === 'number' && isFinite(e.box) ? Math.max(0, Math.min(RZ_TOP, Math.round(e.box))) : 0; }
  function addDays(ymd, n) {
    const d = new Date(String(ymd) + 'T00:00:00Z');
    if (isNaN(d.getTime())) return String(ymd);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  /* session order: due reviews (earliest first), then new sentences of started lessons (oldest lesson first), then other lessons */
  function rzPick(lessons, st, today, n) {
    const due = [], freshStarted = [], freshOther = [];
    lessons.forEach((L) => L.sentences.forEach((s) => {
      if (!rzUsable(s)) return;
      const it = { L: L, s: s, key: rzKey(L.id, s.i) };
      const e = st[it.key];
      if (e && typeof e === 'object') {
        it.due = typeof e.due === 'string' ? e.due : '';
        if (it.due <= today) due.push(it);
      } else (L.started ? freshStarted : freshOther).push(it);
    }));
    due.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : rzBox(st[a.key]) - rzBox(st[b.key])));
    return due.concat(freshStarted, freshOther).slice(0, n);
  }
  /* when nothing is due or new: seen sentences, the soonest due first */
  function rzAhead(lessons, st, n) {
    const out = [];
    lessons.forEach((L) => L.sentences.forEach((s) => {
      if (!rzUsable(s)) return;
      const key = rzKey(L.id, s.i);
      if (st[key] && typeof st[key] === 'object') out.push({ L: L, s: s, key: key, due: String(st[key].due || '') });
    }));
    out.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
    return out.slice(0, n);
  }
  /* g: 'ok' (言えた) → next box; 'close' (惜しい) → same box; 'miss' (言えなかった) → box 0, due today */
  function rzGrade(key, g, today) {
    const st = getRz();
    const e = st[key] && typeof st[key] === 'object' ? st[key] : null;
    let box = rzBox(e);
    if (g === 'ok') box = Math.min(RZ_TOP, box + 1);
    else if (g === 'miss') box = 0;
    const seen = (e && typeof e.seen === 'number' && isFinite(e.seen) ? e.seen : 0) + 1;
    st[key] = { box: box, due: g === 'miss' ? today : addDays(today, RZ_DAYS[box]), seen: seen };
    C1.store.set('speak.radio', st);
    return st[key];
  }
  function rzLongCount() {
    const st = getRz();
    return Object.keys(st).filter((k) => rzBox(st[k]) >= RZ_LONG).length;
  }
  /* hint level 1: first two words; level 2: plus every other word's first letter */
  function rzHint(en, lv) {
    const w = String(en || '').split(/\s+/).filter(Boolean);
    if (lv < 2) return w.slice(0, 2).join(' ') + (w.length > 2 ? ' …' : '');
    return w.map((x, i) => {
      if (i < 2) return x;
      const m = x.match(/^([^A-Za-z0-9]*)([A-Za-z0-9])([A-Za-z0-9'’-]*)/);
      return m ? m[1] + m[2] + '_'.repeat(Math.max(1, m[3].length)) : x;
    }).join(' ');
  }
  /* LCS word diff: which answer words were typed, which typed words are extra */
  function wordDiff(answer, typed) {
    const A = String(answer || '').split(/\s+/).filter(Boolean).slice(0, 80);
    const B = String(typed || '').split(/\s+/).filter(Boolean).slice(0, 80);
    const a = A.map(norm), b = B.map(norm);
    const n = a.length, m = b.length;
    const dp = [];
    for (let i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] && a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
    const am = a.map((x) => !x), bm = b.map((x) => !x); // punctuation-only tokens are neutral
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] && a[i] === b[j]) { am[i] = true; bm[j] = true; i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++;
    }
    const words = a.filter(Boolean).length;
    return {
      a: A.map((w, k) => ({ w: w, ok: am[k] })),
      b: B.map((w, k) => ({ w: w, ok: bm[k] })),
      hit: dp[0] ? dp[0][0] : 0,
      words: words,
    };
  }

  /* small play/stop toggle for a passage */
  function playButton(text, rate, label, cls) {
    const b = el('button', { type: 'button', class: cls || 'btn' }, label);
    b.addEventListener('click', () => {
      if (b.dataset.on === '1') { C1.stopSpeaking(); return; }
      b.dataset.on = '1';
      b.textContent = '停止する';
      C1.speak(text, { rate: rate }).then(() => {
        b.dataset.on = '';
        b.textContent = label;
      });
    });
    return b;
  }

  /* ---------- module ---------- */
  function render(container) {
    ensureStyle();
    const cfg = stageCfg();
    let tab = 'speech';
    let tick = null;
    let dict = null;
    let capsHook = null;
    let alive = true;

    /* speech state */
    let phase = 'idle'; // idle | prep | ready | speak | review
    let challenge = false; // stage 1: C1 prompt; stage 2: B2 review prompt
    let prompt = todaysPrompt(cfg.lv);
    let frame = null;
    let dur = C1.store.get('speak.dur', 60) === 120 ? 120 : 60;
    let transcript = '';
    let usedDict = false;
    let startAt = 0;
    let rec = null;
    let curTa = null;
    let curPartial = null;
    let onTranscript = null;
    let onDictEnd = null;
    let saveTimer = null;
    let aiPending = null; // rec.id while an AI request is in flight
    let fbRedraw = null; // redraws the feedback box of the review currently on screen

    /* drill state */
    let drill = null; // {f, queue, total, ok, miss, activeMs, last}
    let drillLv = cfg.lv;

    /* 瞬間英作文 state */
    let rzS = null; // { queue, total, ok, close, miss, reps, activeMs, cardAt }
    let rzFilter = String(C1.store.get('speak.radioLesson', 'all'));
    let rzRate = C1.store.get('speak.radioRate', cfg.stage === 1 ? 0.8 : 1) === 0.8 ? 0.8 : 1;
    let rzToken = 0; // invalidates pending prepare() results of a card that is gone
    let playSeq = 0;

    function recommendedFrame(p) { return frameById(cfg.stage === 1 ? 'prep' : TYPE_FRAME[p && p.type]); }
    frame = recommendedFrame(prompt);

    function clearTick() { if (tick) { clearInterval(tick); tick = null; } }
    function stopDict() {
      const d = dict;
      dict = null;
      if (d) { try { d.stop(); } catch (e) { /* ignore */ } }
      if (curPartial) curPartial.textContent = '';
    }
    function flushSave() {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; if (rec) saveRecord(rec); }
    }
    function flushDrill() {
      if (drill && drill.activeMs > 0) {
        C1.logActivity('speaking', Math.round(drill.activeMs / 6000) / 10);
        drill.activeMs = 0;
      }
    }
    function abandonSpeech() {
      // leaving mid-speech: still credit the time actually spoken
      if (phase === 'speak' && startAt) {
        const s = Math.min(dur, (Date.now() - startAt) / 1000);
        if (s >= 5) C1.logActivity('speaking', Math.round(s / 6) / 10);
      }
      if (phase === 'prep' || phase === 'ready' || phase === 'speak') phase = 'idle';
      startAt = 0;
    }
    function rzStopAudio() {
      playSeq++;
      rzCall('stop');
      try { C1.stopSpeaking(); } catch (e) { /* ignore */ }
    }
    /* close the current card's timer: real elapsed time, at most 60 s per card */
    function rzCloseCard() {
      if (rzS && rzS.cardAt) {
        rzS.activeMs += Math.min(RZ_CARD_MS, Math.max(0, Date.now() - rzS.cardAt));
        rzS.cardAt = 0;
      }
    }
    function flushRadio() {
      rzCloseCard();
      if (rzS && rzS.activeMs > 0) {
        C1.logActivity('speaking', Math.round(rzS.activeMs / 6000) / 10);
        rzS.activeMs = 0;
      }
    }
    function leave() {
      clearTick();
      stopDict();
      C1.stopSpeaking();
      rzStopAudio();
      rzToken++;
      abandonSpeech();
      flushSave();
      flushDrill();
      flushRadio();
      rzS = null;
      drill = null;
      capsHook = null;
      fbRedraw = null;
      curTa = null; curPartial = null; onTranscript = null; onDictEnd = null;
    }

    const body = el('div', { class: 'stack loose' });
    const segBtns = {};
    const TABS = [['speech', '1分スピーチ'], ['radio', '瞬間英作文'], ['drill', 'フレーズ特訓'], ['log', '記録']];
    TABS.forEach((t) => {
      segBtns[t[0]] = el('button', { type: 'button', 'aria-pressed': 'false', onclick: () => setTab(t[0]) }, t[1]);
    });
    const seg = el('div', { class: 'seg speak-seg', role: 'group', 'aria-label': '練習の種類' });
    /* the 瞬間英作文 tab exists only while the bridge has lessons */
    function syncTabs() {
      const on = rzOn();
      seg.innerHTML = '';
      TABS.forEach((t) => { if (t[0] !== 'radio' || on) add(seg, segBtns[t[0]]); });
      return on;
    }
    syncTabs();
    add(container, 
      el('h1', { class: 'h1' }, 'スピーキング'),
      el('p', { class: 'muted small' }, cfg.stage === 1
        ? '身近な話題について、意見と理由を1分間話す練習です。B2では、考えを順序立てて、止まらずに話し続ける力が求められます。'
        : '複雑な話題を、構成を保ったまま止まらずに話す練習です。C1では、言葉を探す様子を見せずに話し続ける力が求められます。'),
      seg, body);

    function setTab(t) {
      leave();
      tab = t;
      Object.keys(segBtns).forEach((k) => segBtns[k].setAttribute('aria-pressed', k === t ? 'true' : 'false'));
      show();
    }
    function show() {
      body.innerHTML = '';
      if (tab === 'speech') {
        if (phase === 'review' && rec) renderReview(); else renderIdle();
      } else if (tab === 'radio') renderRadioHome();
      else if (tab === 'drill') renderDrillHome();
      else renderLog();
    }

    /* ---------- shared bits ---------- */
    function starterOf(s) { return cfg.stage === 1 && s.easy ? s.easy : s.starter; }
    function frameSteps(f) {
      return el('div', { class: 'speak-steps' }, (f.steps || []).map((s) =>
        el('div', { class: 'speak-step' },
          el('div', { class: 'small muted' }, s.label),
          el('div', { class: 'en' }, starterOf(s)))));
    }
    function appendFinal(text) {
      text = String(text || '').trim();
      if (!text) return;
      if (curTa) transcript = curTa.value;
      transcript = (transcript ? transcript.replace(/\s+$/, '') + ' ' : '') + text;
      if (curTa) { curTa.value = transcript; curTa.scrollTop = curTa.scrollHeight; }
      if (curPartial) curPartial.textContent = '';
      if (onTranscript) onTranscript();
    }
    /* MUST run synchronously inside a click handler */
    function startDict() {
      stopDict();
      let session = null;
      session = C1.listen({
        onPartial: (t) => { if (alive && curPartial) curPartial.textContent = String(t || ''); },
        onFinal: (t) => { if (alive) appendFinal(t); },
        onEnd: () => {
          if (dict === session) dict = null;
          if (!alive) return;
          if (curPartial) curPartial.textContent = '';
          if (onDictEnd) onDictEnd();
        },
      });
      dict = session;
      if (session) usedDict = true;
      return !!session;
    }

    /* ---------- 1) speech: idle ---------- */
    function renderIdle() {
      phase = 'idle';
      body.innerHTML = '';
      capsHook = null;
      fbRedraw = null;
      if (!prompt || !frame) {
        add(body, el('div', { class: 'card' }, el('p', null, 'お題を読み込めませんでした。ページを再読み込みしてください。')));
        return;
      }
      const jaBox = el('div');
      if (cfg.stage === 1) add(jaBox, el('p', { class: 'muted small' }, prompt.ja));
      else {
        add(jaBox, el('button', { type: 'button', class: 'btn sm ghost', onclick: () => {
          jaBox.innerHTML = '';
          add(jaBox, el('p', { class: 'muted small' }, prompt.ja));
        } }, '日本語訳を見る'));
      }

      const altLv = cfg.alt;
      const chalBox = el('input', { type: 'checkbox', onchange: () => {
        challenge = chalBox.checked;
        prompt = todaysPrompt(challenge ? altLv : cfg.lv) || prompt;
        frame = recommendedFrame(prompt);
        renderIdle();
      } });
      chalBox.checked = challenge;
      const chalLabel = el('label', { class: 'speak-check small' }, chalBox,
        el('span', null, cfg.stage === 1 ? 'C1に挑戦(上級のお題を出す)' : 'B2のお題で復習する'));

      const todayDone = getHistory().some((r) => r.date === C1.today());
      const qCard = el('div', { class: 'card' },
        el('div', { class: 'row between' },
          el('div', { class: 'row' },
            el('span', { class: 'label' }, '今日のお題'),
            lvChip(lvOf(prompt)),
            el('span', { class: 'chip accent' }, TYPE_JA[prompt.type] || ''),
            todayDone ? el('span', { class: 'chip good' }, '今日は完了') : null),
          el('button', { type: 'button', class: 'btn sm', onclick: nextPrompt }, '別のお題')),
        el('p', { class: 'speak-q' }, prompt.q),
        jaBox,
        el('details', { class: 'fold', open: cfg.stage === 1 },
          el('summary', null, 'アイデアと語彙のヒント'),
          el('div', { class: 'stack' },
            el('div', { class: 'small muted' }, '話の切り口'),
            el('ul', { class: 'plain en', style: { fontSize: '15.5px' } }, (prompt.angles || []).map((a) => el('li', null, a))),
            el('div', { class: 'small muted' }, '使ってみたい表現'),
            el('div', { class: 'row' }, (prompt.vocab || []).map((v) => el('span', { class: 'chip gold speak-chipwrap' }, v))),
            rzSpeechHint())),
        chalLabel);

      const frameBox = el('div', { class: 'stack' });
      function drawFrame() {
        frameBox.innerHTML = '';
        const rf = recommendedFrame(prompt);
        add(frameBox, 
          el('div', { class: 'row between' },
            el('span', { class: 'label' }, frame === rf ? 'おすすめの型' : '話の型'),
            el('button', { type: 'button', class: 'btn sm ghost', onclick: () => {
              const i = DATA.frames.indexOf(frame);
              frame = DATA.frames[(i + 1) % DATA.frames.length];
              drawFrame();
            } }, '別の型にする')),
          el('h2', { class: 'h2' }, frame.name),
          el('p', { class: 'small muted' }, frame.ja),
          frameSteps(frame));
        if (cfg.stage === 1) add(frameBox, el('p', { class: 'small muted' }, '各ステップの出だしをそのまま使って話し始めましょう。'));
      }
      drawFrame();

      const durBtns = [60, 120].map((d) => el('button', { type: 'button', 'aria-pressed': String(d === dur), onclick: () => {
        dur = d;
        C1.store.set('speak.dur', d);
        durBtns.forEach((b, i) => b.setAttribute('aria-pressed', String([60, 120][i] === dur)));
      } }, d === 60 ? '1分' : '2分'));

      add(body, 
        qCard,
        el('div', { class: 'card' }, frameBox),
        el('div', { class: 'card' },
          el('div', { class: 'row between' },
            el('span', { class: 'label' }, '話す時間'),
            el('div', { class: 'seg', style: { minWidth: '140px' } }, durBtns)),
          el('p', { class: 'small muted' }, '目安の速さ: 1分あたり ' + cfg.wpmLo + '〜' + cfg.wpmHi + ' 語(' + cfg.target + ')'),
          el('button', { type: 'button', class: 'btn primary block', onclick: startPrep }, '準備' + cfg.prep + '秒から始める'),
          el('button', { type: 'button', class: 'btn block', onclick: goReady }, '準備なしで話す')));
    }
    function nextPrompt() {
      const off = C1.store.get('speak.offset', null);
      const n = off && off.date === C1.today() && typeof off.n === 'number' ? off.n + 1 : 1;
      C1.store.set('speak.offset', { date: C1.today(), n: n });
      prompt = todaysPrompt(challenge ? cfg.alt : cfg.lv) || prompt;
      frame = recommendedFrame(prompt);
      renderIdle();
    }

    /* ---------- prep countdown ---------- */
    function startPrep() {
      clearTick();
      phase = 'prep';
      capsHook = null;
      body.innerHTML = '';
      const end = Date.now() + cfg.prep * 1000;
      const count = el('div', { class: 'speak-count', 'aria-live': 'off' }, String(cfg.prep));
      add(body, 
        el('div', { class: 'card' },
          el('span', { class: 'label' }, '準備時間'),
          count,
          el('p', { class: 'small muted', style: { textAlign: 'center' } }, cfg.stage === 1
            ? '意見・理由・例を1つずつ決めて、出だしの英語を小さく声に出してみましょう。'
            : '型に沿って、各ステップの出だしを頭の中で言ってみましょう。'),
          el('button', { type: 'button', class: 'btn primary block', onclick: goReady }, '準備を終えて話す')),
        el('div', { class: 'card' },
          el('p', { class: 'en speak-wrap' }, prompt.q),
          cfg.stage === 1 ? el('p', { class: 'small muted' }, prompt.ja) : null,
          el('hr', { class: 'divider' }),
          frameSteps(frame)));
      tick = setInterval(() => {
        if (phase !== 'prep') { clearTick(); return; }
        const left = (end - Date.now()) / 1000;
        count.textContent = String(Math.max(0, Math.ceil(left)));
        if (left <= 0) goReady();
      }, 200);
      window.scrollTo(0, 0);
    }

    /* dictation needs a tap, so when it is available the timer starts from a button */
    function goReady(ev) {
      clearTick();
      if (!C1.canDictate()) { startSpeak(false); return; }
      phase = 'ready';
      function draw() {
        body.innerHTML = '';
        const can = C1.canDictate();
        add(body, el('div', { class: 'card' },
          el('span', { class: 'label' }, '準備完了'),
          el('p', { class: 'en speak-wrap' }, prompt.q),
          el('p', { class: 'small muted' }, can
            ? 'ボタンを押すとタイマーが始まります。音声入力を使うと、話した内容が文字になり、語数やフィードバックに使えます。'
            : 'ボタンを押すとタイマーが始まります。'),
          can ? el('button', { type: 'button', class: 'btn primary block', onclick: () => startSpeak(true) }, '音声で話す') : null,
          el('button', { type: 'button', class: 'btn block' + (can ? '' : ' primary'), onclick: () => startSpeak(false) }, 'タイマーだけで話す')));
      }
      draw();
      // capability lost: redraw instead of starting the timer behind the learner's back
      capsHook = () => { if (phase === 'ready') draw(); };
      if (ev) window.scrollTo(0, 0);
    }

    /* ---------- speaking timer ---------- */
    function startSpeak(withDict) {
      clearTick();
      capsHook = null;
      phase = 'speak';
      transcript = '';
      usedDict = false;
      rec = null;
      // drop references to any earlier review screen so its text cannot leak into this speech
      curTa = null; curPartial = null; onTranscript = null;
      body.innerHTML = '';
      const dictOn = withDict ? startDict() : false; // synchronous inside the click
      if (withDict && !dictOn) C1.toast('音声入力を開始できませんでした');

      const count = el('div', { class: 'speak-count', role: 'timer' }, fmtTime(dur));
      const bar = el('i', { style: { width: '0%' } });
      const card = el('div', { class: 'card' },
        el('div', { class: 'row between' },
          el('span', { class: 'label' }, 'スピーチ中'),
          el('span', { class: 'chip' }, dur === 60 ? '1分' : '2分')),
        count,
        el('div', { class: 'progress' }, bar));

      const dictBox = el('div', { class: 'stack tight' });
      function drawDict() {
        dictBox.innerHTML = '';
        if (!withDict) {
          add(dictBox, el('p', { class: 'small muted', style: { textAlign: 'center' } }, '声に出して話しましょう。終わったあとで、話した内容を入力できます。'));
          return;
        }
        curTa = el('textarea', { class: 'textarea', 'aria-label': '話した内容', placeholder: '話した内容がここに表示されます' });
        curTa.addEventListener('input', () => { transcript = curTa.value; });
        curTa.value = transcript;
        curPartial = el('div', { class: 'speak-partial small' });
        add(dictBox, curTa, curPartial);
        if (dict) add(dictBox, el('p', { class: 'small muted' }, '音声入力中です。'));
        else if (C1.canDictate()) {
          add(dictBox, el('div', { class: 'row' },
            el('span', { class: 'small muted grow' }, '音声入力が止まりました。'),
            el('button', { type: 'button', class: 'btn sm', onclick: () => { startDict(); drawDict(); } }, '音声入力を再開')));
        } else add(dictBox, el('p', { class: 'small muted' }, '音声入力は使えません。そのまま声に出して続けましょう。'));
      }
      onDictEnd = () => { if (phase === 'speak') drawDict(); };
      drawDict();
      add(card, dictBox, el('button', { type: 'button', class: 'btn primary block', onclick: finish }, '終了する'));

      add(body, card,
        el('div', { class: 'card sunken' },
          el('p', { class: 'en speak-wrap' }, prompt.q),
          frameSteps(frame)));

      startAt = Date.now();
      tick = setInterval(() => {
        if (phase !== 'speak') { clearTick(); return; }
        const elapsed = (Date.now() - startAt) / 1000;
        const left = dur - elapsed;
        count.textContent = fmtTime(left);
        count.classList.toggle('low', left <= 10);
        bar.style.width = Math.min(100, elapsed / dur * 100) + '%';
        if (left <= 0) finish();
      }, 200);
      window.scrollTo(0, 0);
    }

    function finish() {
      if (phase !== 'speak') return;
      clearTick();
      const secs = Math.max(1, Math.min(dur, Math.round((Date.now() - startAt) / 1000)));
      startAt = 0;
      if (curTa) transcript = curTa.value;
      phase = 'review';
      const d = dict; // let late final results still arrive, then close
      dict = null;
      onDictEnd = null;
      if (d) { try { d.stop(); } catch (e) { /* ignore */ } }
      if (secs >= 5) C1.logActivity('speaking', Math.round(secs / 6) / 10);
      rec = {
        id: Date.now(), date: C1.today(), pid: prompt.id, lv: lvOf(prompt), stage: cfg.stage, q: prompt.q, secs: secs,
        dictated: usedDict, text: '', words: 0, wpm: null, phrases: 0, level: '', self: null, selfMax: cfg.checks.length,
      };
      syncRecord(true);
      renderReview();
      window.scrollTo(0, 0);
    }
    function syncRecord(save) {
      if (!rec) return;
      const words = countWords(transcript);
      rec.text = transcript.trim().slice(0, 6000);
      rec.words = words;
      rec.wpm = words > 0 && rec.secs >= 5 ? Math.round(words / (rec.secs / 60)) : null;
      rec.phrases = detectPhrases(transcript).length;
      if (save) { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; } saveRecord(rec); }
      else {
        if (saveTimer) clearTimeout(saveTimer);
        const mine = rec;
        saveTimer = setTimeout(() => { saveTimer = null; saveRecord(mine); }, 600);
      }
    }

    /* ---------- review ---------- */
    function renderReview() {
      body.innerHTML = '';
      onDictEnd = null;
      const checks = (rec.stage === 1 ? CHECKS_B2 : rec.stage === 2 ? CHECKS_C1 : cfg.checks);
      const prev = getHistory().find((r) => r.pid === rec.pid && r.id !== rec.id && r.id < rec.id);
      const src = promptById(rec.pid);

      const statsBox = el('div', { class: 'stack' });
      function drawStats() {
        statsBox.innerHTML = '';
        const found = detectPhrases(transcript);
        const stat = (label, value, note) => el('div', { class: 'speak-stat' },
          el('span', { class: 'small muted' }, label), el('span', { class: 'num' }, value), note ? el('span', { class: 'small muted' }, note) : null);
        const grid = el('div', { class: 'speak-stats' }, stat('話した時間', fmtTime(rec.secs)));
        if (rec.words > 0) {
          const inRange = rec.wpm != null && rec.wpm >= cfg.wpmLo && rec.wpm <= cfg.wpmHi;
          add(grid, 
            stat('語数', String(rec.words)),
            stat('1分あたりの語数', rec.wpm != null ? String(rec.wpm) : '–', cfg.target + 'の目安 ' + cfg.wpmLo + '〜' + cfg.wpmHi + (inRange ? '(達成)' : '')),
            stat('機能フレーズ', String(found.length), '特訓フレーズの使用数'));
        }
        add(statsBox, grid);
        if (rec.words > 0 && !rec.dictated) add(statsBox, el('p', { class: 'small muted' }, '要約を入力した場合、1分あたりの語数は参考値です。'));
        if (found.length) add(statsBox, el('div', { class: 'row' }, found.map((p) => el('span', { class: 'chip good speak-chipwrap' }, p.en))));
      }
      /* the plain "what you achieved" lines at the top of the result */
      const winBox = el('div', { class: 'stack tight' });
      function drawWin() {
        winBox.innerHTML = '';
        let line = secsJa(rec.secs) + '、英語で話しました。';
        if (rec.words > 0) line += rec.words + '語' + (rec.wpm != null ? '、1分あたり ' + rec.wpm + ' 語' : '') + 'です。';
        add(winBox, el('p', { style: { fontWeight: '600' } }, line));
        let cmp = '';
        const first = rec.wpm != null ? oldestWithWpm(rec.id) : null;
        if (prev && prev.wpm != null && rec.wpm != null) {
          const dW = rec.wpm - prev.wpm;
          cmp = dW > 0 ? '同じお題の前回より 1分あたり ' + dW + ' 語多く話せています。'
            : dW === 0 ? '同じお題の前回と同じペースで話せています。'
              : '同じお題の前回は ' + prev.wpm + ' 語/分でした。くり返すほど言葉が出やすくなります。';
        } else if (prev && Number(prev.secs) > 0 && rec.secs > Number(prev.secs)) {
          cmp = '同じお題の前回より ' + (rec.secs - Number(prev.secs)) + '秒 長く話せました。';
        } else if (first && rec.wpm != null) {
          const dF = rec.wpm - first.wpm;
          cmp = dF > 0 ? '最初のスピーチ(' + first.wpm + ' 語/分)より ' + dF + ' 語/分 伸びています。'
            : '最初のスピーチは ' + first.wpm + ' 語/分でした。続けるほど数字は動きます。';
        } else if (!getHistory().some((r) => r.id !== rec.id)) {
          cmp = '最初の記録です。ここが出発点になります。';
        }
        if (cmp) add(winBox, el('p', { class: 'small' }, cmp));
      }

      curTa = el('textarea', { class: 'textarea', 'aria-label': '話した内容', placeholder: cfg.stage === 1 ? 'In my opinion, …' : 'I would argue that …' });
      curTa.addEventListener('input', () => { transcript = curTa.value; changed(); });
      curTa.value = transcript;
      curPartial = null;
      const fbBox = el('div', { class: 'stack' });
      function changed() {
        syncRecord(false);
        drawWin();
        drawStats();
        if (!rec.fb && aiPending !== rec.id) drawFeedback();
      }
      onTranscript = changed;

      /* --- model answer (B2 prompts carry a sample) --- */
      const sampleBox = el('div', { class: 'stack' });
      function drawSample() {
        sampleBox.innerHTML = '';
        if (!src || !src.sample) return;
        const inner = el('div', { class: 'stack' },
          el('p', { class: 'en speak-wrap' }, src.sample),
          C1.canSpeak() ? playButton(src.sample, cfg.rate, 'モデル回答を聞く') : null,
          el('p', { class: 'small muted' }, '自分の答えと比べて、使える表現を1つ選び、もう一度話してみましょう。'));
        if (cfg.stage === 1) {
          add(sampleBox, el('div', { class: 'row between' }, el('span', { class: 'label' }, 'モデル回答'), lvChip('B2')), inner);
        } else {
          add(sampleBox, el('details', { class: 'fold', style: { borderTop: '0', paddingTop: '0' } },
            el('summary', null, 'B2のモデル回答'), inner));
        }
      }

      /* --- feedback area: AI button, or self-check --- */
      function checklist() {
        const picked = checks.map((c, i) => !!(Array.isArray(rec.selfItems) && rec.selfItems[i]));
        const score = el('span', { class: 'num' }, '');
        const upd = () => {
          const n = picked.filter(Boolean).length;
          score.textContent = n + ' / ' + checks.length;
          rec.self = n; rec.selfMax = checks.length; rec.selfItems = picked.slice();
          saveRecord(rec);
        };
        const box = el('div', { class: 'stack tight' },
          el('div', { class: 'row between' }, el('span', { class: 'label' }, 'セルフチェック'), score),
          checks.map((c, i) => {
            const input = el('input', { type: 'checkbox' });
            input.checked = picked[i];
            input.addEventListener('change', () => { picked[i] = input.checked; upd(); });
            return el('label', { class: 'speak-check' }, input, el('span', null, c));
          }));
        score.textContent = picked.filter(Boolean).length + ' / ' + checks.length;
        return box;
      }
      function drawFeedback(errMsg) {
        fbBox.innerHTML = '';
        if (rec.fb) { drawAI(rec.fb); return; }
        if (aiPending === rec.id) { add(fbBox, el('p', { class: 'muted' }, '考え中…')); return; }
        if (errMsg) add(fbBox, el('p', { class: 'small ng' }, errMsg));
        if (C1.canAsk()) {
          const enough = rec.words >= 8;
          add(fbBox, 
            el('button', { type: 'button', class: 'btn primary block', disabled: !enough, onclick: askAI }, 'AIフィードバック'),
            enough ? null : el('p', { class: 'small muted' }, '話した内容を英語で入力すると、AIフィードバックを受けられます。'));
          if (errMsg || !enough) add(fbBox, checklist());
        } else add(fbBox, checklist());
      }
      fbRedraw = (errMsg) => { if (fbBox.isConnected) drawFeedback(errMsg); };

      function buildPrompt(mine, text) {
        const s1 = cfg.stage === 1;
        const tgt = cfg.target;
        return [
          'You are a friendly, experienced English speaking coach. The learner is a Japanese adult whose current CEFR speaking level is ' + cfg.now + '; their goal right now is to reach ' + tgt + '.',
          'They gave a spoken monologue of about ' + mine.secs + ' seconds in answer to the question below (a ' + mine.lv + '-level question).',
          mine.dictated
            ? 'The transcript was produced by speech recognition' + (mine.wpm != null ? ' (speaking rate about ' + mine.wpm + ' words per minute)' : '') + ', so ignore punctuation, capitalisation and obvious recognition errors.'
            : 'The transcript was typed by the learner from memory after speaking, so it may be a summary; ignore typos.',
          s1
            ? 'Judge it as a step from B1 towards B2: a clear opinion, reasons and an example, simple linking words, grammar errors that block meaning, and fluency. Focus on the most useful 2-4 points. Be kind but honest; do not flatter.'
            : 'Judge it as a step from B2 towards C1: range and precision of language, structure and coherence, hedging, and flexibility. Be honest and specific; do not flatter.',
          'All Japanese text must be simple, plain Japanese (short sentences, everyday words, です/ます), easy for a ' + cfg.now + ' learner to read.',
          '',
          'Question: ' + mine.q,
          '',
          'Transcript:',
          '"""',
          text,
          '"""',
          '',
          'Reply with ONLY one JSON object, no markdown, no comments, with exactly these keys:',
          '- "level": your estimate of the CEFR level shown in this answer, one of "A2", "B1", "B1+", "B2", "B2+", "C1", "C2".',
          '- "strengths": an array of 2 short strings in simple Japanese, each naming one specific thing the learner did well.',
          '- "fixes": an array of up to 4 objects {"original": an exact phrase or sentence quoted from the transcript, "better": a corrected, natural ' + tgt + '-level English version' + (s1 ? ' (clear B2 English with common words, not advanced C1 idioms)' : '') + ', "why": one short sentence in simple Japanese explaining the change}.',
          '- "upgraded": a ' + tgt + '-level model version of the learner\'s own answer in English, keeping the same ideas and position, about ' + cfg.upWords + ' words, natural spoken style' +
            (s1 ? ', clear structure (opinion, reason, example, conclusion) and simple linking words such as "The main reason is", "For example", "On the other hand". Use B2 English, NOT C1: avoid rare idioms and long complex sentences.' : ', with clear signposting and some hedging.'),
          '- "next": one sentence in simple Japanese saying what the learner should practise next.',
        ].join('\n');
      }
      function askAI() {
        if (aiPending || !C1.canAsk()) return;
        syncRecord(true);
        const mine = rec;
        aiPending = mine.id;
        fbBox.innerHTML = '';
        const wait = el('p', { class: 'muted' }, '考え中…');
        add(fbBox, wait);
        const text = transcript.trim().slice(0, 4000);
        let first = true;
        let req;
        try {
          req = C1.ask(buildPrompt(mine, text), { json: true, onText: () => { if (first) { first = false; wait.textContent = 'フィードバックを作成中…'; } } });
        } catch (e) { req = Promise.reject(e); }
        Promise.resolve(req).then((res) => {
          const fb = cleanFeedback(res);
          if (!fb) throw { code: 'invalid_json' };
          aiPending = null;
          mine.fb = fb;
          mine.level = fb.level;
          saveRecord(mine);
          if (alive && rec === mine && fbRedraw) fbRedraw();
        }).catch((e) => {
          aiPending = null;
          if (alive && rec === mine && fbRedraw) fbRedraw(C1.aiErrorMessage(e));
        });
      }
      function drawAI(fb) {
        fbBox.innerHTML = '';
        add(fbBox, el('div', { class: 'row between' },
          el('span', { class: 'label' }, 'AIフィードバック'),
          fb.level ? el('span', { class: 'chip accent' }, '推定レベル ' + fb.level) : null));
        if (fb.strengths.length) {
          add(fbBox, el('div', { class: 'small muted' }, '良かった点'),
            el('ul', { class: 'plain' }, fb.strengths.map((s) => el('li', { class: 'speak-wrap' }, s))));
        }
        if (fb.fixes.length) {
          add(fbBox, el('div', { class: 'small muted' }, '直したい表現'));
          fb.fixes.forEach((f) => {
            add(fbBox, el('div', { class: 'feedback stack tight', style: { whiteSpace: 'normal' } },
              el('div', { class: 'en', style: { fontSize: '15.5px' } }, el('mark', { class: 'ng' }, f.original)),
              el('div', { class: 'en', style: { fontSize: '15.5px' } }, el('mark', { class: 'ok' }, f.better)),
              f.why ? el('div', { class: 'small' }, f.why) : null));
          });
        }
        if (fb.upgraded) {
          add(fbBox, el('div', { class: 'small muted' }, 'あなたの答えの' + cfg.target + '版'),
            el('p', { class: 'en speak-wrap' }, fb.upgraded),
            C1.canSpeak() ? playButton(fb.upgraded, cfg.rate, '改善版を聞く') : null);
        }
        if (fb.next) add(fbBox, el('div', { class: 'feedback', style: { whiteSpace: 'normal' } }, el('span', { class: 'small muted' }, '次の練習 '), fb.next));
      }

      drawWin();
      drawStats();
      drawSample();
      drawFeedback();
      capsHook = () => { if (phase === 'review') { drawSample(); if (!rec.fb && aiPending !== rec.id) drawFeedback(); } };

      // speaking time was logged in finish(), so the card reflects it
      let next = null;
      if (C1.engage && C1.engage.nextCard) { try { next = C1.engage.nextCard('speaking'); } catch (e) { next = null; } }
      add(body,
        el('div', { class: 'card' },
          el('span', { class: 'label' }, '結果'),
          winBox,
          el('p', { class: 'en speak-wrap' }, rec.q),
          statsBox),
        next,
        el('div', { class: 'card' },
          el('span', { class: 'label' }, '話した内容'),
          el('p', { class: 'small muted' }, rec.dictated ? '聞き取りの誤りがあれば直してください。' : '話した内容(または要約)を英語で入力すると、語数の確認とフィードバックに使えます。'),
          curTa),
        src && src.sample ? el('div', { class: 'card' }, sampleBox) : null,
        el('div', { class: 'card' }, fbBox),
        el('div', { class: 'card' },
          el('p', { class: 'small' }, '同じお題をもう一度話すことが、流暢さを伸ばす最も効果的な練習です。'),
          el('button', { type: 'button', class: 'btn primary block', onclick: () => { C1.stopSpeaking(); syncRecord(true); renderIdleKeep(); } }, 'もう一度同じお題で'),
          el('button', { type: 'button', class: 'btn block', onclick: () => { C1.stopSpeaking(); syncRecord(true); clearReviewRefs(); nextPrompt(); window.scrollTo(0, 0); } }, '別のお題へ')));
    }
    function clearReviewRefs() {
      stopDict();
      curTa = null; curPartial = null; onTranscript = null; fbRedraw = null;
      phase = 'idle';
    }
    function renderIdleKeep() {
      clearReviewRefs();
      renderIdle();
      window.scrollTo(0, 0);
    }
    function cleanFeedback(res) {
      if (typeof res === 'string') {
        const m = res.replace(/```(?:json)?/gi, '').match(/\{[\s\S]*\}/);
        try { res = m ? JSON.parse(m[0]) : null; } catch (e) { res = null; }
      }
      if (res && typeof res === 'object' && !Array.isArray(res) && !('upgraded' in res) && res.feedback && typeof res.feedback === 'object') res = res.feedback;
      if (!res || typeof res !== 'object' || Array.isArray(res)) return null;
      const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
      const lv = str(res.level, 8).toUpperCase().replace(/\s+/g, '');
      const fb = {
        level: LEVELS.indexOf(lv) >= 0 ? lv : '',
        strengths: (Array.isArray(res.strengths) ? res.strengths : []).map((s) => str(s, 300)).filter(Boolean).slice(0, 3),
        fixes: (Array.isArray(res.fixes) ? res.fixes : []).filter((f) => f && typeof f === 'object')
          .map((f) => ({ original: str(f.original, 400), better: str(f.better, 400), why: str(f.why, 400) }))
          .filter((f) => f.original && f.better).slice(0, 4),
        upgraded: str(res.upgraded, 2500),
        next: str(res.next, 400),
      };
      if (!fb.strengths.length && !fb.fixes.length && !fb.upgraded) return null;
      return fb;
    }

    /* ---------- 2) phrase drill ---------- */
    function renderDrillHome() {
      body.innerHTML = '';
      capsHook = null;
      const d = getDrill();
      const fns = fnList(drillLv);
      const weakest = fns.slice().sort((a, b) => mastery(d, a.items) - mastery(d, b.items))[0];
      const opts = [['B2', 'B2の基本'], ['C1', 'C1の発展'], ['all', 'すべて']];
      const lvSeg = el('div', { class: 'seg', role: 'group', 'aria-label': 'レベル' }, opts.map((o) =>
        el('button', { type: 'button', 'aria-pressed': String(drillLv === o[0]), onclick: () => { drillLv = o[0]; renderDrillHome(); } }, o[1])));
      const list = el('div', { class: 'stack tight' }, fns.map((f) => {
        const m = mastery(d, f.items);
        return el('button', { type: 'button', class: 'speak-fn', onclick: () => startDrill(f) },
          el('div', { class: 'row between' },
            el('b', null, f.fnJa),
            el('span', { class: 'small muted num' }, f.items.length + '個 ・ ' + m + '%')),
          el('div', { class: 'progress' }, el('i', { style: { width: m + '%' } })));
      }));
      add(body, el('div', { class: 'card' },
        el('h2', { class: 'h2' }, 'フレーズ特訓'),
        el('p', { class: 'small muted' }, cfg.stage === 1
          ? '意見を言う、理由を言う、例を挙げるなどの基本フレーズを、考えなくても口から出るまで練習します。日本語を見て、英語を声に出してください。'
          : '意見を切り出す、和らげる、言い直すなどの決まり文句を、考えなくても口から出るまで練習します。日本語を見て、英語を声に出してください。'),
        lvSeg,
        weakest ? el('button', { type: 'button', class: 'btn primary block', onclick: () => startDrill(weakest) }, 'いちばん弱い機能から始める') : null,
        el('span', { class: 'label' }, '機能を選ぶ(習得度)'),
        fns.length ? list : el('p', { class: 'muted small' }, 'フレーズがありません。')));
    }
    function startDrill(f) {
      flushDrill();
      const d = getDrill();
      const queue = f.items.slice().sort((a, b) => {
        const l = (lvOf(a) === cfg.lv ? 0 : 1) - (lvOf(b) === cfg.lv ? 0 : 1); // stage level first
        if (l) return l;
        const x = boxOf(d, a.id) - boxOf(d, b.id);
        if (x) return x;
        return ((d[a.id] && d[a.id].t) || 0) - ((d[b.id] && d[b.id].t) || 0);
      });
      drill = { f: f, queue: queue, total: queue.length, ok: 0, miss: 0, activeMs: 0, last: Date.now() };
      renderDrillCard();
      window.scrollTo(0, 0);
    }
    function renderDrillCard() {
      body.innerHTML = '';
      C1.stopSpeaking();
      if (!drill) { renderDrillHome(); return; }
      if (!drill.queue.length) { renderDrillDone(); return; }
      const p = drill.queue[0];
      const f = drill.f;
      drill.last = Date.now();
      const cleared = drill.total - new Set(drill.queue.map((x) => x.id)).size;
      const input = el('input', { class: 'input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': '英語のフレーズ(入力は任意)', placeholder: '声に出す(入力してもOK)' });
      const answer = el('div', { class: 'stack' });
      const revealBtn = el('button', { type: 'button', class: 'btn primary block' }, '答えを見る');
      const reveal = () => {
        if (answer.childNodes.length) return;
        revealBtn.remove();
        const typed = norm(input.value);
        const key = phraseKey(p);
        let verdict = null;
        if (typed) {
          verdict = key && typed.indexOf(key) >= 0
            ? el('p', { class: 'small ok' }, '入力は合っています。')
            : el('p', { class: 'small muted' }, '入力と見比べて、言えたかどうかを判断してください。');
        }
        add(answer, 
          el('hr', { class: 'divider' }),
          el('div', { class: 'en-big', style: { fontSize: '22px' } }, p.en),
          verdict,
          el('div', { class: 'feedback en', style: { whiteSpace: 'normal', fontSize: '15.5px' } }, p.ex),
          C1.canSpeak() ? el('div', { class: 'row' },
            el('button', { type: 'button', class: 'btn sm', onclick: () => C1.speak(String(p.en).replace(/…/g, ' '), { rate: cfg.rate }) }, 'フレーズを聞く'),
            el('button', { type: 'button', class: 'btn sm', onclick: () => C1.speak(p.ex, { rate: cfg.rate }) }, '例文を聞く')) : null,
          el('p', { class: 'small muted' }, 'すぐに、つかえずに言えましたか。'),
          el('div', { class: 'btn-grid' },
            el('button', { type: 'button', class: 'btn bad', onclick: () => grade(false) }, '言えなかった'),
            el('button', { type: 'button', class: 'btn good', onclick: () => grade(true) }, '言えた')));
      };
      revealBtn.addEventListener('click', reveal);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); reveal(); } });

      add(body, el('div', { class: 'card' },
        el('div', { class: 'row between' },
          el('div', { class: 'row' }, el('span', { class: 'chip accent' }, f.fnJa), lvChip(lvOf(p))),
          el('span', { class: 'small muted num' }, cleared + ' / ' + drill.total)),
        el('div', { class: 'progress' }, el('i', { style: { width: (drill.total ? cleared / drill.total * 100 : 0) + '%' } })),
        el('p', { class: 'h2', style: { fontSize: '20px' } }, p.ja),
        el('p', { class: 'small muted' }, 'この意味の英語フレーズを声に出してください。'),
        input, revealBtn, answer),
        el('button', { type: 'button', class: 'btn ghost', onclick: () => { flushDrill(); drill = null; renderDrillHome(); } }, '機能の一覧に戻る'));
    }
    function grade(ok) {
      if (!drill || !drill.queue.length) return;
      const now = Date.now();
      drill.activeMs += Math.min(60000, Math.max(0, now - drill.last));
      const p = drill.queue.shift();
      const d = getDrill();
      const box = boxOf(d, p.id);
      d[p.id] = { box: ok ? Math.min(3, box + 1) : 0, t: now };
      C1.store.set('speak.drill', d);
      if (ok) drill.ok++;
      else {
        drill.miss++;
        drill.queue.splice(Math.min(2, drill.queue.length), 0, p); // weak ones come back after two cards
      }
      renderDrillCard();
    }
    function renderDrillDone() {
      const f = drill.f;
      const ok = drill.ok, miss = drill.miss;
      flushDrill();
      drill = null;
      const m = mastery(getDrill(), f.items);
      body.innerHTML = '';
      // drill time was logged by flushDrill() above
      let next = null;
      if (C1.engage && C1.engage.nextCard) { try { next = C1.engage.nextCard('speaking'); } catch (e) { next = null; } }
      add(body, el('div', { class: 'card' },
        el('span', { class: 'label' }, '特訓完了'),
        el('h2', { class: 'h2' }, f.fnJa),
        el('p', null, '言えた ' + ok + ' 回 / 言えなかった ' + miss + ' 回'),
        el('div', { class: 'row between' }, el('span', { class: 'small muted' }, '習得度'), el('span', { class: 'num' }, m + '%')),
        el('div', { class: 'progress' }, el('i', { style: { width: m + '%' } })),
        el('p', { class: 'small muted' }, '次のスピーチで、この機能のフレーズを2つ使ってみましょう。'),
        next,
        el('button', { type: 'button', class: 'btn primary block', onclick: () => startDrill(f) }, 'もう一度'),
        el('button', { type: 'button', class: 'btn block', onclick: renderDrillHome }, '別の機能を選ぶ'),
        el('button', { type: 'button', class: 'btn ghost block', onclick: () => setTab('speech') }, 'スピーチで使ってみる')));
    }

    /* ---------- 瞬間英作文 (imported dialogues) ---------- */
    function rzFiltered(lessons) {
      if (rzFilter === 'all') return lessons;
      const f = lessons.filter((L) => String(L.id) === rzFilter);
      if (f.length) return f;
      rzFilter = 'all';
      return lessons;
    }
    /* 1分スピーチ: two sentences from started lessons, fixed for the day */
    function rzSpeechHint() {
      const pool = [];
      rzLessons().filter((L) => L.started).forEach((L) => L.sentences.forEach((s) => { if (rzUsable(s)) pool.push(s); }));
      if (!pool.length) return null;
      const h = hashStr('radio' + C1.today());
      const i = h % pool.length;
      const pick = [pool[i]];
      if (pool.length > 1) pick.push(pool[(i + 1 + (h >>> 7) % (pool.length - 1)) % pool.length]);
      return el('details', { class: 'fold' },
        el('summary', { class: 'small' }, 'ラジオ英会話の表現を使う'),
        el('div', { class: 'stack tight' },
          el('p', { class: 'small muted' }, '聞いたことのある文を、今日のスピーチに1つ入れてみましょう。'),
          pick.map((s) => el('div', { class: 'speak-step' },
            el('div', { class: 'en' }, s.en),
            el('div', { class: 'small muted' }, s.ja)))));
    }
    function renderRadioHome() {
      body.innerHTML = '';
      capsHook = null;
      rzStopAudio();
      const all = rzLessons();
      if (!all.length) {
        add(body, el('div', { class: 'card' }, el('p', { class: 'muted' }, 'ラジオ英会話のレッスンが見つかりません。Shadowing Coach でレッスンを読み込むと使えます。')));
        return;
      }
      const lessons = rzFiltered(all);
      const st = getRz();
      const today = C1.today();
      let due = 0, fresh = 0;
      rzPick(lessons, st, today, 100000).forEach((it) => { if (st[it.key]) due++; else fresh++; });
      const sel = el('select', { class: 'input', 'aria-label': 'レッスン' },
        el('option', { value: 'all' }, 'すべてのレッスン'),
        all.map((L) => el('option', { value: String(L.id) }, String(L.title || L.date || L.id))));
      sel.value = rzFilter;
      sel.addEventListener('change', () => {
        rzFilter = String(sel.value || 'all');
        C1.store.set('speak.radioLesson', rzFilter);
        renderRadioHome();
      });
      const canStart = due + fresh > 0;
      add(body, el('div', { class: 'card' },
        el('h2', { class: 'h2' }, '瞬間英作文'),
        el('p', { class: 'small muted' }, cfg.stage === 1
          ? 'シャドーイングした会話の日本語を見て、すぐに英語で言う練習です。聞いて知っている文を自分の口から出せるようになると、B2の会話力に直結します。'
          : 'シャドーイングした会話の日本語を見て、すぐに英語で言う練習です。自然な口語表現を瞬時に出せることが、C1の流暢さにつながります。'),
        el('div', { class: 'speak-stats' },
          el('div', { class: 'speak-stat' }, el('span', { class: 'small muted' }, '今日の復習'), el('span', { class: 'num' }, String(due))),
          el('div', { class: 'speak-stat' }, el('span', { class: 'small muted' }, '新しい文'), el('span', { class: 'num' }, String(fresh)))),
        el('label', { class: 'small muted' }, 'レッスン', sel),
        canStart
          ? el('button', { type: 'button', class: 'btn primary block', onclick: () => startRadio(false) }, RZ_SIZE + '文はじめる')
          : el('p', { class: 'small' }, 'このレッスンの文は、今日の分が終わっています。'),
        canStart ? null : el('button', { type: 'button', class: 'btn block', onclick: () => startRadio(true) }, '前倒しで復習する'),
        el('p', { class: 'small muted' }, '長く覚えている文(7日以上の間隔): ' + rzLongCount() + '文')));
    }
    function startRadio(ahead) {
      flushRadio();
      const lessons = rzFiltered(rzLessons());
      const st = getRz();
      let list = rzPick(lessons, st, C1.today(), RZ_SIZE);
      if (!list.length && ahead) list = rzAhead(lessons, st, RZ_SIZE);
      if (!list.length) { renderRadioHome(); return; }
      rzS = { queue: list, total: list.length, ok: 0, close: 0, miss: 0, reps: {}, activeMs: 0, cardAt: 0 };
      renderRadioCard();
      window.scrollTo(0, 0);
    }
    function renderRadioCard() {
      body.innerHTML = '';
      rzStopAudio();
      capsHook = null;
      if (!rzS) { renderRadioHome(); return; }
      if (!rzS.queue.length) { renderRadioDone(); return; }
      const it = rzS.queue[0];
      const L = it.L, s = it.s;
      const token = ++rzToken;
      rzS.cardAt = Date.now();
      const cleared = rzS.total - new Set(rzS.queue.map((x) => x.key)).size;
      let revealed = false;
      let graded = null;
      let hintLv = 0;
      // the real audio: prepare() must finish before the tap that plays
      let prep = L.hasAudio && s.hasSeg ? (rzCall('prepared', L.id) === true ? 'ok' : 'wait') : 'no';
      if (prep === 'wait') {
        Promise.resolve(rzCall('prepare', L.id)).then((ok) => {
          if (!alive || token !== rzToken) return;
          prep = ok === true && rzCall('prepared', L.id) === true ? 'ok' : 'no';
          drawAudio();
        }, () => {
          if (!alive || token !== rzToken) return;
          prep = 'no';
          drawAudio();
        });
      }

      const input = el('input', { class: 'input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': '英語(入力は任意)', placeholder: '声に出す(入力してもOK)' });
      const hintBox = el('div', { class: 'speak-hint' });
      const hintBtn = el('button', { type: 'button', class: 'btn' }, 'ヒント');
      hintBtn.addEventListener('click', () => {
        if (hintLv >= 2) return;
        hintLv++;
        hintBox.textContent = rzHint(s.en, hintLv);
        if (hintLv >= 2) hintBtn.disabled = true;
      });
      const revealBtn = el('button', { type: 'button', class: 'btn primary' }, '答えを見る');
      const btnRow = el('div', { class: 'btn-grid' }, hintBtn, revealBtn);
      const answer = el('div', { class: 'stack' });
      const audioBox = el('div', { class: 'stack tight' });
      const gradeBox = el('div', { class: 'stack tight' });

      function drawAudio() {
        audioBox.innerHTML = '';
        if (!revealed) return;
        const real = prep === 'ok' && s.hasSeg && rzCall('prepared', L.id) === true;
        const tts = !real && C1.canSpeak();
        if (!real && !tts) {
          if (prep === 'wait') add(audioBox, el('p', { class: 'small muted' }, '音声を準備しています…'));
          return;
        }
        const label = real ? '番組の音声を聞く' : '読み上げを聞く';
        let on = false;
        const b = el('button', { type: 'button', class: 'btn' + (graded ? ' primary' : '') }, label);
        b.addEventListener('click', () => {
          if (on) { rzStopAudio(); on = false; b.textContent = label; return; }
          rzStopAudio();
          const my = ++playSeq;
          on = true;
          b.textContent = '停止する';
          const p = real ? rzCall('play', L.id, s.i, { rate: rzRate }) : C1.speak(s.en, { rate: rzRate });
          const done = () => { if (my === playSeq) { on = false; b.textContent = label; } };
          Promise.resolve(p).then(done, done);
        });
        const rates = [0.8, 1];
        const rateBtns = rates.map((r) => el('button', { type: 'button', 'aria-pressed': String(r === rzRate), onclick: () => {
          rzRate = r;
          C1.store.set('speak.radioRate', r);
          rateBtns.forEach((x, k) => x.setAttribute('aria-pressed', String(rates[k] === rzRate)));
        } }, r === 1 ? '1.0×' : '0.8×'));
        add(audioBox,
          el('div', { class: 'row between' }, b, el('div', { class: 'seg', role: 'group', 'aria-label': '速さ', style: { minWidth: '120px' } }, rateBtns)),
          prep === 'wait' && tts ? el('p', { class: 'small muted' }, '番組の音声を準備しています…') : null);
      }
      function diffBox(typed) {
        const d = wordDiff(s.en, typed);
        const line = (arr, markOk) => el('div', { class: 'speak-diff' }, arr.map((x, k) => [
          k ? ' ' : null,
          x.ok ? (markOk ? el('mark', { class: 'ok' }, x.w) : x.w) : el('mark', { class: 'ng' }, x.w)]));
        return el('div', { class: 'feedback stack tight', style: { whiteSpace: 'normal' } },
          el('div', { class: 'small muted' }, '入力との比較(' + d.hit + ' / ' + d.words + ' 語一致)'),
          el('div', { class: 'small muted' }, '答え'), line(d.a, true),
          el('div', { class: 'small muted' }, 'あなたの入力'), line(d.b, false));
      }
      function drawGrade() {
        gradeBox.innerHTML = '';
        if (!graded) {
          add(gradeBox,
            el('p', { class: 'small muted' }, '日本語を見て、すぐに言えましたか。'),
            el('div', { class: 'btn-grid' },
              el('button', { type: 'button', class: 'btn bad', onclick: () => grade('miss') }, '言えなかった'),
              el('button', { type: 'button', class: 'btn', onclick: () => grade('close') }, '惜しい'),
              el('button', { type: 'button', class: 'btn good', onclick: () => grade('ok') }, '言えた')));
          return;
        }
        add(gradeBox,
          el('p', { class: 'small' }, graded === 'ok' ? '言えた' : graded === 'close' ? '惜しい' : '言えなかった(このあと、もう一度出ます)'),
          el('p', { class: 'small muted' }, '音声と一緒にもう一度、声に出して言ってみましょう。'),
          el('button', { type: 'button', class: 'btn primary block', onclick: nextCard }, rzS && rzS.queue.length ? '次の文へ' : '結果を見る'));
      }
      function reveal() {
        if (revealed) return;
        revealed = true;
        btnRow.remove();
        const typed = input.value.trim();
        input.disabled = true;
        add(answer,
          el('hr', { class: 'divider' }),
          el('div', { class: 'en-big' }, s.en),
          audioBox,
          typed ? diffBox(typed) : null,
          gradeBox);
        drawAudio();
        drawGrade();
        capsHook = () => { if (revealed) drawAudio(); };
      }
      function grade(g) {
        if (graded || !rzS || rzS.queue[0] !== it) return;
        graded = g;
        rzGrade(it.key, g, C1.today());
        rzS[g]++;
        rzS.queue.shift();
        if (g === 'miss') {
          const n = rzS.reps[it.key] || 0;
          if (n < 2) { rzS.reps[it.key] = n + 1; rzS.queue.splice(Math.min(3, rzS.queue.length), 0, it); }
        }
        drawAudio(); // the play button becomes the main action for the repeat
        drawGrade();
      }
      function nextCard() {
        rzStopAudio();
        rzCloseCard();
        renderRadioCard();
        window.scrollTo(0, 0);
      }
      revealBtn.addEventListener('click', reveal);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); reveal(); } });

      add(body, el('div', { class: 'card' },
        el('div', { class: 'row between' },
          el('span', { class: 'small muted speak-wrap grow' }, String(L.title || L.date || '')),
          el('span', { class: 'small muted num' }, cleared + ' / ' + rzS.total)),
        el('div', { class: 'progress' }, el('i', { style: { width: (rzS.total ? cleared / rzS.total * 100 : 0) + '%' } })),
        s.speaker ? el('div', { class: 'row' }, el('span', { class: 'chip' }, String(s.speaker))) : null,
        el('p', { class: 'speak-ja' }, s.ja),
        el('p', { class: 'small muted' }, 'この日本語を、英語で声に出して言ってください。'),
        input, hintBox, btnRow, answer),
        el('button', { type: 'button', class: 'btn ghost', onclick: () => { flushRadio(); rzS = null; renderRadioHome(); } }, '中断して戻る'));
    }
    function renderRadioDone() {
      const S = rzS;
      flushRadio(); // log before the next-step card is built
      rzS = null;
      rzStopAudio();
      body.innerHTML = '';
      let next = null;
      if (C1.engage && C1.engage.nextCard) { try { next = C1.engage.nextCard('speaking'); } catch (e) { next = null; } }
      add(body, el('div', { class: 'card' },
        el('span', { class: 'label' }, '瞬間英作文 完了'),
        el('p', { style: { fontWeight: '600' } }, S.total + '文のうち ' + S.ok + '文を言えました。'),
        el('p', { class: 'small muted' }, '惜しい ' + S.close + ' 回 ・ 言えなかった ' + S.miss + ' 回'),
        el('div', { class: 'row between' },
          el('span', { class: 'small muted' }, '長く覚えている文(7日以上の間隔)'),
          el('span', { class: 'num' }, rzLongCount() + '文')),
        el('p', { class: 'small muted' }, '言えなかった文は、次の練習で先に出ます。'),
        next,
        el('button', { type: 'button', class: 'btn primary block', onclick: () => startRadio(true) }, 'もう' + RZ_SIZE + '文'),
        el('button', { type: 'button', class: 'btn ghost block', onclick: renderRadioHome }, 'レッスンを選ぶ')));
      window.scrollTo(0, 0);
    }

    /* ---------- 3) log ---------- */
    function renderLog() {
      body.innerHTML = '';
      capsHook = null;
      const h = getHistory();
      if (!h.length) {
        add(body, el('div', { class: 'card' },
          el('h2', { class: 'h2' }, '記録'),
          el('p', { class: 'muted' }, 'まだ記録がありません。最初のスピーチを話してみましょう。'),
          el('button', { type: 'button', class: 'btn primary block', onclick: () => setTab('speech') }, '1分スピーチへ')));
        return;
      }
      const withWpm = h.filter((r) => typeof r.wpm === 'number' && r.dictated).slice(0, 5);
      const avg = withWpm.length ? Math.round(withWpm.reduce((s, r) => s + r.wpm, 0) / withWpm.length) : null;
      add(body, el('div', { class: 'card sunken' },
        el('div', { class: 'row between' },
          el('span', null, 'スピーチ ', el('span', { class: 'num' }, String(h.length)), ' 回'),
          avg != null ? el('span', { class: 'small muted' }, '直近の平均 ' + avg + ' 語/分(' + cfg.target + 'の目安 ' + cfg.wpmLo + '〜' + cfg.wpmHi + ')') : null)));
      const list = el('div', { class: 'card' });
      h.forEach((r, i) => {
        const st = r.stage === 1 || r.stage === 2 ? r.stage : cfg.stage;
        const lo = st === 1 ? 100 : 130, hi = st === 1 ? 130 : 160;
        const fb = r.fb && typeof r.fb === 'object' && typeof r.fb.upgraded === 'string' ? r.fb : null;
        const chips = el('div', { class: 'row' },
          el('span', { class: 'chip' }, String(r.date || '')),
          r.lv === 'B2' || r.lv === 'C1' ? lvChip(r.lv) : null,
          el('span', { class: 'chip' }, fmtTime(Number(r.secs) || 0)),
          typeof r.wpm === 'number' ? el('span', { class: 'chip ' + (r.wpm >= lo && r.wpm <= hi ? 'good' : 'gold') }, r.wpm + ' 語/分') : null,
          r.level ? el('span', { class: 'chip accent' }, '推定 ' + String(r.level)) : null,
          typeof r.self === 'number' ? el('span', { class: 'chip' }, 'セルフ ' + r.self + '/' + (Number(r.selfMax) || CHECKS_C1.length)) : null);
        const item = el('div', { class: 'stack tight' },
          chips,
          el('p', { class: 'en speak-wrap', style: { fontSize: '15.5px' } }, String(r.q || '')),
          r.text ? el('details', { class: 'fold', style: { borderTop: '0', paddingTop: '0' } },
            el('summary', { class: 'small' }, '話した内容'),
            el('div', { class: 'feedback en', style: { fontSize: '15px' } }, String(r.text))) : null,
          fb && fb.upgraded ? el('details', { class: 'fold', style: { borderTop: '0', paddingTop: '0' } },
            el('summary', { class: 'small' }, 'AIの改善版'),
            el('div', { class: 'feedback en', style: { fontSize: '15px' } }, fb.upgraded)) : null);
        if (i) add(list, el('hr', { class: 'divider' }));
        add(list, item);
      });
      add(body, list);
    }

    /* ---------- lifecycle ---------- */
    const onCaps = () => { if (alive && capsHook) { try { capsHook(); } catch (e) { /* ignore */ } } };
    document.addEventListener('c1:caps', onCaps);
    /* the bridge (re)loaded: show/hide the 瞬間英作文 tab; refresh only screens that hold no work in progress */
    function rzSig() {
      const ls = rzLessons();
      return (rzOn() ? '1' : '0') + ':' + ls.length + ':' + ls.filter((L) => L.started).length;
    }
    let lastSig = rzSig();
    const onRadio = () => {
      if (!alive) return;
      let on = false;
      try { on = syncTabs(); } catch (e) { on = false; }
      if (tab === 'radio' && !on) { setTab('speech'); lastSig = rzSig(); return; }
      const sig = rzSig();
      if (sig === lastSig) return;
      lastSig = sig;
      try {
        if (tab === 'radio' && !rzS) renderRadioHome();
        else if (tab === 'speech' && phase === 'idle') renderIdle();
      } catch (e) { /* ignore */ }
    };
    document.addEventListener('c1:radio', onRadio);
    Promise.resolve(rzCall('ready')).then(onRadio, () => {});
    segBtns.speech.setAttribute('aria-pressed', 'true');
    show();

    return function cleanup() {
      document.removeEventListener('c1:caps', onCaps);
      document.removeEventListener('c1:radio', onRadio);
      if (phase === 'review' && rec) syncRecord(true);
      leave();
      alive = false;
    };
  }

  C1.register({
    id: 'speak',
    label: '話す',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M8.5 21h7"/></svg>',
    render: render,
    stats: stats,
    status: function () {
      const done = getHistory().some((r) => r.date === C1.today());
      return done ? '今日のスピーチ 完了' : '今日のスピーチ 未完了';
    },
  });
})();
