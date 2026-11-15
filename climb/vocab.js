/* C1 Climb — vocabulary module: spaced-repetition review with recognition + production cards, and a browsable list.
   Items carry lv:'B2'|'C1'. Stage 1 (B1 learner) draws new cards from B2 only unless the learner opts into C1;
   stage 2 draws C1 first, then B2. Due reviews are always served, whatever their level. */
(function () {
  'use strict';
  var C1 = window.C1;
  if (!C1) return;
  var el = C1.el;
  var DATA = (Array.isArray(window.C1_VOCAB) ? window.C1_VOCAB : []).filter(function (d) {
    return d && d.id && d.term && d.ex;
  }).map(function (d) {
    if (d.lv !== 'B2' && d.lv !== 'C1') d.lv = 'C1';
    if (!Array.isArray(d.colls)) d.colls = [];
    return d;
  });
  var MATURE_DAYS = 21;
  var EXTRA_STEP = 5;
  var CATS = [['all', 'すべて'], ['academic', '学術'], ['opinion', '意見'], ['work', '仕事'], ['daily', '日常'], ['idiom', 'イディオム'], ['radio', '自分の表現']];
  var LVS = [['all', 'すべて'], ['B2', 'B2'], ['C1', 'C1']];
  var CAT_LABEL = {};
  CATS.forEach(function (c) { CAT_LABEL[c[0]] = c[1]; });
  var POS_LABEL = { v: '動詞', n: '名詞', adj: '形容詞', adv: '副詞', prep: '前置詞', conj: '接続詞', phrase: 'フレーズ', idiom: 'イディオム', 'phr v': '句動詞' };
  var GRADES = [
    { g: 0, label: 'もう一度', cls: 'bad' },
    { g: 1, label: '難しい', cls: '' },
    { g: 2, label: '良い', cls: 'good' },
    { g: 3, label: '簡単', cls: 'primary' }
  ];

  // New cards are introduced in a fixed mixed order (words, phrases and idioms interleaved).
  var MIXED = DATA.map(function (d, i) { return { d: d, k: (i * 7919 + 13) % 1009, i: i }; })
    .sort(function (a, b) { return a.k - b.k || a.i - b.i; }).map(function (x) { return x.d; });

  /* ---------- stage & level pool ---------- */
  function stage() { try { return C1.stage ? C1.stage() : 2; } catch (e) { return 2; } }
  function stageTarget() { return stage() === 1 ? 'B2' : 'C1'; }
  // Which level the learner wants new cards from (per stage). Stage 1 default B2; stage 2 default C1.
  function newPref() {
    var st = stage();
    var v = C1.store.get('vocab.newLv' + st, null);
    return v === 'B2' || v === 'C1' ? v : stageTarget();
  }
  function setNewPref(v) { C1.store.set('vocab.newLv' + stage(), v); }
  // Ordered list of levels new cards are drawn from. Stage 1 + B2 never adds C1 by default.
  function poolLevels() {
    var p = newPref();
    if (stage() === 1 && p === 'B2') return ['B2'];
    return p === 'C1' ? ['C1', 'B2'] : ['B2', 'C1'];
  }
  function countLv(lv) { return allData().filter(function (d) { return d.lv === lv; }).length; }

  /* ---------- custom cards (the learner's own expressions, e.g. from ラジオ英会話) ----------
     Stored in 'vocab.custom' as [{ id:'u-…', term, ja, ex, def:'', pos:'', colls:[], cat:'radio', lv:'B2', src:{lessonId,i,title}|null, at }].
     Merged in front of the built-in deck at run time; scheduling state lives in 'vocab.cards' like any card. */
  var CUSTOM_KEY = 'vocab.custom';
  var CUSTOM_MAX = 1000;
  function cleanStr(v, max) { return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''; }
  function cleanSrc(s) {
    if (!s || typeof s !== 'object') return null;
    var id = s.lessonId;
    if (!((typeof id === 'string' && id) || (typeof id === 'number' && isFinite(id)))) return null;
    var i = Number(s.i);
    if (!(i >= 0 && Math.floor(i) === i)) return null;
    return { lessonId: id, i: i, title: cleanStr(s.title, 120) };
  }
  function normCustom(c) {
    if (!c || typeof c !== 'object') return null;
    var term = cleanStr(c.term, 80), ja = cleanStr(c.ja, 200), ex = cleanStr(c.ex, 400);
    if (typeof c.id !== 'string' || c.id.indexOf('u-') !== 0 || !term || !ex) return null;
    return {
      id: c.id, term: term, ja: ja, ex: ex, def: cleanStr(c.def, 300), pos: cleanStr(c.pos, 20),
      colls: Array.isArray(c.colls) ? c.colls.filter(function (x) { return typeof x === 'string' && x; }) : [],
      cat: 'radio', lv: c.lv === 'C1' ? 'C1' : 'B2', src: cleanSrc(c.src), at: Number(c.at) || 0, custom: true
    };
  }
  function getCustom() {
    var raw;
    try { raw = C1.store.get(CUSTOM_KEY, []); } catch (e) { raw = []; }
    if (!Array.isArray(raw)) return [];
    var seen = {}, out = [];
    raw.forEach(function (c) {
      var n = normCustom(c);
      if (n && !seen[n.id]) { seen[n.id] = 1; out.push(n); }
    });
    return out;
  }
  function saveCustom(list) {
    C1.store.set(CUSTOM_KEY, list.map(function (c) {
      return { id: c.id, term: c.term, ja: c.ja, ex: c.ex, def: c.def || '', pos: c.pos || '', colls: c.colls || [],
        cat: 'radio', lv: c.lv, src: c.src, at: c.at };
    }));
  }
  function sameSrc(a, b) {
    if (!a || !b) return !a && !b;
    return String(a.lessonId) === String(b.lessonId) && a.i === b.i;
  }
  function isDup(list, term, ex, src, exceptId) {
    var k = norm(term);
    return list.some(function (c) {
      return c.id !== exceptId && norm(c.term) === k && sameSrc(c.src, src) && (src || norm(c.ex) === norm(ex));
    });
  }
  // Returns { id } or { err: 'invalid' | 'dup' | 'full' }.
  function addCustomCore(o) {
    o = o && typeof o === 'object' ? o : {};
    var term = cleanStr(o.term, 80), ja = cleanStr(o.ja, 200), ex = cleanStr(o.ex, 400);
    var src = o.src == null ? null : cleanSrc(o.src);
    if (!term || !ja || !ex || (o.src != null && !src)) return { err: 'invalid' };
    var list = getCustom();
    if (isDup(list, term, ex, src, null)) return { err: 'dup' };
    if (list.length >= CUSTOM_MAX) return { err: 'full' };
    var id;
    do { id = 'u-' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
    while (list.some(function (c) { return c.id === id; }));
    list.push({ id: id, term: term, ja: ja, ex: ex, def: '', pos: '', colls: [], cat: 'radio', lv: 'B2', src: src, at: Date.now() });
    saveCustom(list);
    return { id: id };
  }
  function addCustom(o) {
    try { var r = addCustomCore(o); return r.id || null; } catch (e) { return null; }
  }
  function updateCustom(id, term, ja) {
    var list = getCustom(), c = null;
    list.forEach(function (x) { if (x.id === id) c = x; });
    term = cleanStr(term, 80); ja = cleanStr(ja, 200);
    if (!c) return 'invalid';
    if (!term || !ja) return 'invalid';
    if (isDup(list, term, c.ex, c.src, id)) return 'dup';
    c.term = term; c.ja = ja;
    saveCustom(list);
    return '';
  }
  function deleteCustom(id) {
    saveCustom(getCustom().filter(function (c) { return c.id !== id; }));
    var cards = getCards();
    if (cards[id]) { delete cards[id]; saveCards(cards); }
  }
  // Custom cards first (they are the learner's own choice), then the built-in deck.
  function allData() { return getCustom().concat(DATA); }
  function customCount(lessonId, i) {
    return getCustom().filter(function (c) { return c.src && sameSrc(c.src, { lessonId: lessonId, i: i }); }).length;
  }

  /* ---------- Radio Eikaiwa bridge (C1.radio, optional) ---------- */
  function radio() { var r = C1.radio; return r && typeof r === 'object' ? r : null; }
  function radioOn() { try { var r = radio(); return !!(r && r.available && r.available()); } catch (e) { return false; } }
  function radioLessons() { try { var r = radio(), l = r && r.lessons ? r.lessons() : []; return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function radioLesson(id) { try { var r = radio(); return (r && r.lesson ? r.lesson(id) : null) || null; } catch (e) { return null; } }
  function radioPrepare(id) {
    try { var r = radio(); if (!r || !r.prepare) return Promise.resolve(false); return Promise.resolve(r.prepare(id)).then(function (v) { return !!v; }, function () { return false; }); }
    catch (e) { return Promise.resolve(false); }
  }
  function radioPrepared(id) { try { var r = radio(); return !!(r && r.prepared && r.prepared(id)); } catch (e) { return false; } }
  function radioStop() { try { var r = radio(); if (r && r.stop) r.stop(); } catch (e) { /* ignore */ } }
  function radioPlay(id, i, rate) {
    try { var r = radio(); if (r && r.play) { var p = r.play(id, i, { rate: rate }); if (p && p.catch) p.catch(function () {}); return true; } }
    catch (e) { /* fall through */ }
    return false;
  }
  function sentenceOf(src) {
    if (!src) return null;
    var L = radioLesson(src.lessonId);
    var s = L && Array.isArray(L.sentences) ? L.sentences[src.i] : null;
    return s && typeof s === 'object' ? s : null;
  }
  // The card's own sentence audio can be played synchronously right now.
  function radioPlayable(d) {
    if (!d || !d.src || !radioOn() || !radioPrepared(d.src.lessonId)) return false;
    var s = sentenceOf(d.src);
    return !!(s && s.hasSeg);
  }

  /* ---------- persistence ---------- */
  function getCards() {
    var c = C1.store.get('vocab.cards', {});
    return c && typeof c === 'object' && !Array.isArray(c) ? c : {};
  }
  function cardState(cards, id) {
    var s = cards[id];
    return s && typeof s === 'object' ? s : null;
  }
  function saveCards(c) { C1.store.set('vocab.cards', c); }
  function getPerDay() {
    var n = C1.store.get('vocab.perDay', 10);
    return n === 5 || n === 15 ? n : 10;
  }
  function getDay() {
    var d = C1.store.get('vocab.day', null);
    if (!d || typeof d !== 'object' || d.date !== C1.today()) d = { date: C1.today(), newDone: 0, extra: 0 };
    return d;
  }
  function saveDay(d) { C1.store.set('vocab.day', d); }
  function dayOffset(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return C1.dateKey(d);
  }

  /* ---------- scheduling (SM-2 variant, intervals in days) ---------- */
  function nextState(prev, g) {
    var s = prev ? { reps: prev.reps || 0, ivl: prev.ivl || 0, ease: prev.ease || 2.5, lapses: prev.lapses || 0 }
      : { reps: 0, ivl: 0, ease: 2.5, lapses: 0 };
    if (g === 0) {
      if (prev && s.reps > 0) s.lapses += 1;
      s.reps = 0; s.ivl = 0; s.ease = Math.max(1.3, s.ease - 0.2);
    } else if (g === 1) {
      s.ivl = s.reps === 0 ? 1 : Math.max(s.ivl + 1, Math.round(s.ivl * 1.2));
      s.ease = Math.max(1.3, s.ease - 0.15); s.reps += 1;
    } else if (g === 2) {
      s.ivl = s.reps === 0 ? 1 : s.reps === 1 ? Math.max(3, s.ivl + 1) : Math.max(s.ivl + 1, Math.round(s.ivl * s.ease));
      s.reps += 1;
    } else {
      s.ivl = s.reps === 0 ? 4 : Math.max(s.ivl + 2, Math.round(Math.max(1, s.ivl) * s.ease * 1.3));
      s.ease = Math.min(3, s.ease + 0.15); s.reps += 1;
    }
    s.ivl = Math.min(s.ivl, 365);
    return s;
  }
  function ivlText(n) {
    if (n <= 0) return 'すぐ';
    if (n < 30) return n + '日後';
    return Math.round(n / 30) + 'か月後';
  }
  function statusOf(s) {
    if (!s) return 'new';
    return s.ivl >= MATURE_DAYS ? 'mature' : 'learning';
  }

  /* ---------- queue ---------- */
  function snapshot() {
    var cards = getCards(), day = getDay(), today = C1.today(), tomorrow = dayOffset(1);
    var levels = poolLevels(), target = levels[0];
    var due = [], unseenByLv = { B2: [], C1: [] }, unseenCustom = [], learnedT = 0, matureT = 0, dueTomorrow = 0;
    var custom = getCustom().sort(function (a, b) { return a.at - b.at; });
    custom.concat(MIXED).forEach(function (d) {
      var s = cardState(cards, d.id);
      if (!s) { (d.custom ? unseenCustom : unseenByLv[d.lv]).push(d); return; }
      if (d.lv === target) { learnedT++; if (s.ivl >= MATURE_DAYS) matureT++; }
      // Reviews are served regardless of level or stage.
      if (typeof s.due !== 'string' || s.due <= today) due.push(d);
      else if (s.due <= tomorrow) dueTomorrow++;
    });
    due.sort(function (a, b) { return (cards[a.id].ts || 0) - (cards[b.id].ts || 0); });
    // The learner's own cards come before built-in new cards, within the same daily limit.
    var unseen = unseenCustom.slice();
    levels.forEach(function (lv) { unseen = unseen.concat(unseenByLv[lv]); });
    var quota = Math.max(0, getPerDay() + (day.extra || 0) - (day.newDone || 0));
    return {
      cards: cards, day: day, due: due, fresh: unseen.slice(0, quota), unseen: unseen.length,
      levels: levels, target: target, targetTotal: countLv(target), learned: learnedT, mature: matureT,
      dueTomorrow: dueTomorrow, c1Unseen: unseenByLv.C1.length
    };
  }

  /* ---------- text helpers ---------- */
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[‘’ʼ`']/g, '')
      .replace(/[‐-―-]/g, ' ')
      .replace(/[.,!?;:"“”()]/g, '')
      .replace(/\s+/g, ' ').trim();
  }
  function answerKey(typed, term) {
    var t = norm(typed), k = norm(term);
    // "to estimate" for "estimate" is fine.
    if (k.indexOf('to ') !== 0 && t.indexOf('to ') === 0) t = t.slice(3);
    return { t: t, k: k };
  }
  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[b.length];
  }
  function checkAnswer(typed, term) {
    var x = answerKey(typed, term);
    if (x.t === x.k) return 'right';
    if (x.k.length >= 5 && editDistance(x.t, x.k) === 1) return 'close';
    return 'wrong';
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function splitExample(d) {
    // Match the term as a whole word/phrase so "tend" does not hit inside "attend".
    // Words of a multi-word term may be separated by any whitespace; straight and curly apostrophes match each other.
    var term = String(d.term || '').trim(), ex = String(d.ex || '');
    if (!term) return null;
    var pat = term.split(/\s+/).map(function (w) { return escRe(w).replace(/['’]/g, "['’]"); }).join('\\s+');
    var m = new RegExp('(^|[^A-Za-z])(' + pat + ')(?![A-Za-z])', 'i').exec(ex);
    if (!m) return null;
    var i = m.index + m[1].length, n = m[2].length;
    return [ex.slice(0, i), ex.slice(i, i + n), ex.slice(i + n)];
  }
  function exampleNode(d, blank) {
    var p = el('p', { class: 'en' });
    var parts = splitExample(d);
    if (!parts) { p.textContent = d.ex; return p; }
    p.append(parts[0]);
    p.append(blank ? el('span', { class: 'vocab-blank', 'aria-label': '空欄' }, ' ') : el('mark', { class: 'ok' }, parts[1]));
    p.append(parts[2]);
    return p;
  }
  // Marks the part of `typed` that differs from `correct` (common prefix/suffix kept plain).
  function diffNode(typed, correct) {
    var a = typed, b = correct, la = a.toLowerCase(), lb = b.toLowerCase();
    var p = 0;
    while (p < la.length && p < lb.length && la[p] === lb[p]) p++;
    var s = 0;
    while (s < la.length - p && s < lb.length - p && la[la.length - 1 - s] === lb[lb.length - 1 - s]) s++;
    var span = el('span', { class: 'en' });
    span.append(a.slice(0, p));
    var mid = a.slice(p, a.length - s);
    span.append(el('mark', { class: 'ng' }, mid || '␣'));
    span.append(a.slice(a.length - s));
    return span;
  }
  function hintText(d) {
    var words = d.term.split(/\s+/);
    if (stage() === 1) {
      // Stronger hint at stage 1: first letter of each word plus its length, e.g. "t___ i___ a______".
      return 'ヒント: ' + words.map(function (w) {
        return w.charAt(0) + w.slice(1).replace(/[A-Za-z]/g, '_');
      }).join(' ');
    }
    return 'ヒント: ' + (words.length > 1 ? words.length + '語・' : '') + '最初の文字は「' + d.term.charAt(0) + '」';
  }
  function lvChip(d) { return el('span', { class: 'chip vocab-lv' + (d.lv === 'C1' ? ' gold' : ''), title: 'レベル ' + d.lv }, d.lv); }

  /* ---------- styles ---------- */
  function ensureStyle() {
    if (document.getElementById('vocab-style')) return;
    var st = el('style', { id: 'vocab-style' });
    st.textContent =
      '.vocab-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' +
      '.vocab-stats>div{background:var(--sunken);border-radius:var(--r-sm);padding:8px 4px;text-align:center;min-width:0;display:flex;flex-direction:column;align-items:center}' +
      '.vocab-stats .num{font-size:22px;line-height:1.2;display:block}' +
      '.vocab-stats .num small{font-size:13px;color:var(--muted);font-weight:600}' +
      '.vocab-blank{display:inline-block;min-width:5.5em;border-bottom:2px solid var(--accent);margin:0 2px}' +
      '.vocab-ja{font-size:20px;font-weight:700;line-height:1.4;overflow-wrap:anywhere}' +
      '.vocab-hint{font-family:var(--font-en);letter-spacing:.06em;overflow-wrap:anywhere}' +
      '.vocab-grades{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}' +
      '.vocab-grades .btn{flex-direction:column;gap:0;padding:6px 2px;min-height:54px;font-size:13.5px;min-width:0}' +
      '.vocab-grades .btn small{font-weight:400;font-size:11px;opacity:.85}' +
      '.vocab-lv{font-family:var(--font-display);letter-spacing:.02em}' +
      '.vocab-item>summary{align-items:center;min-height:44px}' +
      '.vocab-item>summary .t{flex:1 1 0;min-width:0;display:flex;flex-direction:column}' +
      '.vocab-item>summary .t b{font-family:var(--font-en);font-size:16.5px;overflow-wrap:anywhere}' +
      '.vocab-item>summary .c{display:flex;gap:4px;flex:0 0 auto}' +
      '.vocab-item>summary::after{display:none}' +
      '.vocab-item:first-child{border-top:0;padding-top:0}' +
      '.vocab-radio-btn{display:flex}' +
      '.vocab-lessons{display:flex;flex-direction:column;gap:8px}' +
      '.vocab-lesson{display:flex;align-items:center;gap:8px;width:100%;min-height:52px;text-align:left;padding:10px 12px;border-radius:var(--r-sm);background:var(--sunken);color:inherit;border:1px solid var(--line);font:inherit}' +
      '.vocab-lesson .t{flex:1 1 0;min-width:0;display:flex;flex-direction:column;overflow-wrap:anywhere}' +
      '.vocab-sent{display:flex;gap:8px;align-items:flex-start;border-top:1px solid var(--line);padding-top:10px}' +
      '.vocab-sent:first-child{border-top:0;padding-top:0}' +
      '.vocab-sent-main{flex:1 1 0;min-width:0;min-height:44px;display:flex;flex-direction:column;gap:2px;text-align:left;background:none;border:0;padding:4px 0;color:inherit;font:inherit;cursor:pointer}' +
      '.vocab-sent-main .en{overflow-wrap:anywhere}' +
      '.vocab-words{display:flex;flex-wrap:wrap;gap:6px}' +
      '.vocab-word{min-height:44px;min-width:44px;padding:6px 10px;border-radius:var(--r-sm);border:1px solid var(--line);background:var(--sunken);color:inherit;font-family:var(--font-en);font-size:16px}' +
      '.vocab-word[aria-pressed="true"]{border-color:var(--accent);color:var(--accent);font-weight:700}';
    document.head.append(st);
  }

  /* ---------- module state kept between tab visits ---------- */
  var ui = { tab: 'study', cat: 'all', lv: 'all' };

  function render(container) {
    ensureStyle();
    if (ui.tab === 'radio') ui.tab = ui.radioFrom === 'list' ? 'list' : 'study';
    var alive = true;
    var lastId = null;      // avoid showing the same card twice in a row when others are waiting
    var sess = { n: 0, matured: 0 }; // cards graded since this tab was opened
    var playButtons = [];
    var st = stage();
    var rate = st === 1 ? 0.8 : 0.95;

    var curCard = null;     // card currently shown on the study tab
    var formOpen = false;   // an add form is open on the radio screen
    var radioSlots = [];    // holders for the "ラジオ英会話から追加" button

    function canPlay(d) { return radioPlayable(d) || C1.canSpeak(); }
    function syncPlay() {
      playButtons = playButtons.filter(function (b) { return b.isConnected !== false; });
      playButtons.forEach(function (b) { b.style.display = canPlay(b._d) ? '' : 'none'; });
    }
    function stopAudio() { C1.stopSpeaking(); radioStop(); }
    function playBtn(d, small) {
      var b = el('button', {
        type: 'button', class: 'btn' + (small ? ' sm' : ''), 'aria-label': '音声を再生',
        onclick: function () {
          // Real sentence audio for the learner's own cards when the bridge has it ready (must start inside this tap).
          if (radioPlayable(d) && radioPlay(d.src.lessonId, d.src.i, rate)) return;
          C1.speak(d.term + '. ' + d.ex, { rate: rate });
        }
      }, '聞く');
      b._d = d;
      playButtons.push(b);
      b.style.display = canPlay(d) ? '' : 'none';
      return b;
    }
    // Load the source lesson's audio while the card is on screen so 聞く can start inside the tap.
    function warm(d) {
      if (!d || !d.src || !radioOn() || radioPrepared(d.src.lessonId)) return;
      radioPrepare(d.src.lessonId).then(function () { if (alive) syncPlay(); });
    }
    function radioButton() {
      var slot = el('div', { class: 'vocab-radio-btn' });
      radioSlots.push(slot);
      fillSlot(slot);
      return slot;
    }
    function fillSlot(slot) {
      slot.innerHTML = '';
      if (!radioOn()) { slot.style.display = 'none'; return; }
      slot.style.display = '';
      slot.append(el('button', {
        type: 'button', class: 'btn block',
        onclick: function () { openRadio(ui.tab === 'list' ? 'list' : 'study'); }
      }, 'ラジオ英会話から追加'));
    }
    function onRadio() {
      if (!alive) return;
      radioSlots = radioSlots.filter(function (s) { return s.isConnected !== false; });
      radioSlots.forEach(fillSlot);
      warm(curCard);
      syncPlay();
      if (ui.tab === 'radio' && !formOpen) draw();
    }
    document.addEventListener('c1:caps', syncPlay);
    document.addEventListener('c1:radio', onRadio);
    try { var r0 = radio(); if (r0 && r0.ready) Promise.resolve(r0.ready()).then(onRadio, function () {}); } catch (e) { /* bridge optional */ }

    var body = el('div', { class: 'stack loose' });
    var seg = el('div', { class: 'seg', role: 'group', 'aria-label': '表示切り替え' });
    [['study', '学習'], ['list', '一覧']].forEach(function (t) {
      seg.append(el('button', {
        type: 'button', 'aria-pressed': String(ui.tab === t[0]), 'data-tab': t[0],
        onclick: function () { setTab(t[0]); }
      }, t[1]));
    });
    function setTab(id) {
      ui.tab = id;
      Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tab') === ui.tab)); });
      stopAudio();
      draw();
      try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
    }
    function openRadio(from) {
      ui.radioFrom = from;
      ui.tab = 'radio';
      ui.radioLesson = null;
      Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute('aria-pressed', 'false'); });
      stopAudio();
      draw();
      try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
    }

    container.append(
      el('div', { class: 'stack tight' },
        el('h1', { class: 'h1' }, '語彙'),
        el('p', { class: 'muted small' }, st === 1
          ? 'B2レベルの語をコロケーションごと覚え、思い出して書く練習です。B1からB2へ進むには、よく使う語と組み合わせを増やすことが一番の近道です。'
          : 'C1レベルの語をコロケーションごと覚え、思い出して書く練習です。B2とC1の差の大半は語彙の幅と使い方にあります。')),
      seg, body);

    function draw() {
      if (!alive) return;
      body.innerHTML = '';
      playButtons = [];
      radioSlots = [];
      curCard = null;
      formOpen = false;
      if (ui.tab === 'radio') { drawRadio(); return; }
      if (!allData().length) {
        body.append(el('div', { class: 'card' }, el('p', null, '語彙データを読み込めませんでした。ページを再読み込みしてください。')));
        return;
      }
      if (ui.tab === 'list') drawList(); else drawStudy();
    }

    /* ----- study ----- */
    function statsNode(snap) {
      function cell(n, label) { return el('div', null, el('span', { class: 'num' }, n), el('span', { class: 'small muted' }, label)); }
      return el('div', { class: 'vocab-stats' },
        cell(String(snap.due.length), '復習'),
        cell(String(snap.fresh.length), '新規'),
        cell([String(snap.learned), el('small', null, '/' + snap.targetTotal)], snap.target + ' 学習済み'));
    }
    function settingsNode() {
      var per = getPerDay();
      var s = el('div', { class: 'seg', role: 'group', 'aria-label': '1日の新規カード数' });
      [5, 10, 15].forEach(function (n) {
        s.append(el('button', {
          type: 'button', 'aria-pressed': String(per === n),
          onclick: function () { C1.store.set('vocab.perDay', n); C1.toast('新規カードを1日' + n + '枚にしました'); draw(); }
        }, n + '枚'));
      });
      var pref = newPref();
      var opts = st === 1 ? [['B2', 'B2(おすすめ)'], ['C1', 'C1に挑戦']] : [['C1', 'C1(おすすめ)'], ['B2', 'B2を先に']];
      var lvSeg = el('div', { class: 'seg', role: 'group', 'aria-label': '新規カードのレベル' });
      opts.forEach(function (o) {
        lvSeg.append(el('button', {
          type: 'button', 'aria-pressed': String(pref === o[0]),
          onclick: function () { setNewPref(o[0]); C1.toast('新規カードは' + o[0] + 'から出します'); draw(); }
        }, o[1]));
      });
      return el('details', { class: 'fold' },
        el('summary', null, '新規カードの設定'),
        el('div', { class: 'stack' },
          el('div', { class: 'stack tight' }, el('span', { class: 'label' }, '1日の新規カード数'), s),
          el('div', { class: 'stack tight' }, el('span', { class: 'label' }, '新規カードのレベル'), lvSeg),
          el('p', { class: 'small muted' }, st === 1
            ? 'いまはB2の語を優先しています。復習カードはレベルに関係なくすべて出ます。負担が大きいときは新規を5枚に減らしましょう。'
            : 'いまはC1の語を優先し、終わったらB2の語を出します。復習カードはレベルに関係なくすべて出ます。')));
    }

    function drawStudy() {
      var snap = snapshot();
      var queue = snap.due.concat(snap.fresh);
      if (queue.length > 1 && queue[0].id === lastId) queue.push(queue.shift());
      body.append(statsNode(snap));
      if (!queue.length) { body.append(doneNode(snap), radioButton(), settingsNode()); return; }
      var d = queue[0];
      var state = cardState(snap.cards, d.id);
      curCard = d;
      warm(d);
      body.append(state ? productionCard(d, state, queue.length) : recognitionCard(d, queue.length));
      body.append(radioButton(), settingsNode());
    }

    function doneNode(snap) {
      var wrap = el('div', { class: 'stack loose' });
      var head = el('div', { class: 'card' },
        el('span', { class: 'chip good', style: { alignSelf: 'flex-start' } }, '完了'),
        el('h2', { class: 'h2' }, '今日の分は完了です'));
      if (sess.n > 0) {
        var st0 = stats();
        head.append(el('p', null, '今回 ', el('b', { class: 'num' }, String(sess.n)), ' 枚に取り組みました。' +
          (sess.matured > 0 ? 'うち ' + sess.matured + ' 語が新たに定着し、' : '') + '定着した語は全部で ' + st0.mature + ' 語です。'));
      }
      head.append(
        el('p', null, '明日の復習は ', el('b', { class: 'num' }, String(snap.dueTomorrow)), ' 枚の予定です。'),
        el('p', { class: 'small muted' }, snap.target + ' の語: 学習済み ' + snap.learned + ' / ' + snap.targetTotal + ' 語(うち定着 ' + snap.mature + ' 語)'));
      wrap.append(head);
      if (C1.engage && C1.engage.nextCard) {
        try { var nc = C1.engage.nextCard('vocab'); if (nc) wrap.append(nc); } catch (e) { /* engine optional */ }
      }
      var card = el('div', { class: 'stack' });
      wrap.append(card);
      if (snap.unseen > 0) {
        card.append(el('button', {
          type: 'button', class: 'btn primary block',
          onclick: function () {
            var day = getDay();
            day.extra = (day.extra || 0) + EXTRA_STEP;
            saveDay(day);
            draw();
          }
        }, '新しいカードをあと' + Math.min(EXTRA_STEP, snap.unseen) + '枚学ぶ'));
      } else if (st === 1 && snap.c1Unseen > 0) {
        card.append(el('p', { class: 'small muted' }, 'B2の語はすべて学習を始めました。余裕があればC1の語にも挑戦できます。'),
          el('button', {
            type: 'button', class: 'btn primary block',
            onclick: function () { setNewPref('C1'); C1.toast('新規カードはC1から出します'); draw(); }
          }, 'C1の語に挑戦する'));
      } else {
        card.append(el('p', { class: 'small muted' }, 'すべての語を学習し始めました。あとは復習で定着させましょう。'));
      }
      card.append(el('button', { type: 'button', class: 'btn block', onclick: function () { setTab('list'); } }, '一覧で確認する'));
      return wrap;
    }

    // Custom cards may have no definition / collocations / part of speech: render nothing for those.
    function collsNode(d) {
      if (!d.colls || !d.colls.length) return null;
      return el('div', { class: 'stack tight' }, el('span', { class: 'label' }, 'コロケーション'),
        el('ul', { class: 'plain en', style: { fontSize: '15.5px' } }, d.colls.map(function (c) { return el('li', null, c); })));
    }
    function defNode(d) { return d.def ? el('p', { class: 'en', style: { fontSize: '15.5px' } }, d.def) : null; }
    function posNode(d) { var t = POS_LABEL[d.pos] || d.pos; return t ? el('span', { class: 'small muted' }, t) : null; }
    function srcNode(d) {
      return d.src && d.src.title ? el('p', { class: 'small muted', style: { overflowWrap: 'anywhere' } }, '出典: ' + d.src.title) : null;
    }
    function detailNodes(d) {
      // Japanese meaning and English definition shown together on reveal (both stages).
      return [
        el('div', { class: 'stack tight' }, el('span', { class: 'label' }, '意味'), el('p', { class: 'vocab-ja' }, d.ja), defNode(d)),
        collsNode(d),
        srcNode(d)
      ].filter(Boolean);
    }

    function gradeButtons(d, state, shownAt) {
      var wrap = el('div', { class: 'stack tight' },
        el('span', { class: 'label' }, 'どのくらい思い出せましたか'));
      var grid = el('div', { class: 'vocab-grades' });
      var done = false;
      GRADES.forEach(function (G) {
        var preview = nextState(state, G.g);
        grid.append(el('button', {
          type: 'button', class: 'btn ' + G.cls,
          onclick: function () { if (done) return; done = true; grade(d, G.g, shownAt); }
        }, el('span', null, G.label), el('small', null, ivlText(preview.ivl))));
      });
      wrap.append(grid);
      return wrap;
    }

    function grade(d, g, shownAt) {
      var cards = getCards();
      var prev = cardState(cards, d.id);
      var s = nextState(prev, g);
      s.due = dayOffset(s.ivl);
      s.ts = Date.now();
      cards[d.id] = s;
      saveCards(cards);
      sess.n++;
      if (s.ivl >= MATURE_DAYS && !(prev && prev.ivl >= MATURE_DAYS)) sess.matured++;
      if (!prev) {
        var day = getDay();
        day.newDone = (day.newDone || 0) + 1;
        saveDay(day);
      }
      var secs = Math.min(60, Math.max(0, (Date.now() - shownAt) / 1000));
      if (secs > 0) C1.logActivity('vocab', secs / 60);
      lastId = d.id;
      stopAudio();
      draw();
      try { window.scrollTo(0, 0); } catch (e) { /* ignore */ }
    }

    function cardHead(d, chipText, chipCls, left) {
      return el('div', { class: 'row between' },
        el('div', { class: 'row', style: { gap: '6px' } }, el('span', { class: 'chip ' + chipCls }, chipText), lvChip(d)),
        el('span', { class: 'small muted' }, '残り ' + left + ' 枚'));
    }

    function recognitionCard(d, left) {
      var shownAt = Date.now();
      var card = el('div', { class: 'card' });
      var answer = el('div', { class: 'stack loose' });
      var revealBtn = el('button', {
        type: 'button', class: 'btn primary block',
        onclick: function () {
          revealBtn.remove();
          answer.append(el('hr', { class: 'divider' }), ...[].concat(detailNodes(d)), gradeButtons(d, null, shownAt));
        }
      }, '意味を見る');
      card.append(
        cardHead(d, '新規・意味を確認', 'gold', left),
        el('div', { class: 'row between' },
          el('div', { class: 'grow' }, el('div', { class: 'en-big', style: { overflowWrap: 'anywhere' } }, d.term), posNode(d)),
          playBtn(d, true)),
        exampleNode(d, false),
        el('p', { class: 'small muted' }, '例文から意味を推測してから、答えを確認しましょう。'),
        revealBtn, answer);
      return card;
    }

    function productionCard(d, state, left) {
      var shownAt = Date.now();
      var card = el('div', { class: 'card' });
      var input = el('input', {
        class: 'input en', type: 'text', placeholder: '英語で入力', 'aria-label': '答えを英語で入力',
        autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'done',
        onkeydown: function (e) {
          // Ignore the Enter that confirms an IME conversion (Japanese keyboards).
          if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); reveal(true); }
        }
      });
      // When the term cannot be found in the example (e.g. a custom card whose term was edited),
      // the sentence would give the answer away, so it is shown only after the answer.
      var canBlank = !!splitExample(d);
      var exHolder = el('div', null, canBlank ? exampleNode(d, true)
        : el('p', { class: 'small muted' }, '例文は答えのあとに表示します。'));
      var controls = el('div', { class: 'stack tight' },
        input,
        el('p', { class: 'small muted vocab-hint' }, hintText(d)),
        el('div', { class: 'row' },
          el('button', { type: 'button', class: 'btn primary grow', onclick: function () { reveal(true); } }, '答え合わせ'),
          el('button', { type: 'button', class: 'btn', onclick: function () { reveal(false); } }, '答えを見る')));
      var answer = el('div', { class: 'stack loose' });
      var revealed = false;

      function reveal(check) {
        if (revealed) return;
        var typed = input.value.replace(/\s+/g, ' ').trim();
        if (check && !typed) { C1.toast('答えを入力するか「答えを見る」を押してください'); input.focus(); return; }
        revealed = true;
        try { input.blur(); } catch (e) { /* ignore */ }
        controls.remove();
        exHolder.innerHTML = '';
        exHolder.append(exampleNode(d, false));
        var result = el('div', { class: 'feedback stack tight' });
        if (check) {
          var res = checkAnswer(typed, d.term);
          var msg = res === 'right' ? '正解です' : res === 'close' ? 'ほぼ正解です。つづりを確認しましょう' : '不正解です';
          result.append(el('p', null, el('b', { class: res === 'wrong' ? 'ng' : 'ok' }, msg)));
          if (res !== 'right') result.append(el('p', null, el('span', { class: 'small muted' }, 'あなたの答え: '), diffNode(typed, d.term)));
        }
        result.append(el('div', { class: 'row between' },
          el('p', { class: 'grow' }, el('span', { class: 'small muted' }, '正解: '), el('span', { class: 'en', style: { fontWeight: '600', overflowWrap: 'anywhere' } }, d.term)),
          playBtn(d, true)));
        answer.append(result);
        if (st !== 1 && d.def) answer.append(el('div', { class: 'stack tight' }, el('span', { class: 'label' }, '英語の定義'), defNode(d)));
        answer.append.apply(answer, [collsNode(d), srcNode(d), gradeButtons(d, state, shownAt)].filter(Boolean));
      }

      var prompt = el('div', { class: 'stack tight' },
        el('p', { class: 'vocab-ja' }, d.ja),
        posNode(d));
      // Stage 1: the English definition is shown up front as extra support.
      if (st === 1 && d.def) prompt.append(defNode(d));
      card.append(cardHead(d, '復習・思い出して入力', 'accent', left), prompt, exHolder, controls, answer);
      return card;
    }

    /* ----- list ----- */
    function filterSeg(label, opts, cur, onPick) {
      var f = el('div', { class: 'seg', role: 'group', 'aria-label': label });
      opts.forEach(function (c) {
        f.append(el('button', { type: 'button', 'aria-pressed': String(cur === c[0]), onclick: function () { onPick(c[0]); } }, c[1]));
      });
      return f;
    }
    function drawList() {
      var cards = getCards();
      var order = stageTarget() === 'B2' ? { B2: 0, C1: 1 } : { C1: 0, B2: 1 };
      var all = allData();
      var hasCustom = all.some(function (d) { return d.custom; });
      var cats = hasCustom || ui.cat === 'radio' ? CATS : CATS.filter(function (c) { return c[0] !== 'radio'; });
      var items = all.filter(function (d) {
        return (ui.cat === 'all' || d.cat === ui.cat) && (ui.lv === 'all' || d.lv === ui.lv);
      });
      items = items.map(function (d, i) { return { d: d, i: i }; })
        .sort(function (a, b) { return order[a.d.lv] - order[b.d.lv] || a.i - b.i; })
        .map(function (x) { return x.d; });
      var n = { new: 0, learning: 0, mature: 0 };
      var list = el('div', { class: 'card' });
      items.forEach(function (d) {
        var stt = statusOf(cardState(cards, d.id));
        n[stt]++;
        var chip = stt === 'mature' ? el('span', { class: 'chip good' }, '定着')
          : stt === 'learning' ? el('span', { class: 'chip accent' }, '学習中') : el('span', { class: 'chip' }, '新規');
        var inner = el('div', { class: 'stack' });
        var det = el('details', { class: 'fold vocab-item' },
          el('summary', null, el('span', { class: 't' }, el('b', null, d.term), el('span', { class: 'small muted' }, d.ja)),
            el('span', { class: 'c' }, lvChip(d), chip)),
          inner);
        det.addEventListener('toggle', function () {
          if (!det.open || inner.childNodes.length) return;
          var s = cardState(cards, d.id);
          inner.append.apply(inner, [
            el('p', { class: 'small muted' }, [d.lv, POS_LABEL[d.pos] || d.pos, CAT_LABEL[d.cat] || d.cat].filter(Boolean).join('・') +
              (s && typeof s.due === 'string' ? '・次の復習 ' + (s.due <= C1.today() ? '今日' : s.due.slice(5).replace('-', '/')) : '')),
            defNode(d),
            exampleNode(d, false),
            d.colls.length ? el('ul', { class: 'plain en', style: { fontSize: '15.5px' } }, d.colls.map(function (c) { return el('li', null, c); })) : null,
            srcNode(d),
            d.custom ? customTools(d, inner) : el('div', null, playBtn(d, true))
          ].filter(Boolean));
          if (d.custom) warm(d);
        });
        list.append(det);
      });
      body.append(
        el('div', { class: 'stack tight' },
          filterSeg('レベル', LVS, ui.lv, function (v) { ui.lv = v; draw(); }),
          filterSeg('カテゴリー', cats, ui.cat, function (v) { ui.cat = v; draw(); })),
        radioButton(),
        el('p', { class: 'small muted' }, items.length + '語:新規 ' + n.new + '・学習中 ' + n.learning + '・定着 ' + n.mature +
          '(復習間隔が' + MATURE_DAYS + '日以上で「定着」)'),
        items.length ? list : el('div', { class: 'card sunken' }, el('p', { class: 'small muted' }, ui.cat === 'radio'
          ? 'まだ自分の表現はありません。ラジオ英会話の文から気になった表現を追加できます。' : 'この条件に合う語はありません。')));
    }

    // Edit (term, meaning) and delete with an in-page confirm step, for the learner's own cards.
    function customTools(d, inner) {
      var box = el('div', { class: 'stack tight' });
      function showButtons() {
        box.innerHTML = '';
        box.append(el('div', { class: 'row' },
          playBtn(d, true),
          el('button', { type: 'button', class: 'btn sm', onclick: showEdit }, '編集'),
          el('button', { type: 'button', class: 'btn sm ghost', onclick: showDelete }, '削除')));
      }
      function showEdit() {
        box.innerHTML = '';
        var t = el('input', { class: 'input en', type: 'text', value: d.term, 'aria-label': '表現', autocomplete: 'off', autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false' });
        var j = el('input', { class: 'input', type: 'text', value: d.ja, 'aria-label': '意味' });
        t.value = d.term; j.value = d.ja;
        box.append(
          el('span', { class: 'label' }, '表現'), t,
          el('span', { class: 'label' }, '意味'), j,
          el('div', { class: 'row' },
            el('button', {
              type: 'button', class: 'btn primary sm', onclick: function () {
                var err = updateCustom(d.id, t.value, j.value);
                if (err === 'invalid') { C1.toast('表現と意味を入力してください'); return; }
                if (err === 'dup') { C1.toast('同じ表現がすでにあります'); return; }
                C1.toast('保存しました');
                draw();
              }
            }, '保存'),
            el('button', { type: 'button', class: 'btn sm', onclick: showButtons }, 'やめる')));
      }
      function showDelete() {
        box.innerHTML = '';
        box.append(
          el('p', { class: 'small' }, 'このカードと学習記録を削除します。元に戻せません。'),
          el('div', { class: 'row' },
            el('button', {
              type: 'button', class: 'btn bad sm', onclick: function () {
                deleteCustom(d.id);
                stopAudio();
                C1.toast('削除しました');
                draw();
              }
            }, '削除する'),
            el('button', { type: 'button', class: 'btn sm', onclick: showButtons }, 'やめる')));
      }
      showButtons();
      return box;
    }

    /* ----- add from ラジオ英会話 ----- */
    function backTo() { setTab(ui.radioFrom === 'list' ? 'list' : 'study'); }
    function drawRadio() {
      var head = el('div', { class: 'stack tight' },
        el('div', null, el('button', { type: 'button', class: 'btn sm ghost', onclick: backTo }, ui.radioFrom === 'list' ? '一覧に戻る' : '学習に戻る')),
        el('h2', { class: 'h2' }, 'ラジオ英会話から追加'),
        el('p', { class: 'small muted' }, '気になった表現を自分のカードにします。自分で選んだ表現は、覚えやすく使いやすくなります。'));
      body.append(head);
      if (!radioOn() || !radioLessons().length) {
        body.append(el('div', { class: 'card sunken' }, el('p', { class: 'small muted' }, 'Shadowing Coach のレッスンを読み込めませんでした。')));
        return;
      }
      var L = ui.radioLesson != null ? radioLesson(ui.radioLesson) : null;
      if (L) drawSentences(L); else drawLessons();
    }
    function drawLessons() {
      // Lessons already started in Shadowing Coach first; most recent first within each group.
      var ls = radioLessons().filter(function (l) { return l && l.id != null && Array.isArray(l.sentences) && l.sentences.length; })
        .map(function (l, k) { return { l: l, k: k }; })
        .sort(function (a, b) {
          var sa = a.l.started ? 0 : 1, sb = b.l.started ? 0 : 1;
          if (sa !== sb) return sa - sb;
          var da = String(a.l.date || ''), db = String(b.l.date || '');
          return da < db ? 1 : da > db ? -1 : b.k - a.k;
        }).map(function (x) { return x.l; });
      var counts = {};
      getCustom().forEach(function (c) { if (c.src) counts[String(c.src.lessonId)] = (counts[String(c.src.lessonId)] || 0) + 1; });
      var wrap = el('div', { class: 'vocab-lessons' });
      ls.forEach(function (l) {
        var n = counts[String(l.id)] || 0;
        wrap.append(el('button', {
          type: 'button', class: 'vocab-lesson',
          onclick: function () { ui.radioLesson = l.id; stopAudio(); draw(); try { window.scrollTo(0, 0); } catch (e) { /* ignore */ } }
        },
          el('span', { class: 't' }, el('b', null, String(l.title || '')), el('span', { class: 'small muted' }, String(l.date || ''))),
          l.started ? el('span', { class: 'chip accent' }, '学習中') : null,
          n ? el('span', { class: 'chip good' }, '追加済み ' + n) : null));
      });
      body.append(el('span', { class: 'label' }, 'レッスンを選ぶ'), wrap);
    }
    function drawSentences(L) {
      var lessonId = L.id;
      var playBtns = [], formHolders = [];
      var list = el('div', { class: 'card' });
      body.append(
        el('div', { class: 'row between' },
          el('b', { style: { overflowWrap: 'anywhere', minWidth: '0' } }, String(L.title || '')),
          el('button', { type: 'button', class: 'btn sm', onclick: function () { ui.radioLesson = null; stopAudio(); draw(); } }, 'レッスン一覧')),
        el('p', { class: 'small muted' }, '文をタップすると、その文から表現を選んでカードにできます。'),
        list);
      L.sentences.forEach(function (s, idx) {
        if (!s || typeof s !== 'object') return;
        var i = typeof s.i === 'number' ? s.i : idx;
        var en = String(s.en || ''), ja = String(s.ja || '');
        if (!en.trim()) return;
        var mark = el('span', { class: 'chip good', style: { alignSelf: 'flex-start' } });
        function syncMark() { var n = customCount(lessonId, i); mark.textContent = '追加済み ' + n; mark.style.display = n ? '' : 'none'; }
        syncMark();
        var formHolder = el('div');
        var main = el('button', {
          type: 'button', class: 'vocab-sent-main', 'aria-label': 'この文から追加',
          onclick: function () {
            if (formHolder.childNodes.length) { formHolder.innerHTML = ''; formOpen = false; return; }
            closeForms();
            formOpen = true;
            formHolder.append(addForm({ lessonId: lessonId, i: i, title: String(L.title || '') }, en, ja, function () {
              formHolder.innerHTML = ''; formOpen = false; syncMark();
            }));
          }
        },
          s.speaker ? el('span', { class: 'small muted' }, String(s.speaker)) : null,
          el('span', { class: 'en' }, en),
          ja ? el('span', { class: 'small muted' }, ja) : null,
          mark);
        var row = el('div', { class: 'vocab-sent' }, main);
        if (s.hasSeg) {
          var pb = el('button', {
            type: 'button', class: 'btn sm', 'aria-label': '音声を再生', style: { display: 'none' },
            onclick: function () { radioPlay(lessonId, i, rate); }
          }, '聞く');
          playBtns.push(pb);
          row.append(pb);
        }
        list.append(el('div', { class: 'stack tight' }, row, formHolder));
        formHolders.push(formHolder);
      });
      function closeForms() { formHolders.forEach(function (h) { h.innerHTML = ''; }); formOpen = false; }
      radioPrepare(lessonId).then(function (ok) {
        if (!alive || !ok || ui.tab !== 'radio' || String(ui.radioLesson) !== String(lessonId)) return;
        playBtns.forEach(function (b) { b.style.display = ''; });
      });
    }
    function wordsOf(en) { return en.split(/\s+/).filter(Boolean); }
    function trimPunct(s) { return s.replace(/^[\s"“”‘(\[.,!?;:—–-]+/, '').replace(/[\s"“”’)\].,!?;:—–-]+$/, ''); }
    function addForm(src, en, ja, onSaved) {
      var words = wordsOf(en);
      var sel = { a: -1, b: -1, span: false };
      var chips = [];
      var term = el('input', {
        class: 'input en', type: 'text', placeholder: '表現(英語)', 'aria-label': '表現', autocomplete: 'off',
        autocapitalize: 'none', autocorrect: 'off', spellcheck: 'false',
        oninput: function () { sel = { a: -1, b: -1, span: false }; paint(); checkTerm(); }
      });
      var meaning = el('input', { class: 'input', type: 'text', 'aria-label': '意味', placeholder: 'この文での意味を日本語で' });
      var note = el('p', { class: 'small muted', style: { display: 'none' } }, 'この表現は文の中に見つかりません。入力問題では、例文を答えのあとに表示します。');
      function paint() {
        chips.forEach(function (c, k) { c.setAttribute('aria-pressed', String(sel.a >= 0 && k >= sel.a && k <= sel.b)); });
      }
      function checkTerm() {
        var t = term.value.trim();
        note.style.display = t && !splitExample({ term: t, ex: en }) ? '' : 'none';
      }
      function tap(k) {
        // First tap picks one word; the next tap extends to a contiguous span; a further tap starts again.
        if (sel.a < 0 || sel.span) sel = { a: k, b: k, span: false };
        else sel = { a: Math.min(sel.a, k), b: Math.max(sel.b, k), span: true };
        term.value = trimPunct(words.slice(sel.a, sel.b + 1).join(' '));
        paint(); checkTerm();
      }
      var wordBox = el('div', { class: 'vocab-words', role: 'group', 'aria-label': '表現にする語を選ぶ' });
      words.forEach(function (w, k) {
        var c = el('button', { type: 'button', class: 'vocab-word', 'aria-pressed': 'false', onclick: function () { tap(k); } }, w);
        chips.push(c);
        wordBox.append(c);
      });
      function save() {
        var r = addCustomCore({ term: term.value, ja: meaning.value, ex: en, src: src });
        if (r.err === 'invalid') { C1.toast(term.value.trim() ? '意味を日本語で入力してください' : '表現を選んでください'); return; }
        if (r.err === 'dup') { C1.toast('この表現はすでに追加しています'); return; }
        if (r.err === 'full') { C1.toast('これ以上追加できません'); return; }
        C1.toast('カードに追加しました');
        onSaved();
      }
      return el('div', { class: 'card sunken stack' },
        el('div', { class: 'stack tight' },
          el('span', { class: 'label' }, '語をタップして選ぶ(最初の語と最後の語)'), wordBox,
          el('div', null, el('button', {
            type: 'button', class: 'btn sm ghost',
            onclick: function () { sel = { a: -1, b: -1, span: false }; term.value = ''; paint(); checkTerm(); }
          }, 'クリア'))),
        el('div', { class: 'stack tight' }, el('span', { class: 'label' }, '表現'), term, note),
        el('div', { class: 'stack tight' },
          el('span', { class: 'label' }, '意味'),
          ja ? el('p', { class: 'small muted' }, '文の訳: ' + ja) : null,
          meaning),
        el('div', { class: 'row' },
          el('button', { type: 'button', class: 'btn primary grow', onclick: save }, 'カードに追加'),
          el('button', { type: 'button', class: 'btn', onclick: function () { onSaved(); } }, 'やめる')));
    }

    draw();
    return function cleanup() {
      alive = false;
      document.removeEventListener('c1:caps', syncPlay);
      document.removeEventListener('c1:radio', onRadio);
      stopAudio();
    };
  }

  function status() {
    if (!allData().length) return '';
    var snap = snapshot();
    if (!snap.due.length && !snap.fresh.length) return '今日の分は完了';
    return '復習 ' + snap.due.length + '枚・新規 ' + snap.fresh.length + '枚(' + snap.target + ')';
  }

  // Contract for the motivation layer: numbers only, never throws.
  function stats() {
    var out = { learned: 0, mature: 0, due: 0, total: DATA.length };
    try {
      var all = allData(), cards = getCards(), today = C1.today();
      out.total = all.length;
      all.forEach(function (d) {
        var s = cardState(cards, d.id);
        if (!s) return;
        out.learned++;
        if (Number(s.ivl) >= MATURE_DAYS) out.mature++;
        if (typeof s.due !== 'string' || s.due <= today) out.due++;
      });
    } catch (e) { return { learned: 0, mature: 0, due: 0, total: DATA.length }; }
    return out;
  }

  C1.register({
    id: 'vocab',
    label: '語彙',
    icon: '<svg viewBox="0 0 24 24"><rect x="3.5" y="7" width="13" height="13" rx="2"/><path d="M7.5 7V5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M7 16l3-6 3 6M8 14h4"/></svg>',
    render: render,
    status: status,
    stats: stats,
    // For other modules: add one of the learner's own cards. Returns the new card id, or null (duplicate / invalid).
    addCustom: function (o) { return addCustom(o); }
  });
})();
