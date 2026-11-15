/* C1 Climb — core runtime. Exposes window.C1. Modules call C1.register({...}). */
(function () {
  'use strict';
  const NS = 'c1climb:';
  const mem = {};
  const modules = [];
  const SKILLS = ['vocab', 'listening', 'speaking', 'writing', 'grammar', 'input'];

  /* ---------- storage (localStorage with in-memory fallback) ---------- */
  const store = {
    get(key, dflt) {
      try {
        const raw = localStorage.getItem(NS + key);
        if (raw != null) return JSON.parse(raw);
      } catch (e) { /* fall through */ }
      return key in mem ? mem[key] : dflt;
    },
    set(key, value) {
      mem[key] = value;
      try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { /* memory only */ }
      return value;
    },
  };

  /* ---------- small DOM helpers ---------- */
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    }
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  let toastTimer;
  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- dates & activity log ---------- */
  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function today() { return dateKey(); }
  /** C1 Climb's own log only (what logActivity writes). */
  function ownLog() { const l = store.get('log', {}); return l && typeof l === 'object' ? l : {}; }
  /** Shadowing Coach practice per day from the bridge: { day: { listening, speaking } }, or {} when unavailable. */
  function radioMinutes() {
    try {
      const r = window.C1 && window.C1.radio;
      if (!r || typeof r.minutes !== 'function') return {};
      const m = r.minutes();
      return m && typeof m === 'object' ? m : {};
    } catch (e) { return {}; }
  }
  /** The log of both apps: C1 Climb's own log plus Shadowing Coach minutes (listening / speaking). Read-only copy. */
  function getLog() {
    const own = ownLog();
    const rm = radioMinutes();
    const out = {};
    for (const d in own) out[d] = Object.assign({}, own[d]);
    for (const d in rm) {
      const r = rm[d] || {};
      const day = out[d] || (out[d] = {});
      for (const k of ['listening', 'speaking']) {
        const v = Number(r[k]) || 0;
        if (v > 0) day[k] = Math.round(((Number(day[k]) || 0) + v) * 10) / 10;
      }
    }
    return out;
  }
  /** Record study time. skill: vocab|listening|speaking|writing|grammar|input. minutes may be fractional. */
  function logActivity(skill, minutes) {
    if (!SKILLS.includes(skill) || !(minutes > 0)) return;
    const log = ownLog();
    const day = log[today()] || (log[today()] = {});
    day[skill] = Math.round(((day[skill] || 0) + minutes) * 10) / 10;
    store.set('log', log);
    document.dispatchEvent(new CustomEvent('c1:log'));
  }
  /* when the bridge (re)loads and Shadowing Coach minutes changed, tell the ring, menu and streak once */
  let radioSig = '{}';
  if (typeof document !== 'undefined') {
    document.addEventListener('c1:radio', () => {
      let sig = '{}';
      try { sig = JSON.stringify(radioMinutes()); } catch (e) { /* ignore */ }
      if (sig === radioSig) return;
      radioSig = sig;
      document.dispatchEvent(new CustomEvent('c1:log'));
    });
  }
  function minutesOn(key) {
    const day = getLog()[key] || {};
    return SKILLS.reduce((s, k) => s + (day[k] || 0), 0);
  }
  function streak() {
    let n = 0;
    const d = new Date();
    if (minutesOn(dateKey(d)) <= 0) d.setDate(d.getDate() - 1);
    while (minutesOn(dateKey(d)) > 0) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  /* ---------- learner level ---------- */
  /** Learner's current CEFR level: 'B1' | 'B2' | 'B2+' (set on Home; default B1). */
  function level() { const l = store.get('home.level', 'B1'); return ['B1', 'B2', 'B2+'].includes(l) ? l : 'B1'; }
  /** Stage 1 = B1 learner building to B2 (serve items tagged lv:'B2' first). Stage 2 = B2/B2+ learner building to C1 (serve lv:'C1' first). */
  function stage() { return level() === 'B1' ? 1 : 2; }

  /* ---------- capabilities: tts / dictation / sample ---------- */
  const caps = { tts: null, dictation: null, sample: null, ready: false };
  function loadCaps() {
    const use = window.claude && typeof window.claude.use === 'function' ? (n) => window.claude.use(n).catch(() => null) : () => Promise.resolve(null);
    const mark = () => document.dispatchEvent(new CustomEvent('c1:caps'));
    use('tts').then((v) => { caps.tts = v; mark(); });
    use('dictation').then((v) => { caps.dictation = v; mark(); });
    use('sample').then((v) => { caps.sample = v; mark(); });
  }

  /* speech out */
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  let enVoice = null;
  function pickVoice() {
    if (!synth) return;
    const vs = synth.getVoices().filter((v) => /^en[-_]/i.test(v.lang));
    enVoice = vs.find((v) => /Samantha|Google US English|Daniel|Karen|Natural/i.test(v.name)) || vs.find((v) => /en[-_]US/i.test(v.lang)) || vs[0] || null;
  }
  if (synth) { pickVoice(); try { synth.addEventListener('voiceschanged', pickVoice); } catch (e) { /* older engines */ } }
  let speakToken = 0;
  function canSpeak() { return !!(caps.tts || synth); }
  /** Speak English text. opts.rate 0.7–1.5 (1 = normal). Resolves true when finished, false if stopped/unavailable. */
  function speak(text, opts) {
    opts = opts || {};
    const rate = Math.min(1.5, Math.max(0.7, opts.rate || 1));
    const token = ++speakToken;
    text = String(text || '').trim();
    if (!text) return Promise.resolve(false);
    if (caps.tts) {
      // tts takes up to 2,000 characters per line; split long passages by sentence
      const parts = [];
      let buf = '';
      for (const s of text.split(/(?<=[.!?])\s+/)) {
        if ((buf + ' ' + s).length > 1500) { parts.push(buf); buf = s; } else buf = buf ? buf + ' ' + s : s;
      }
      if (buf) parts.push(buf);
      return caps.tts.speak(parts.map((p) => ({ text: p, rate, language: 'en' })))
        .then(() => true)
        .catch((e) => {
          if (e && e.code === 'not_granted') { caps.tts = null; if (token === speakToken && synth) return speakSynth(text, rate, token); }
          return false;
        });
    }
    if (synth) return speakSynth(text, rate, token);
    return Promise.resolve(false);
  }
  function speakSynth(text, rate, token) {
    return new Promise((resolve) => {
      try {
        synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        if (enVoice) u.voice = enVoice;
        u.rate = rate;
        u.onend = () => resolve(token === speakToken);
        u.onerror = () => resolve(false);
        synth.speak(u);
      } catch (e) { resolve(false); }
    });
  }
  function stopSpeaking() {
    speakToken++;
    try { if (caps.tts) caps.tts.stop(); } catch (e) { /* ignore */ }
    try { if (synth) synth.cancel(); } catch (e) { /* ignore */ }
  }

  /* speech in */
  let activeDictation = null;
  function canDictate() { return !!caps.dictation; }
  /**
   * Start speech-to-text. MUST be called synchronously inside a click handler.
   * handlers: {onPartial(text), onFinal(text), onEnd(reason)}. Returns {stop()} or null when unavailable.
   */
  function listen(handlers) {
    const d = caps.dictation;
    if (!d) return null;
    handlers = handlers || {};
    const session = { live: true };
    activeDictation = session;
    try {
      d.onPartial(({ text }) => { if (session.live && activeDictation === session && handlers.onPartial) handlers.onPartial(text); });
      d.onFinal(({ text }) => { if (session.live && activeDictation === session && handlers.onFinal) handlers.onFinal(text); });
      d.onState(({ state, reason }) => {
        if (state === 'idle' && session.live && activeDictation === session) {
          session.live = false;
          if (handlers.onEnd) handlers.onEnd(reason || 'stopped');
        }
      });
      d.start().catch((e) => {
        if (!session.live) return;
        session.live = false;
        if (e && e.code === 'not_granted') { caps.dictation = null; document.dispatchEvent(new CustomEvent('c1:caps')); }
        if (handlers.onEnd) handlers.onEnd((e && e.code) || 'error');
      });
    } catch (e) {
      session.live = false;
      return null;
    }
    return {
      stop() {
        if (!session.live) return Promise.resolve();
        return Promise.resolve(d.stop()).catch(() => {}).then(() => {
          if (session.live) { session.live = false; if (handlers.onEnd) handlers.onEnd('stopped'); }
        });
      },
    };
  }

  /* ask Claude */
  function canAsk() { return !!caps.sample; }
  /**
   * Ask Claude (memoryless). opts: {json:boolean, onText(wholeTextSoFar), tier:'quick'|'default'|'complex', signal}.
   * Resolves with text (or parsed JSON when opts.json). Rejects with {code,message}. Call only from a user click.
   */
  function ask(prompt, opts) {
    opts = opts || {};
    const s = caps.sample;
    if (!s) return Promise.reject({ code: 'unavailable', message: 'AI unavailable' });
    const o = { cache: false };
    if (opts.tier) o.modelTier = opts.tier;
    if (opts.signal) o.signal = opts.signal;
    if (opts.onText) o.onText = ({ text }) => opts.onText(text);
    const p = opts.json ? s.json(prompt, o) : s(prompt, o).then((r) => r.text);
    return p.catch((e) => {
      if (e && e.code === 'not_granted') { caps.sample = null; document.dispatchEvent(new CustomEvent('c1:caps')); }
      throw e;
    });
  }
  function aiErrorMessage(e) {
    const code = e && e.code;
    if (code === 'unavailable' || code === 'not_granted') return 'AIフィードバックはこの画面では使えません。下のセルフチェックで確認しましょう。';
    if (code === 'rate_limited') return '少し時間をおいてから、もう一度試してください。';
    if (code === 'cancelled') return '中止しました。';
    if (code === 'invalid_json') return 'うまく読み取れませんでした。もう一度試してください。';
    return 'AIから応答を得られませんでした。もう一度試してください。';
  }

  /* ---------- modules & routing ---------- */
  let cleanup = null;
  /** mod: {id, label, icon (inline SVG string), render(container) -> optional cleanup fn, status?() -> short string for Home} */
  function register(mod) { modules.push(mod); }
  function getModule(id) { return modules.find((m) => m.id === id); }
  function currentId() {
    const id = (location.hash || '').replace(/^#/, '');
    return getModule(id) ? id : 'home';
  }
  function go(id) {
    if (currentId() === id && location.hash) show(); else location.hash = '#' + id;
  }
  function show() {
    const id = currentId();
    const view = document.getElementById('view');
    if (!view) return;
    if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { /* ignore */ } }
    cleanup = null;
    stopSpeaking();
    view.innerHTML = '';
    const mod = getModule(id);
    try { cleanup = mod.render(view) || null; } catch (e) {
      console.error(e);
      view.append(el('div', { class: 'card' }, el('p', null, 'この画面を表示できませんでした。ページを再読み込みしてください。')));
    }
    document.querySelectorAll('#nav button').forEach((b) => b.setAttribute('aria-current', b.dataset.id === id ? 'page' : 'false'));
    window.scrollTo(0, 0);
  }
  function buildNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    nav.innerHTML = '';
    const order = ['home', 'vocab', 'listen', 'speak', 'write', 'grammar'];
    modules.slice().sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)).forEach((m) => {
      nav.append(el('button', { type: 'button', 'data-id': m.id, onclick: () => go(m.id) },
        el('span', { class: 'nav-ico', html: m.icon || '', 'aria-hidden': 'true' }), el('span', { class: 'nav-label' }, m.label)));
    });
  }
  function start() {
    buildNav();
    show();
    window.addEventListener('hashchange', show);
    loadCaps();
  }

  window.C1 = {
    store, el, esc, toast, level, stage, today, dateKey, getLog, ownLog, logActivity, minutesOn, streak, SKILLS,
    speak, stopSpeaking, canSpeak, listen, canDictate, ask, canAsk, aiErrorMessage,
    register, getModule, modules, go, start,
  };
})();
