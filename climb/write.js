/* C1 Climb — writing module (sentence upgrades, timed writing, reading into writing, records). */
(function () {
  'use strict';
  var C1 = window.C1;
  if (!C1) return;
  var el = C1.el;
  var DATA = window.C1_WRITE || {};
  var UPGRADES = Array.isArray(DATA.upgrades) ? DATA.upgrades : [];
  var TASKS = Array.isArray(DATA.tasks) ? DATA.tasks : [];
  var READINGS = Array.isArray(DATA.readings) ? DATA.readings : [];

  var ICON = '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/><path d="M13 20h7"/></svg>';
  var SKILLS = ['paraphrase', 'formal', 'hedge', 'nominalise', 'cohesion', 'concise'];
  var SKILL_JA = { paraphrase: '言い換え', formal: 'フォーマル化', hedge: 'ヘッジ', nominalise: '名詞化', cohesion: 'つなぎ', concise: '簡潔化' };
  var SKILL_EN = {
    paraphrase: 'paraphrase using more precise, natural vocabulary',
    formal: 'raise the register (more formal and polite, e.g. email phrasing or a natural passive)',
    hedge: 'hedge the claim so it is not overgeneralised (tend to, may, seem, likely)',
    nominalise: 'use nominalisation (noun phrases instead of clauses)',
    cohesion: 'link the ideas with suitable connectors or relative clauses',
    concise: 'make it more concise by removing redundancy and empty words',
  };
  var LEVELS = ['A2', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C2'];
  var SCORE_JA = { content: '内容', organisation: '構成', language: '語彙・文法', register: '文体' };
  var CHECK = {
    1: ['課題の指示（目的・質問）すべてに答えた', '最初の1～2文で要点や用件を伝えた', 'although / however / so that などのつなぎ語を2つ以上使った', 'very / good / bad / thing を具体的な語に置き換えた', 'メールなら、書き出しと結びが相手との関係に合っている', '時制・三単現の s・冠詞（a / the）を見直した', '目標の語数に収まっている'],
    2: ['1文目で立場や用件がはっきりしている', '反対意見や限界を認めてから自分の主張を述べた', '断定しすぎていない（tend to / arguably / it seems など）', '言い換えや名詞化で同じ語の繰り返しを避けた', 'however / consequently / by contrast などで論理のつながりが明確', '相手と目的に合った文体（フォーマル度）で一貫している', '目標の語数に収まっている'],
  };

  /* ---------- helpers ---------- */
  function get(key, dflt, type) {
    var v;
    try { v = C1.store.get(key, dflt); } catch (e) { v = dflt; }
    if (type === 'array') return Array.isArray(v) ? v : dflt;
    if (type === 'object') return v && typeof v === 'object' && !Array.isArray(v) ? v : dflt;
    if (type === 'number') return typeof v === 'number' && isFinite(v) ? v : dflt;
    if (type === 'string') return typeof v === 'string' ? v : dflt;
    return v;
  }
  function set(key, v) { try { C1.store.set(key, v); } catch (e) { /* ignore */ } }
  function wc(s) { s = String(s || '').trim(); return s ? s.split(/\s+/).length : 0; }
  function mmss(sec) { sec = Math.max(0, Math.round(sec)); return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); }
  function str(v) { return typeof v === 'string' ? v.trim() : ''; }
  function clampScore(v) { var n = Math.round(Number(v)); return n >= 1 && n <= 5 ? n : null; }
  function lvChip(lv) { return el('span', { class: 'chip ' + (lv === 'C1' ? 'gold' : 'accent'), text: lv || 'B2' }); }
  function parseJSON(r) {
    if (r && typeof r === 'object') return r;
    if (typeof r !== 'string') return null;
    try { return JSON.parse(r); } catch (e) { /* try to cut out the object */ }
    var a = r.indexOf('{'), b = r.lastIndexOf('}');
    if (a < 0 || b <= a) return null;
    try { return JSON.parse(r.slice(a, b + 1)); } catch (e) { return null; }
  }
  function injectCss() {
    if (document.getElementById('write-css')) return;
    var css = '.write-root [hidden]{display:none !important}' +
      '.write-opt{justify-content:flex-start;text-align:left;white-space:normal;line-height:1.45;font-weight:500}' +
      '.write-opt.ok{border-color:var(--good);background:var(--good-soft);color:var(--good)}' +
      '.write-opt.ng{border-color:var(--bad);background:var(--bad-soft);color:var(--bad)}' +
      '.write-bar{display:grid;grid-template-columns:6.5em 1fr 2.2em;gap:8px;align-items:center;font-size:13px}' +
      '.write-bar .v{text-align:right;font-variant-numeric:tabular-nums;color:var(--muted)}' +
      '.write-check label{display:flex;gap:10px;align-items:flex-start;min-height:44px;padding:6px 0;cursor:pointer}' +
      '.write-check input{width:20px;height:20px;flex:0 0 20px;margin-top:2px;accent-color:var(--accent)}' +
      '.write-list{display:flex;flex-direction:column}' +
      '.write-item{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 0;border:0;border-top:1px solid var(--line);background:none;width:100%;text-align:left;cursor:pointer}' +
      '.write-item:first-child{border-top:0}' +
      '.write-item .t{flex:1 1 0;min-width:0}' +
      '.write-item[aria-current="true"] .t{color:var(--accent)}' +
      '.write-meter{font-variant-numeric:tabular-nums}' +
      '.write-sum{min-height:84px}';
    document.head.appendChild(el('style', { id: 'write-css', text: css }));
  }
  function seg(options, value, onChange) {
    var wrap = el('div', { class: 'seg', role: 'group' });
    options.forEach(function (o) {
      var b = el('button', { type: 'button', 'aria-pressed': String(o.v === value) }, o.t);
      b.addEventListener('click', function () {
        wrap.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        onChange(o.v);
      });
      wrap.append(b);
    });
    return wrap;
  }
  function fold(title, open, children) {
    var d = el('details', { class: 'fold' }, el('summary', null, title), el('div', { class: 'stack tight' }, children));
    if (open) d.open = true;
    return d;
  }
  function daysIndex() {
    var t = Date.parse(C1.today() + 'T00:00:00Z');
    return isFinite(t) ? Math.floor(t / 86400000) : 0;
  }
  function subsAll() { return get('write.subs', [], 'array').filter(function (s) { return s && typeof s === 'object'; }); }
  function secsJa(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m ? m + '分' + (s ? s + '秒' : '') : s + '秒';
  }
  /* engage next-step card, guarded; time must already be logged */
  function nextCard() {
    try { return C1.engage && C1.engage.nextCard ? C1.engage.nextCard('writing') : null; } catch (e) { return null; }
  }
  function fin(n) { n = Number(n); return isFinite(n) && n > 0 ? n : 0; }
  /* lifetime totals: write.subs keeps only the latest 40, so counts live in write.totals (never below what the list shows) */
  function totals(subs) {
    var listWords = 0;
    subs.forEach(function (s) { listWords += fin(s.words); });
    var t = get('write.totals', {}, 'object');
    return { subs: Math.max(Math.round(fin(t.subs)), subs.length), words: Math.max(Math.round(fin(t.words)), listWords) };
  }
  /* engage contract: { submissions, words, drills, reads, lastLevel } */
  function stats() {
    var out = { submissions: 0, words: 0, drills: 0, reads: 0, lastLevel: '' };
    try {
      var subs = subsAll();
      var tot = totals(subs);
      out.submissions = tot.subs;
      out.words = tot.words;
      var lastAt = -Infinity;
      subs.forEach(function (s) {
        var at = fin(s.at);
        var lv = s.fb && typeof s.fb === 'object' && typeof s.fb.level === 'string' ? s.fb.level : '';
        if (lv && at >= lastAt) { lastAt = at; out.lastLevel = lv; }
      });
    } catch (e) { /* keep zeros */ }
    try {
      var D = get('write.drills', {}, 'object');
      Object.keys(D).forEach(function (k) { if (D[k] && typeof D[k] === 'object') out.drills += Math.round(fin(D[k].n)); });
    } catch (e) { /* keep zeros */ }
    try {
      var R = get('write.reads', {}, 'object');
      out.reads = Object.keys(R).filter(function (k) { return R[k] && typeof R[k] === 'object'; }).length;
    } catch (e) { /* keep zeros */ }
    ['submissions', 'words', 'drills', 'reads'].forEach(function (k) { if (!isFinite(out[k])) out[k] = 0; });
    if (typeof out.lastLevel !== 'string') out.lastLevel = '';
    return out;
  }
  function stageInfo() {
    var st = 1;
    try { st = C1.stage() === 2 ? 2 : 1; } catch (e) { st = 1; }
    var level = 'B1';
    try { level = C1.level(); } catch (e) { level = 'B1'; }
    return { st: st, level: level, target: st === 1 ? 'B2' : 'C1', pref: st === 1 ? 'B2' : 'C1', other: st === 1 ? 'C1' : 'B2' };
  }
  function lvOptions(S) {
    return S.st === 1 ? [{ v: 'B2', t: 'B2' }, { v: 'C1', t: 'C1に挑戦' }] : [{ v: 'C1', t: 'C1' }, { v: 'B2', t: 'B2（復習）' }];
  }
  function todayTask(S) {
    var pool = TASKS.filter(function (t) { return t.lv === S.pref; });
    if (!pool.length) pool = TASKS;
    return pool.length ? pool[daysIndex() % pool.length] : null;
  }

  /* ---------- validators for AI replies ---------- */
  function vUpgrade(r) {
    r = parseJSON(r);
    if (!r || typeof r !== 'object') return null;
    var out = { ok: r.ok === true, score: clampScore(r.score), comment: str(r.comment), improved: str(r.improved) };
    return out.score || out.comment || out.improved ? out : null;
  }
  function vFeedback(r) {
    r = parseJSON(r);
    if (!r || typeof r !== 'object') return null;
    var out = { level: LEVELS.indexOf(r.level) >= 0 ? r.level : '', scores: {}, strengths: [], fixes: [], rewrite: str(r.rewrite), next: str(r.next) };
    var sc = r.scores && typeof r.scores === 'object' ? r.scores : {};
    var any = false;
    Object.keys(SCORE_JA).forEach(function (k) { var v = clampScore(sc[k]); out.scores[k] = v; if (v) any = true; });
    if (Array.isArray(r.strengths)) out.strengths = r.strengths.map(str).filter(Boolean).slice(0, 2);
    if (Array.isArray(r.fixes)) {
      out.fixes = r.fixes.filter(function (f) { return f && typeof f === 'object'; }).map(function (f) {
        return { original: str(f.original), better: str(f.better), why: str(f.why) };
      }).filter(function (f) { return f.original || f.better; }).slice(0, 5);
    }
    return any || out.rewrite || out.fixes.length ? out : null;
  }
  function vSummary(r) {
    r = parseJSON(r);
    if (!r || typeof r !== 'object') return null;
    var out = { score: clampScore(r.score), comment: str(r.comment) };
    return out.score || out.comment ? out : null;
  }

  function renderFeedback(fb) {
    var box = el('div', { class: 'stack' });
    var head = el('div', { class: 'row' }, el('span', { class: 'label' }, 'AIの評価'));
    if (fb.level) head.append(el('span', { class: 'chip gold', text: '推定レベル ' + fb.level }));
    box.append(head);
    var bars = el('div', { class: 'stack tight' });
    Object.keys(SCORE_JA).forEach(function (k) {
      var v = fb.scores && fb.scores[k];
      bars.append(el('div', { class: 'write-bar' },
        el('span', null, SCORE_JA[k]),
        el('div', { class: 'progress' }, el('i', { style: { width: (v ? v * 20 : 0) + '%' } })),
        el('span', { class: 'v', text: v ? v + '/5' : '–' })));
    });
    box.append(bars);
    if (fb.strengths && fb.strengths.length) {
      box.append(el('p', { class: 'label' }, 'よかった点'), el('ul', { class: 'plain' }, fb.strengths.map(function (s) { return el('li', { text: s }); })));
    }
    if (fb.fixes && fb.fixes.length) {
      box.append(el('p', { class: 'label' }, '直したい点'));
      fb.fixes.forEach(function (f) {
        box.append(el('div', { class: 'card sunken' },
          f.original ? el('p', { class: 'en' }, el('mark', { class: 'ng', text: f.original })) : null,
          f.better ? el('p', { class: 'en' }, '→ ', el('mark', { class: 'ok', text: f.better })) : null,
          f.why ? el('p', { class: 'small muted', text: f.why }) : null));
      });
    }
    if (fb.rewrite) box.append(el('p', { class: 'label' }, '書き直し例（あなたの文章をもとに）'), el('div', { class: 'feedback en', text: fb.rewrite }));
    if (fb.next) box.append(el('p', { class: 'small' }, el('b', null, '次の目標: '), fb.next));
    return box;
  }

  /* ---------- module ---------- */
  function render(container) {
    injectCss();
    var S = stageInfo();
    var alive = true;
    var busy = false;
    var tabCleanup = null;
    var intervals = [];

    /* honest activity time: count gaps between interactions, each capped at 1 minute */
    var lastAct = Date.now();
    var started = false;
    var pendingMs = 0;
    function act() {
      var now = Date.now();
      if (lastAct) pendingMs += Math.min(Math.max(0, now - lastAct), 60000);
      lastAct = now;
      started = true;
    }
    function flushTime() {
      if (!started) return;
      act();
      var tenths = Math.floor(pendingMs / 6000);
      if (tenths > 0) { pendingMs -= tenths * 6000; C1.logActivity('writing', tenths / 10); }
    }
    function onVis() {
      if (document.visibilityState === 'hidden') { flushTime(); lastAct = 0; }
    }
    var evs = ['input', 'click', 'keydown', 'touchstart'];
    evs.forEach(function (n) { container.addEventListener(n, act, { passive: true }); });
    window.addEventListener('scroll', act, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    intervals.push(setInterval(function () { if (started && Date.now() - lastAct < 60000) flushTime(); }, 60000));

    function syncCaps() {
      root.querySelectorAll('[data-ai]').forEach(function (n) { n.hidden = !C1.canAsk(); });
      root.querySelectorAll('[data-speak]').forEach(function (n) { n.hidden = !C1.canSpeak(); });
    }
    document.addEventListener('c1:caps', syncCaps);

    function runAI(btn, out, prompt, validate, onOk) {
      if (busy) return;
      busy = true;
      btn.disabled = true;
      out.hidden = false;
      out.textContent = '';
      var status = el('p', { class: 'muted small', text: '考え中…' });
      out.append(status);
      var first = true;
      C1.ask(prompt, { json: true, onText: function () { if (first && alive) { first = false; status.textContent = '書いています…'; } } })
        .then(function (r) {
          if (!alive) return;
          var v = validate(r);
          out.textContent = '';
          if (!v) { out.append(el('p', { class: 'ng small', text: 'うまく読み取れませんでした。もう一度試してください。' })); return; }
          onOk(v);
        }, function (e) {
          if (!alive) return;
          out.textContent = '';
          out.append(el('p', { class: 'ng small', text: C1.aiErrorMessage(e) }));
        })
        .then(release, function (e) { release(); if (window.console) console.error(e); });
      function release() { busy = false; if (alive) btn.disabled = false; }
    }

    var root = el('div', { class: 'write-root stack loose' });
    container.append(root);
    root.append(el('div', { class: 'stack tight' },
      el('h1', { class: 'h1' }, '書く'),
      el('p', { class: 'muted small', text: S.st === 1
        ? 'シンプルな文を一段上の英語に書き換え、短い文章を書いて、B2に必要な「つなぐ・言い換える・ていねいに書く」力を鍛えます。'
        : '言い換え・ヘッジ・名詞化と時間を計った作文で、C1に求められる正確さと文体の幅を鍛えます。' })));

    var TABS = [{ v: 'upgrade', t: '言い換え' }, { v: 'task', t: 'ライティング' }, { v: 'read', t: '読解' }, { v: 'log', t: '記録' }];
    var tab = get('write.tab', 'task', 'string');
    if (!TABS.some(function (t) { return t.v === tab; })) tab = 'task';
    var body = el('div', { class: 'stack loose' });
    var tabSeg = null;
    function switchTab(v) {
      set('write.tab', v);
      var nseg = seg(TABS, v, function (x) { set('write.tab', x); showTab(x); });
      if (tabSeg) root.replaceChild(nseg, tabSeg); else root.append(nseg);
      tabSeg = nseg;
      showTab(v);
      window.scrollTo(0, 0);
    }
    tabSeg = seg(TABS, tab, function (v) { set('write.tab', v); showTab(v); });
    root.append(tabSeg, body);

    function showTab(v) {
      if (typeof tabCleanup === 'function') { try { tabCleanup(); } catch (e) { /* ignore */ } }
      tabCleanup = null;
      C1.stopSpeaking();
      body.textContent = '';
      if (v === 'upgrade') tabCleanup = renderUpgrade(body);
      else if (v === 'read') tabCleanup = renderRead(body);
      else if (v === 'log') tabCleanup = renderLog(body);
      else tabCleanup = renderTask(body);
      syncCaps();
    }

    /* =================== 1. 言い換え =================== */
    function renderUpgrade(box) {
      var lvKey = 'write.drillLv.s' + S.st;
      var lv = get(lvKey, S.pref, 'string');
      if (lv !== 'B2' && lv !== 'C1') lv = S.pref;
      var skill = get('write.drillSkill', 'all', 'string');
      if (skill !== 'all' && SKILLS.indexOf(skill) < 0) skill = 'all';
      var current = null;
      var graded = 0;

      var filters = el('div', { class: 'stack tight' },
        seg(lvOptions(S), lv, function (v) { lv = v; set(lvKey, v); next(null); }),
        seg([{ v: 'all', t: 'すべて' }].concat(SKILLS.map(function (k) { return { v: k, t: SKILL_JA[k] }; })), skill, function (v) { skill = v; set('write.drillSkill', v); next(null); }));
      var stats = el('p', { class: 'small muted' });
      var cardBox = el('div', { class: 'stack' });
      box.append(filters, stats, cardBox);

      function pool() { return UPGRADES.filter(function (u) { return u.lv === lv && (skill === 'all' || u.skill === skill); }); }
      function drills() { return get('write.drills', {}, 'object'); }
      function step() { return get('write.drillStep', 0, 'number'); }
      function pick(excludeId) {
        var P = pool(), D = drills(), s = step();
        var others = P.filter(function (u) { return u.id !== excludeId; });
        if (!others.length) return P[0] || null;
        var due = others.filter(function (u) { return D[u.id] && D[u.id].due <= s; }).sort(function (a, b) { return D[a.id].due - D[b.id].due; });
        if (due.length) return due[0];
        var rank = {}, seen = {};
        UPGRADES.forEach(function (u) { seen[u.skill] = (seen[u.skill] || 0) + 1; rank[u.id] = seen[u.skill]; });
        var fresh = others.filter(function (u) { return !D[u.id]; }).sort(function (a, b) {
          return (rank[a.id] - rank[b.id]) || (SKILLS.indexOf(a.skill) - SKILLS.indexOf(b.skill));
        });
        if (fresh.length) return fresh[0];
        return others.slice().sort(function (a, b) { return D[a.id].due - D[b.id].due; })[0];
      }
      function updateStats() {
        var P = pool(), D = drills();
        var done = P.filter(function (u) { return D[u.id]; }).length;
        var weak = P.filter(function (u) { return D[u.id] && D[u.id].weak; }).length;
        stats.textContent = '練習済み ' + done + ' / ' + P.length + (weak ? '　苦手 ' + weak : '');
      }
      function grade(u, near) {
        var D = drills(), s = step() + 1;
        var r = D[u.id] && typeof D[u.id] === 'object' ? D[u.id] : { n: 0, streak: 0 };
        r.n = (r.n || 0) + 1;
        if (near) { r.streak = (r.streak || 0) + 1; r.due = s + [6, 15, 35, 70][Math.min(r.streak - 1, 3)]; r.weak = false; }
        else { r.streak = 0; r.due = s + 3; r.weak = true; }
        r.last = C1.today();
        D[u.id] = r;
        set('write.drills', D);
        set('write.drillStep', s);
        flushTime();
        graded++;
        next(u.id);
        // drills have no natural end: offer the next step after every 5th graded drill
        if (graded % 5 === 0) {
          var nc = nextCard();
          if (nc) cardBox.insertBefore(el('div', { class: 'card sunken stack tight' },
            el('p', { class: 'small', text: 'この回で ' + graded + '問 練習しました。区切りにちょうどよいところです。' }), nc), cardBox.firstChild);
        }
      }
      function next(excludeId) {
        current = pick(excludeId);
        updateStats();
        cardBox.textContent = '';
        if (!current) { cardBox.append(el('div', { class: 'card' }, el('p', { class: 'muted', text: 'この条件の練習問題はありません。' }))); return; }
        var u = current;
        var input = el('textarea', { class: 'textarea', rows: '3', lang: 'en', autocapitalize: 'sentences', placeholder: '一段上の英語に書き換えてみましょう', style: { minHeight: '96px' } });
        var reveal = el('div', { class: 'stack', hidden: true });
        var aiOut = el('div', { class: 'stack tight', hidden: true });
        var showBtn = el('button', { type: 'button', class: 'btn primary grow' }, '模範を見る');
        var aiBtn = el('button', { type: 'button', class: 'btn grow', 'data-ai': '' }, 'AIに採点してもらう');
        var hint = S.st === 1
          ? el('p', { class: 'small', text: 'ヒント: ' + u.hint })
          : fold('ヒント', false, [el('p', { class: 'small', text: u.hint })]);
        var card = el('div', { class: 'card' },
          el('div', { class: 'row' }, lvChip(u.lv), el('span', { class: 'chip', text: SKILL_JA[u.skill] || u.skillJa || '' })),
          el('p', { class: 'label' }, 'もとの文'),
          el('p', { class: 'en', text: u.plain }),
          hint,
          input,
          el('div', { class: 'row' }, showBtn, aiBtn),
          aiOut,
          reveal);
        cardBox.append(card,
          el('div', { class: 'row' }, el('button', { type: 'button', class: 'btn ghost', onclick: function () { next(u.id); } }, 'スキップ')));
        showBtn.addEventListener('click', function () {
          if (!reveal.hidden) return;
          reveal.hidden = false;
          showBtn.disabled = true;
          reveal.append(
            el('hr', { class: 'divider' }),
            el('p', { class: 'label' }, '模範'),
            el('p', { class: 'en' }, el('mark', { class: 'ok', text: u.model })),
            el('p', { class: 'label' }, '別の言い方'),
            el('p', { class: 'en', text: u.alt }),
            el('div', { class: 'feedback', text: u.point }),
            el('p', { class: 'small muted', text: '自分の文はどうでしたか。' }),
            el('div', { class: 'btn-grid' },
              el('button', { type: 'button', class: 'btn good', onclick: function () { grade(u, true); } }, '近かった'),
              el('button', { type: 'button', class: 'btn bad', onclick: function () { grade(u, false); } }, '遠かった')));
        });
        aiBtn.addEventListener('click', function () {
          var mine = input.value.trim();
          if (!mine) { C1.toast('先に書き換えた文を入力してください'); input.focus(); return; }
          var prompt = 'You are an English writing coach for a Japanese adult learner. Learner level: ' + S.level + '. Target level: ' + S.target + '.\n' +
            'Exercise: upgrade a plain sentence. Target skill: ' + u.skill + ' (' + (SKILL_EN[u.skill] || u.skill) + ').\n' +
            'Plain sentence: "' + u.plain + '"\n' +
            'One good model answer (other wordings are fine): "' + u.model + '"\n' +
            'Learner\'s version: """' + mine + '"""\n\n' +
            'Judge whether the learner\'s version is grammatical, keeps the meaning, sounds natural and applies the target skill at ' + S.target + ' level. Do not require it to match the model.\n' +
            'Reply with JSON only, exactly this shape: {"ok": boolean, "score": integer 1-5, "comment": "simple Japanese, at most 2 sentences", "improved": "the learner\'s sentence minimally corrected to ' + S.target + ' level, in English"}';
          runAI(aiBtn, aiOut, prompt, vUpgrade, function (v) {
            aiOut.append(
              el('div', { class: 'row' },
                el('span', { class: 'chip ' + (v.ok ? 'good' : 'bad'), text: v.ok ? 'OK' : '要修正' }),
                v.score ? el('span', { class: 'chip', text: 'スコア ' + v.score + '/5' }) : null),
              v.comment ? el('p', { class: 'small', text: v.comment }) : null,
              v.improved ? el('p', { class: 'en' }, el('span', { class: 'small muted' }, '修正例: '), v.improved) : null);
          });
        });
        syncCaps();
      }
      next(null);
      return null;
    }

    /* =================== 2. ライティング =================== */
    var chosenTaskId = null;
    function renderTask(box) {
      var tToday = todayTask(S);
      var task = (chosenTaskId && TASKS.filter(function (t) { return t.id === chosenTaskId; })[0]) || tToday;
      var timer = null;
      var saveTimer = null;
      var textarea = null;
      function saveDraft() {
        if (!textarea || !task || textarea.readOnly) return;
        var drafts = get('write.drafts', {}, 'object');
        var v = textarea.value;
        if (v.trim()) drafts[task.id] = v; else delete drafts[task.id];
        set('write.drafts', drafts);
      }
      if (!task) { box.append(el('div', { class: 'card' }, el('p', { class: 'muted', text: '課題データを読み込めませんでした。' }))); return null; }

      var subs = subsAll();
      var doneIds = {};
      subs.forEach(function (s) { doneIds[s.taskId] = true; });
      var isToday = tToday && task.id === tToday.id;
      var target = Array.isArray(task.target) && task.target.length === 2 ? task.target : (task.lv === 'B2' ? [80, 120] : [120, 180]);

      /* task card */
      var card = el('div', { class: 'card' });
      card.append(el('div', { class: 'row between' },
        el('span', { class: 'label', text: isToday ? '今日の課題' : '選んだ課題' }),
        isToday ? null : el('button', { type: 'button', class: 'btn ghost sm', onclick: function () { chosenTaskId = null; showTab('task'); } }, '今日の課題に戻る')));
      card.append(el('div', { class: 'row' }, lvChip(task.lv), el('span', { class: 'chip', text: task.typeJa || '' }), el('span', { class: 'chip', text: '目標 ' + target[0] + '–' + target[1] + '語' }),
        doneIds[task.id] ? el('span', { class: 'chip good', text: '提出済み' }) : null));
      if (task.titleJa) card.append(el('h2', { class: 'h2', text: task.titleJa }));
      card.append(el('p', { class: 'en', text: task.prompt }));
      if (task.ja) card.append(S.st === 1 ? el('p', { class: 'small muted', text: task.ja }) : fold('日本語訳', false, [el('p', { class: 'small', text: task.ja })]));
      if (Array.isArray(task.plan) && task.plan.length) card.append(fold('構成のヒント', S.st === 1, [el('ul', { class: 'plain small' }, task.plan.map(function (p) { return el('li', { text: p }); }))]));
      if (Array.isArray(task.useful) && task.useful.length) card.append(fold('使える表現', S.st === 1, [el('ul', { class: 'plain' }, task.useful.map(function (p) { return el('li', { class: 'en', style: { fontSize: '15px' }, text: p }); }))]));
      box.append(card);

      /* editor */
      var drafts = get('write.drafts', {}, 'object');
      textarea = el('textarea', { class: 'textarea', rows: '10', lang: 'en', autocapitalize: 'sentences', placeholder: 'ここに英語で書きます。書き始めるとタイマーが動きます。', style: { minHeight: '220px' } });
      textarea.value = typeof drafts[task.id] === 'string' ? drafts[task.id] : '';
      var countEl = el('span', { class: 'write-meter small' });
      var timeEl = el('span', { class: 'write-meter small muted', text: '経過 00:00' });
      var bar = el('i', { style: { width: '0%' } });
      var submitBtn = el('button', { type: 'button', class: 'btn primary block' }, '提出');
      var post = el('div', { class: 'stack' });
      var startedAt = 0, stoppedSec = null;
      function updateCount() {
        var n = wc(textarea.value);
        countEl.textContent = n + ' 語 / 目標 ' + target[0] + '–' + target[1];
        countEl.className = 'write-meter small ' + (n >= target[0] && n <= target[1] ? 'ok' : n > target[1] ? 'ng' : '');
        bar.style.width = Math.min(100, Math.round(n / target[1] * 100)) + '%';
      }
      function elapsed() { return stoppedSec != null ? stoppedSec : startedAt ? (Date.now() - startedAt) / 1000 : 0; }
      textarea.addEventListener('input', function () {
        if (!startedAt && stoppedSec == null) {
          startedAt = Date.now();
          timer = setInterval(function () { timeEl.textContent = '経過 ' + mmss(elapsed()); }, 1000);
        }
        updateCount();
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveDraft, 600);
      });
      updateCount();
      var editor = el('div', { class: 'card' },
        el('div', { class: 'row between' }, countEl, timeEl),
        el('div', { class: 'progress' }, bar),
        textarea,
        submitBtn);
      box.append(editor, post);

      submitBtn.addEventListener('click', function () {
        var text = textarea.value.trim();
        var n = wc(text);
        if (n < 10) { C1.toast('10語以上書いてから提出しましょう'); return; }
        clearInterval(timer); clearTimeout(saveTimer);
        stoppedSec = Math.round(elapsed());
        timeEl.textContent = '経過 ' + mmss(stoppedSec);
        var sub = { id: 's' + Date.now(), date: C1.today(), at: Date.now(), taskId: task.id, lv: task.lv, type: task.type, typeJa: task.typeJa, titleJa: task.titleJa || '', words: n, seconds: stoppedSec, text: text, fb: null };
        var all = subsAll();
        var tot = totals(all);
        set('write.totals', { subs: tot.subs + 1, words: tot.words + n });
        all.unshift(sub);
        set('write.subs', all.slice(0, 40));
        var d = get('write.drafts', {}, 'object');
        delete d[task.id];
        set('write.drafts', d);
        textarea.readOnly = true;
        submitBtn.hidden = true;
        flushTime();
        C1.toast('提出しました');
        renderPost(post, task, sub);
        syncCaps();
      });

      /* list of tasks */
      var lvKey = 'write.taskLv.s' + S.st;
      var listLv = get(lvKey, S.pref, 'string');
      if (listLv !== 'B2' && listLv !== 'C1') listLv = S.pref;
      var list = el('div', { class: 'write-list' });
      function fillList() {
        list.textContent = '';
        TASKS.filter(function (t) { return t.lv === listLv; }).forEach(function (t) {
          list.append(el('button', { type: 'button', class: 'write-item', 'aria-current': String(t.id === task.id), onclick: function () { saveDraft(); chosenTaskId = t.id; showTab('task'); window.scrollTo(0, 0); } },
            el('span', { class: 't' }, el('b', { text: t.titleJa || t.id }), el('span', { class: 'small muted', text: '　' + (t.typeJa || '') })),
            doneIds[t.id] ? el('span', { class: 'chip good', text: '提出済み' }) : lvChip(t.lv)));
        });
      }
      fillList();
      box.append(el('div', { class: 'card' },
        fold('ほかの課題を選ぶ', false, [seg(lvOptions(S), listLv, function (v) { listLv = v; set(lvKey, v); fillList(); }), list])));

      return function () { clearInterval(timer); clearTimeout(saveTimer); saveDraft(); };
    }

    function renderPost(post, task, sub) {
      post.textContent = '';
      var aiOut = el('div', { class: 'stack', hidden: true });
      var aiBtn = el('button', { type: 'button', class: 'btn primary block', 'data-ai': '' }, 'AIフィードバック');
      aiBtn.addEventListener('click', function () {
        var prompt = 'You are an experienced CEFR writing examiner and coach for a Japanese adult learner of English.\n' +
          'Learner\'s current level: ' + S.level + '. Target level: ' + S.target + '.\n' +
          'Task type: ' + (task.type || '') + '. Word target: ' + (task.target ? task.target.join('-') : '') + '.\n' +
          'Task prompt: """' + task.prompt + '"""\n' +
          'Learner\'s text (' + sub.words + ' words): """' + sub.text + '"""\n\n' +
          'Assess the text. Reply with JSON only, exactly this shape:\n' +
          '{"level": one of "A2","B1","B1+","B2","B2+","C1","C2", "scores": {"content": 1-5, "organisation": 1-5, "language": 1-5, "register": 1-5}, ' +
          '"strengths": [2 short strings in simple Japanese], ' +
          '"fixes": [up to 5 objects {"original": exact phrase from the learner\'s text, "better": improved English, "why": short simple Japanese}], ' +
          '"rewrite": "the learner\'s own text upgraded to ' + S.target + ' level, keeping the same ideas and roughly the same length", ' +
          '"next": "one Japanese sentence: the single most useful thing to work on next"}\n' +
          'Prioritise fixes that matter most for reaching ' + S.target + '. Be encouraging but honest.';
        runAI(aiBtn, aiOut, prompt, vFeedback, function (v) {
          aiOut.append(renderFeedback(v));
          var all = subsAll();
          all.forEach(function (s) { if (s.id === sub.id) s.fb = v; });
          set('write.subs', all);
        });
      });
      var checks = el('div', { class: 'write-check stack tight' }, CHECK[S.st].map(function (c) {
        return el('label', null, el('input', { type: 'checkbox' }), el('span', { class: 'small', text: c }));
      }));
      var tot = totals(subsAll());
      var winLine = (sub.seconds > 0 ? secsJa(sub.seconds) + 'で、' : '') + '英語を ' + sub.words + '語 書きました。';
      post.append(el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('h2', { class: 'h2' }, '提出しました'), el('span', { class: 'small muted', text: sub.words + '語・' + mmss(sub.seconds) })),
        el('p', { style: { fontWeight: '600' }, text: winLine }),
        el('p', { class: 'small', text: tot.subs > 1 ? 'これまでの提出は ' + tot.subs + '件、合計 ' + tot.words + '語です。' : '最初の提出です。ここから書く力が積み上がっていきます。' }),
        aiBtn, aiOut,
        fold('モデル回答（' + wc(task.model) + '語）', false, [el('div', { class: 'feedback en', text: task.model }), el('p', { class: 'small muted', text: 'つなぎ語・語彙・書き出しと結びを自分の文章と比べましょう。' })]),
        fold('セルフチェック', !C1.canAsk(), [checks]),
        nextCard(),
        el('button', { type: 'button', class: 'btn block', onclick: function () {
          var d = get('write.drafts', {}, 'object');
          d[task.id] = sub.text;
          set('write.drafts', d);
          chosenTaskId = task.id;
          showTab('task');
        } }, 'もう一度書く（書き直し）')));
    }

    /* =================== 3. 読解 =================== */
    var chosenReadId = null;
    function renderRead(box) {
      var lvKey = 'write.readLv.s' + S.st;
      var lv = get(lvKey, S.pref, 'string');
      if (lv !== 'B2' && lv !== 'C1') lv = S.pref;
      var reads = get('write.reads', {}, 'object');
      var pool = READINGS.filter(function (r) { return r.lv === lv; });
      var item = (chosenReadId && READINGS.filter(function (r) { return r.id === chosenReadId; })[0]) ||
        pool.filter(function (r) { return !reads[r.id]; })[0] || pool[0] || READINGS[0];
      if (!item) { box.append(el('div', { class: 'card' }, el('p', { class: 'muted', text: '読解データを読み込めませんでした。' }))); return null; }

      /* picker */
      var list = el('div', { class: 'write-list' });
      function fillList() {
        list.textContent = '';
        READINGS.filter(function (r) { return r.lv === lv; }).forEach(function (r) {
          var rec = reads[r.id];
          list.append(el('button', { type: 'button', class: 'write-item', 'aria-current': String(r.id === item.id), onclick: function () { chosenReadId = r.id; showTab('read'); window.scrollTo(0, 0); } },
            el('span', { class: 't' }, el('b', { class: 'en', style: { fontSize: '16px' }, text: r.title })),
            rec ? el('span', { class: 'chip good', text: '正解 ' + rec.correct + '/2' }) : lvChip(r.lv)));
        });
      }
      fillList();
      box.append(el('div', { class: 'card' }, fold('文章を選ぶ', false, [seg(lvOptions(S), lv, function (v) { lv = v; set(lvKey, v); fillList(); }), list])));

      /* text */
      var playing = false;
      var playBtn = el('button', { type: 'button', class: 'btn sm', 'data-speak': '' }, '音声で聞く');
      playBtn.addEventListener('click', function () {
        if (playing) { C1.stopSpeaking(); playing = false; playBtn.textContent = '音声で聞く'; return; }
        playing = true;
        playBtn.textContent = '停止';
        C1.speak(item.text, { rate: S.st === 1 ? 0.8 : 1 }).then(function () {
          if (!alive) return;
          playing = false;
          playBtn.textContent = '音声で聞く';
        });
      });
      box.append(el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('div', { class: 'row' }, lvChip(item.lv), el('span', { class: 'chip', text: wc(item.text) + '語' })), playBtn),
        el('h2', { class: 'h2 en', text: item.title }),
        el('p', { class: 'en', text: item.text })));

      /* questions */
      var qs = Array.isArray(item.qs) ? item.qs : [];
      var answered = 0, correct = 0;
      var gistBox = el('div');
      var qCard = el('div', { class: 'card' }, el('p', { class: 'label' }, '内容の確認'));
      qs.forEach(function (q, qi) {
        var why = el('div', { class: 'feedback small', hidden: true });
        var opts = el('div', { class: 'stack tight' });
        var locked = false;
        (q.options || []).forEach(function (o, oi) {
          var b = el('button', { type: 'button', class: 'btn block write-opt', text: String.fromCharCode(65 + oi) + '. ' + o });
          b.addEventListener('click', function () {
            if (locked) return;
            locked = true;
            var ok = oi === q.answer;
            opts.querySelectorAll('button').forEach(function (x, xi) {
              x.disabled = true;
              if (xi === q.answer) x.classList.add('ok');
              else if (xi === oi) x.classList.add('ng');
            });
            why.hidden = false;
            why.textContent = (ok ? '正解。' : '正解は ' + String.fromCharCode(65 + q.answer) + '。') + (q.why || '');
            answered++;
            if (ok) correct++;
            if (answered === qs.length) {
              var r = get('write.reads', {}, 'object');
              r[item.id] = { date: C1.today(), correct: correct };
              set('write.reads', r);
              reads = r;
              fillList();
              flushTime();
              if (item.ja) gistBox.append(fold('日本語の要旨', S.st === 1, [el('p', { class: 'small', text: item.ja })]));
              var nRead = Object.keys(r).length;
              gistBox.append(el('p', { class: 'small', style: { marginTop: '12px' }, text: qs.length + '問中 ' + correct + '問 正解でした。読み終えた文章は ' + nRead + '本です。' }));
              var ncRead = nextCard();
              if (ncRead) gistBox.append(ncRead);
            }
          });
          opts.append(b);
        });
        qCard.append(el('div', { class: 'stack tight' }, el('p', { class: 'en', style: { fontWeight: '600', fontSize: '16px' }, text: (qi + 1) + '. ' + q.q }), opts, why));
      });
      qCard.append(gistBox);
      box.append(qCard);

      /* one-sentence summary */
      var sumIn = el('textarea', { class: 'textarea write-sum', rows: '3', lang: 'en', autocapitalize: 'sentences', placeholder: 'This text argues / explains that ...' });
      var modelBox = el('div', { class: 'stack tight', hidden: true }, el('p', { class: 'label' }, '要約の模範'), el('div', { class: 'feedback en', text: item.summaryModel || '' }),
        el('p', { class: 'small muted', text: '主語と主な主張が入っているか、細部に入りすぎていないかを比べましょう。' }));
      var cmpBtn = el('button', { type: 'button', class: 'btn grow' }, '模範と比べる');
      cmpBtn.addEventListener('click', function () {
        if (!sumIn.value.trim()) { C1.toast('先に要約を1文で書いてみましょう'); sumIn.focus(); return; }
        modelBox.hidden = false;
        flushTime();
      });
      var aiOut = el('div', { class: 'stack tight', hidden: true });
      var aiBtn = el('button', { type: 'button', class: 'btn grow', 'data-ai': '' }, 'AIに見てもらう');
      aiBtn.addEventListener('click', function () {
        var mine = sumIn.value.trim();
        if (!mine) { C1.toast('先に要約を1文で書いてみましょう'); sumIn.focus(); return; }
        var prompt = 'You are an English reading and writing coach for a Japanese adult learner. Learner level: ' + S.level + '. Target level: ' + S.target + '.\n' +
          'Text: """' + item.text + '"""\n' +
          'Model one-sentence summary: "' + (item.summaryModel || '') + '"\n' +
          'Learner\'s one-sentence summary: """' + mine + '"""\n\n' +
          'Judge whether the learner\'s summary captures the main idea accurately in one clear, grammatical sentence (wording may differ from the model).\n' +
          'Reply with JSON only, exactly this shape: {"score": integer 1-5, "comment": "simple Japanese, at most 3 sentences, including one concrete improvement"}';
        runAI(aiBtn, aiOut, prompt, vSummary, function (v) {
          aiOut.append(
            v.score ? el('div', { class: 'row' }, el('span', { class: 'chip ' + (v.score >= 4 ? 'good' : v.score >= 3 ? 'accent' : 'bad'), text: 'スコア ' + v.score + '/5' })) : null,
            v.comment ? el('p', { class: 'small', text: v.comment }) : null);
        });
      });
      var idx = pool.indexOf(item);
      var nextItem = pool.length ? pool[(idx + 1) % pool.length] : null;
      box.append(el('div', { class: 'card' },
        el('h2', { class: 'h2' }, '一文で要約'),
        el('p', { class: 'small muted', text: S.st === 1 ? '要点を英語1文（15～25語）で書きます。' : '要点を英語1文（20～30語）で、筆者の立場も含めて書きます。' }),
        sumIn,
        el('div', { class: 'row' }, cmpBtn, aiBtn),
        aiOut, modelBox),
        nextItem && nextItem !== item ? el('button', { type: 'button', class: 'btn block', onclick: function () { chosenReadId = nextItem.id; showTab('read'); window.scrollTo(0, 0); } }, '次の文章へ') : null);
      return function () { C1.stopSpeaking(); };
    }

    /* =================== 4. 記録 =================== */
    function renderLog(box) {
      var subs = subsAll().slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); }).slice(0, 40);
      if (!subs.length) {
        box.append(el('div', { class: 'card' }, el('p', { class: 'muted', text: '提出した文章がここに表示されます。ライティングで1つ書いてみましょう。' }),
          el('button', { type: 'button', class: 'btn primary', onclick: function () { switchTab('task'); } }, '今日の課題へ')));
        return null;
      }
      var words = subs.reduce(function (s, x) { return s + (Number(x.words) || 0); }, 0);
      box.append(el('div', { class: 'card sunken' }, el('div', { class: 'row between' },
        el('span', null, '提出 ', el('span', { class: 'num', text: String(subs.length) }), ' 件'),
        el('span', null, '合計 ', el('span', { class: 'num', text: String(words) }), ' 語'))));
      var card = el('div', { class: 'card' });
      subs.forEach(function (s) {
        var d = el('details', { class: 'fold' });
        d.append(el('summary', null,
          el('span', { class: 'grow' }, el('span', { class: 'small muted', text: (s.date || '') + '　' }), el('span', { text: s.typeJa || s.type || '' })),
          el('span', { class: 'row', style: { gap: '6px' } },
            el('span', { class: 'small muted', text: (s.words || 0) + '語' }),
            s.fb && s.fb.level ? el('span', { class: 'chip gold', text: s.fb.level }) : null)));
        var inner = el('div', { class: 'stack' });
        inner.append(el('div', { class: 'row' }, lvChip(s.lv), s.titleJa ? el('b', { class: 'small', text: s.titleJa }) : null,
          s.seconds ? el('span', { class: 'small muted', text: mmss(s.seconds) }) : null));
        inner.append(el('div', { class: 'feedback en', text: s.text || '' }));
        if (s.fb && typeof s.fb === 'object') {
          var v = vFeedback(s.fb);
          if (v) inner.append(renderFeedback(v));
        } else inner.append(el('p', { class: 'small muted', text: 'AIフィードバックはありません。' }));
        d.append(inner);
        card.append(d);
      });
      box.append(card);
      return null;
    }

    function cleanupAll() {
      if (typeof tabCleanup === 'function') { try { tabCleanup(); } catch (e) { /* ignore */ } }
      tabCleanup = null;
      flushTime();
      alive = false;
      intervals.forEach(clearInterval);
      evs.forEach(function (n) { container.removeEventListener(n, act, { passive: true }); });
      window.removeEventListener('scroll', act, { passive: true });
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('c1:caps', syncCaps);
      C1.stopSpeaking();
    }

    showTab(tab);
    return cleanupAll;
  }

  C1.register({
    id: 'write',
    label: '書く',
    icon: ICON,
    render: render,
    stats: stats,
    status: function () {
      try {
        var today = C1.today();
        var done = subsAll().some(function (s) { return s.date === today; });
        return '今日のライティング ' + (done ? '提出済み' : '未提出');
      } catch (e) { return ''; }
    },
  });
})();
