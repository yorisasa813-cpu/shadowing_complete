/* C1 Climb — Grammar & Accuracy module. Registers id 'grammar'. */
(function () {
  'use strict';
  const C1 = window.C1;
  if (!C1) return;
  const el = C1.el;
  const DATA = window.C1_GRAMMAR || { units: [], items: [] };
  const UNITS = DATA.units;
  const ITEMS = DATA.items;
  const byId = {};
  ITEMS.forEach((it) => { byId[it.id] = it; });
  const unitById = {};
  UNITS.forEach((u) => { unitById[u.id] = u; });
  const LADDER = [0, 1, 3, 7, 21]; // days until next review at each step
  const SESSION_SIZE = 10;
  const KIND_JA = { mc: '選択', transform: '書き換え', fix: '誤り訂正' };
  const GROUP_JA = { core: '基礎', accuracy: '正確さ', range: '表現の幅' };
  function stageNow() { try { return C1.stage ? C1.stage() : 2; } catch (e) { return 2; } }
  /** Groups in the order the current stage serves them. Stage 1 (B1→B2): core + accuracy; stage 2 (B2→C1): range first, accuracy mixed in. */
  function groupOrder() { return stageNow() === 1 ? ['core', 'accuracy', 'range'] : ['range', 'accuracy', 'core']; }
  function rate() { return stageNow() === 1 ? 0.8 : 1; }
  function lvChip(lv) { return el('span', { class: 'chip ' + (lv === 'C1' ? 'gold' : 'good'), text: lv || '' }); }

  /* ---------- progress ---------- */
  function getProg() { return C1.store.get('grammar.prog', {}) || {}; }
  function saveProg(p) { C1.store.set('grammar.prog', p); }
  function addDays(n) { const d = new Date(); d.setDate(d.getDate() + n); return C1.dateKey(d); }
  function isDue(p) { return !!p && (!p.d || p.d <= C1.today()); }
  function weakIds(prog) { prog = prog || getProg(); return ITEMS.filter((it) => prog[it.id] && prog[it.id].k).map((it) => it.id); }
  function dailyDone() { const d = C1.store.get('grammar.daily', null); return !!(d && d.date === C1.today() && d.done); }

  /** Apply a result; returns the previous record so an override can undo it. */
  function grade(id, right) {
    const prog = getProg();
    const prev = prog[id] ? Object.assign({}, prog[id]) : null;
    const p = prog[id] ? prog[id] : (prog[id] = { s: -1, r: 0, w: 0, k: 0 });
    if (right) {
      p.r++;
      p.s = p.s < 0 ? 2 : Math.min(LADDER.length - 1, p.s + 1);
      if (p.s >= 2) p.k = 0;
      p.d = addDays(LADDER[p.s]);
    } else {
      p.w++; p.s = 0; p.k = 1; p.d = C1.today();
    }
    saveProg(prog);
    return prev;
  }
  function restore(id, prev) {
    const prog = getProg();
    if (prev) prog[id] = prev; else delete prog[id];
    saveProg(prog);
  }
  function unitStats(unitId, prog) {
    let done = 0, r = 0, w = 0, total = 0;
    ITEMS.forEach((it) => {
      if (it.unit !== unitId) return;
      total++;
      const p = prog[it.id];
      if (p) { done++; r += p.r || 0; w += p.w || 0; }
    });
    return { done, total, pct: r + w ? Math.round((r / (r + w)) * 100) : null };
  }

  /* ---------- session building ---------- */
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /**
   * mode: 'daily' | 'unit' | 'weak' | 'alt' (stage 1: C1 challenge; stage 2: B2 basics review).
   * Priority: due wrong items → due reviews → unseen items from the least-practised units of the stage's level.
   */
  function buildSession(mode, unitId) {
    const prog = getProg();
    const st = stageNow();
    const picked = [];
    const has = {};
    const kinds = { mc: 0, transform: 0, fix: 0 };
    const room = () => SESSION_SIZE - picked.length;
    const push = (it) => { has[it.id] = 1; picked.push(it); kinds[it.kind]++; };
    const add = (list) => { for (const it of list) { if (!room()) return; if (!has[it.id]) push(it); } };
    const unitsIn = (groups) => UNITS.filter((u) => groups.includes(u.group)).sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group)).map((u) => u.id);
    /** Unseen items, round-robin over the given units (least practised first), balancing item kinds; at most `max`. */
    const addUnseen = (unitIds, max) => {
      const seen = {};
      unitIds.forEach((id) => { seen[id] = 0; });
      ITEMS.forEach((it) => { if (it.unit in seen && prog[it.id]) seen[it.unit]++; });
      const order = unitIds.map((id, i) => ({ id, i })).sort((a, b) => seen[a.id] - seen[b.id] || a.i - b.i).map((x) => x.id);
      const left = {};
      order.forEach((id) => { left[id] = shuffle(ITEMS.filter((it) => it.unit === id && !prog[it.id] && !has[it.id])); });
      let n = 0, moved = true;
      while (room() && n < max && moved) {
        moved = false;
        for (const id of order) {
          if (!room() || n >= max) break;
          const list = left[id];
          if (!list.length) continue;
          let best = 0;
          for (let i = 1; i < list.length; i++) if (kinds[list[i].kind] < kinds[list[best].kind]) best = i;
          push(list.splice(best, 1)[0]);
          n++; moved = true;
        }
      }
    };
    const bySoonest = (list) => list.filter((it) => prog[it.id]).sort((a, b) => ((prog[a.id].d || '') < (prog[b.id].d || '') ? -1 : 1));

    if (mode === 'weak') {
      const weak = ITEMS.filter((it) => prog[it.id] && prog[it.id].k);
      add(shuffle(weak.filter((it) => isDue(prog[it.id]))));
      add(shuffle(weak));
    } else if (mode === 'unit') {
      const pool = ITEMS.filter((it) => it.unit === unitId);
      add(shuffle(pool.filter((it) => prog[it.id] && prog[it.id].k && isDue(prog[it.id]))));
      add(shuffle(pool.filter((it) => prog[it.id] && isDue(prog[it.id]))));
      addUnseen([unitId], SESSION_SIZE);
      add(bySoonest(pool));
    } else if (mode === 'alt') {
      const ids = unitsIn(st === 1 ? ['range'] : ['core']);
      addUnseen(ids, SESSION_SIZE);
      add(bySoonest(ITEMS.filter((it) => ids.includes(it.unit))));
    } else {
      const due = ITEMS.filter((it) => prog[it.id] && isDue(prog[it.id]));
      add(shuffle(due.filter((it) => prog[it.id].k)));
      add(shuffle(due));
      if (st === 1) {
        addUnseen(unitsIn(['core', 'accuracy']), SESSION_SIZE);
      } else {
        addUnseen(unitsIn(['range']), Math.max(0, room() - 3));
        addUnseen(unitsIn(['accuracy']), SESSION_SIZE);
        addUnseen(unitsIn(['range']), SESSION_SIZE);
      }
      // still short: wrong items not yet due, then the reviews due soonest, then the other level
      add(shuffle(ITEMS.filter((it) => prog[it.id] && prog[it.id].k)));
      const lvNow = st === 1 ? 'B2' : 'C1';
      add(bySoonest(ITEMS.filter((it) => it.lv === lvNow)));
      add(bySoonest(ITEMS));
      addUnseen(unitsIn(st === 1 ? ['range'] : ['core']), SESSION_SIZE);
    }
    return {
      mode, unitId: unitId || null, idx: 0, finished: false, stage: st,
      entries: picked.map((it) => ({
        id: it.id, result: null, given: null,
        order: it.kind === 'mc' ? shuffle(it.options.map((_, i) => i)) : null,
      })),
    };
  }

  /* ---------- answer checking ---------- */
  /**
   * Normalise a typed sentence into comparable tokens: case, whitespace, punctuation, curly quotes,
   * contractions ("hadn't" = "had not", "won't" = "will not", "I'm" = "I am"). Ambiguous contractions stay
   * as wildcard tokens: "'d" matches had / would, a pronoun's "'s" matches is / has.
   */
  function norm(s) {
    s = String(s || '').toLowerCase()
      .replace(/[‘’ʼ`´′]/g, "'").replace(/[“”„″]/g, '"').replace(/[–—―→]/g, ' ')
      .replace(/[.,!?;:"()…]/g, ' ');
    s = s.replace(/\bcan't\b/g, 'can not').replace(/\bcannot\b/g, 'can not').replace(/\bwon't\b/g, 'will not')
      .replace(/\bshan't\b/g, 'shall not').replace(/\bain't\b/g, 'is not').replace(/n't\b/g, ' not')
      .replace(/\blet's\b/g, 'let us').replace(/\bi'm\b/g, 'i am')
      .replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will')
      .replace(/([a-z])'d\b/g, "$1 'd")
      .replace(/\b(he|she|it|there|that|what|who|here|where|how|this)'s\b/g, "$1 's")
      .replace(/([a-z]{3,})iz(e|ed|es|ing|ation|ations)\b/g, '$1is$2')
      .replace(/(^|\s)'+(?=[a-z])(?!d\b|s\b)/g, '$1').replace(/([a-z])'+(?=\s|$)/g, '$1');
    return s.replace(/\s+/g, ' ').trim();
  }
  const WILD = { "'d": ['had', 'would', "'d"], "'s": ['is', 'has', "'s"] };
  function tokEq(a, b) { return a === b || (WILD[a] && WILD[a].includes(b)) || (WILD[b] && WILD[b].includes(a)); }
  function sameSentence(a, b) {
    const x = norm(a).split(' '), y = norm(b).split(' ');
    if (!x[0] || x.length !== y.length) return false;
    for (let i = 0; i < x.length; i++) if (!tokEq(x[i], y[i])) return false;
    return true;
  }
  function isCorrect(item, typed) {
    return !!norm(typed) && item.answers.some((a) => sameSentence(typed, a));
  }
  function words(s) { return String(s || '').trim().split(/\s+/).filter(Boolean); }
  function wkey(w) { return w.toLowerCase().replace(/[‘’]/g, "'").replace(/[.,!?;:"()“”]/g, ''); }
  /** LCS over words; returns [flagsA, flagsB] (true = word is shared). */
  function lcsFlags(a, b) {
    const ka = a.map(wkey), kb = b.map(wkey);
    const n = ka.length, m = kb.length;
    const t = [];
    for (let i = 0; i <= n; i++) { t.push(new Array(m + 1).fill(0)); }
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) t[i][j] = ka[i] === kb[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
    const fa = new Array(n).fill(false), fb = new Array(m).fill(false);
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (ka[i] === kb[j]) { fa[i] = fb[j] = true; i++; j++; } else if (t[i + 1][j] >= t[i][j + 1]) i++; else j++;
    }
    return { fa, fb, len: t[0][0] };
  }
  function closestAnswer(item, typed) {
    const tw = words(typed);
    let best = item.answers[0], bestScore = -1;
    item.answers.forEach((a) => {
      const aw = words(a);
      const score = lcsFlags(tw, aw).len * 2 - Math.abs(aw.length - tw.length) * 0.01;
      if (score > bestScore) { bestScore = score; best = a; }
    });
    return best;
  }
  function diffLine(ws, flags, cls) {
    const p = el('p', { class: 'en' });
    ws.forEach((w, i) => {
      if (i) p.append(' ');
      p.append(flags[i] ? document.createTextNode(w) : el('mark', { class: cls, text: w }));
    });
    return p;
  }
  function correctSentence(item, typed) {
    if (item.kind === 'mc') {
      const opt = item.options[item.answer];
      const q = item.q.indexOf('→') >= 0 ? item.q.slice(item.q.lastIndexOf('→') + 1) : item.q;
      return q.replace('___', /^[(（]/.test(opt) ? '' : opt).replace(/"/g, '').replace(/\s+/g, ' ').replace(/ ([.,?!])/g, '$1').trim();
    }
    return typed != null ? closestAnswer(item, typed) : item.answers[0];
  }

  /* ---------- styles ---------- */
  function ensureStyle() {
    if (document.getElementById('grammar-style')) return;
    const s = document.createElement('style');
    s.id = 'grammar-style';
    s.textContent = [
      '.grammar-opt{justify-content:flex-start;text-align:left;font-family:var(--font-en);font-size:16.5px;font-weight:400;line-height:1.45;white-space:normal;overflow-wrap:anywhere;min-height:48px}',
      '.grammar-opt.is-right{background:var(--good-soft);border-color:var(--good);color:var(--good);font-weight:600}',
      '.grammar-opt.is-wrong{background:var(--bad-soft);border-color:var(--bad);color:var(--bad)}',
      '.grammar-row{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:10px 0;background:none;border:0;border-top:1px solid var(--line);text-align:left;cursor:pointer}',
      '.grammar-row:first-child{border-top:0}',
      '.grammar-row .t{flex:1 1 0;min-width:0}',
      '.grammar-row .t b{display:block;font-weight:600}',
      '.grammar-input{min-height:92px}',
      '.grammar-cue{font-family:var(--font-en);font-weight:600;font-size:16px;color:var(--accent);background:var(--accent-soft);border-radius:6px;padding:1px 8px}',
      '.grammar-pat{border-left:3px solid var(--line);padding-left:10px}',
    ].join('\n');
    document.head.append(s);
  }

  /* ---------- view state (kept while the page lives, so a session survives tab switches) ---------- */
  const state = { tab: 'drill', session: null, openUnit: null };

  function unitInfo(u) {
    return el('div', { class: 'stack' },
      el('p', { text: u.explain }),
      el('div', { class: 'stack tight' }, u.patterns.map((p) => el('div', { class: 'grammar-pat' },
        el('p', { class: 'small muted', text: p.form }), el('p', { class: 'en', text: p.ex })))),
      el('p', { class: 'small' }, el('span', { class: 'chip gold', text: '注意' }), ' ', u.pitfalls));
  }

  function render(container) {
    ensureStyle();
    let alive = true;
    let itemStart = Date.now();
    const body = el('div', { class: 'stack loose' });
    const seg = el('div', { class: 'seg', role: 'group', 'aria-label': '表示の切り替え' });
    const TABS = [['drill', '今日のドリル'], ['units', 'ユニット'], ['weak', '弱点']];
    TABS.forEach(([id, label]) => seg.append(el('button', { type: 'button', 'data-tab': id, onclick: () => { state.tab = id; if (id === 'units') state.openUnit = null; draw(); } }, label)));
    container.append(
      el('div', { class: 'stack tight' },
        el('h1', { class: 'h1', text: '文法と正確さ' }),
        el('p', { class: 'muted small', text: stageNow() === 1
          ? '時制・条件文・受動態などの「基礎」と、冠詞・前置詞などの「正確さ」を10問ずつ固めます。B2では、基本の構文をまちがえずに使えることが求められます。'
          : '倒置・分裂文などの「表現の幅」と、冠詞・前置詞などの「正確さ」を鍛えます。C1では、多様な構文をまちがえずに使い分ける力が問われます。' })),
      seg, body);

    function syncPlay() {
      const can = C1.canSpeak();
      body.querySelectorAll('.grammar-play').forEach((b) => { b.hidden = !can; });
    }
    const onCaps = () => { if (alive) syncPlay(); };
    document.addEventListener('c1:caps', onCaps);

    function draw() {
      C1.stopSpeaking();
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tab === state.tab ? 'true' : 'false'));
      body.innerHTML = '';
      if (state.tab === 'drill') drawDrill();
      else if (state.tab === 'units') { if (state.openUnit && unitById[state.openUnit]) drawUnit(unitById[state.openUnit]); else drawUnits(); }
      else drawWeak();
      syncPlay();
    }
    function startSession(mode, unitId) {
      state.session = buildSession(mode, unitId);
      state.tab = 'drill';
      draw();
      window.scrollTo(0, 0);
    }

    /* ----- drill ----- */
    function sessionTitle(s) {
      if (s.mode === 'unit') return 'ユニット練習:' + (unitById[s.unitId] ? unitById[s.unitId].ja : '');
      if (s.mode === 'weak') return '弱点の練習';
      if (s.mode === 'alt') return s.stage === 1 ? 'C1に挑戦' : 'B2の基礎を復習';
      return '今日のドリル';
    }
    function drawDrill() {
      if (!ITEMS.length) { body.append(el('div', { class: 'card' }, el('p', { text: '問題データを読み込めませんでした。' }))); return; }
      if (!state.session || !state.session.entries.length || state.session.entries.some((e) => !byId[e.id])) state.session = buildSession('daily');
      const s = state.session;
      if (s.finished) { drawEnd(s); return; }
      const entry = s.entries[s.idx];
      const item = byId[entry.id];
      const unit = unitById[item.unit];
      itemStart = Date.now();

      const head = el('div', { class: 'stack tight' },
        el('div', { class: 'row between' },
          el('span', { class: 'label', text: sessionTitle(s) }),
          el('span', { class: 'small muted num', text: (s.idx + 1) + ' / ' + s.entries.length })),
        el('div', { class: 'progress' }, el('i', { style: { width: Math.round((s.idx / s.entries.length) * 100) + '%' } })));
      const card = el('div', { class: 'card' });
      const after = el('div', { class: 'stack' });
      card.append(el('div', { class: 'row' },
        el('span', { class: 'chip accent', text: unit ? unit.ja : '' }),
        lvChip(item.lv),
        el('span', { class: 'chip', text: KIND_JA[item.kind] })));
      body.append(head, card, after);
      if (s.mode !== 'daily') {
        body.append(el('button', { type: 'button', class: 'btn ghost sm', onclick: () => { state.session = buildSession('daily'); draw(); } }, '今日のドリルに戻る'));
      }

      if (entry.result) { // re-opened after answering: show the answer and move on
        card.append(el('p', { class: 'en', text: item.q }));
        showFeedback(entry.result === 'right', entry.given, false);
        return;
      }

      // hint: the unit's first pattern. Visible at stage 1 (more support), behind a tap at stage 2.
      const hintText = unit && unit.patterns && unit.patterns[0] ? unit.patterns[0].form : '';
      const hint = !hintText ? null : stageNow() === 1
        ? el('p', { class: 'small muted' }, el('span', { class: 'chip', text: 'ヒント' }), ' ' + hintText)
        : el('details', { class: 'fold' }, el('summary', { class: 'small', text: 'ヒント' }), el('div', null, el('p', { class: 'small muted', text: hintText })));

      if (item.kind === 'mc') {
        card.append(el('p', { class: 'small muted', text: '空所に入る最も適切なものを選んでください。' }), el('p', { class: 'en', text: item.q }));
        const opts = el('div', { class: 'stack tight' });
        let locked = false;
        entry.order.forEach((oi) => {
          const b = el('button', { type: 'button', class: 'btn block grammar-opt', 'data-oi': String(oi), onclick: () => {
            if (locked) return;
            locked = true;
            opts.querySelectorAll('button').forEach((x) => {
              const xi = Number(x.dataset.oi);
              if (xi === item.answer) x.classList.add('is-right'); else if (xi === oi) x.classList.add('is-wrong');
              x.setAttribute('aria-disabled', 'true');
            });
            if (hint) hint.remove();
            answer(oi === item.answer, item.options[oi]);
          } }, item.options[oi]);
          opts.append(b);
        });
        card.append(opts);
        if (hint) card.append(hint);
      } else {
        if (item.kind === 'transform') {
          card.append(el('p', { class: 'small muted', text: '指定の語句を使って、ほぼ同じ意味の文に書き換えてください。' }),
            el('p', { class: 'en', text: item.q }),
            el('p', { class: 'small' }, '使う語句: ', el('span', { class: 'grammar-cue', text: item.cue })));
        } else {
          card.append(el('p', { class: 'small muted', text: '誤りが1か所あります。正しい文を全文で入力してください。' }), el('p', { class: 'en', text: item.q }));
        }
        const ta = el('textarea', { class: 'textarea grammar-input', rows: '3', autocapitalize: 'sentences', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', 'aria-label': '答えの文', placeholder: item.kind === 'transform' ? item.cue + ' …' : '正しい文を入力' });
        if (item.kind === 'fix') ta.value = item.q;
        let locked = false;
        const submit = (giveUp) => {
          if (locked) return;
          const typed = ta.value.trim();
          if (!giveUp && !typed) { C1.toast('答えを入力してください'); return; }
          locked = true;
          ta.readOnly = true;
          controls.remove();
          if (hint) hint.remove();
          answer(!giveUp && isCorrect(item, typed), giveUp ? '' : typed);
        };
        ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(false); } });
        const controls = el('div', { class: 'row' },
          el('button', { type: 'button', class: 'btn primary grow', onclick: () => submit(false) }, '答え合わせ'),
          el('button', { type: 'button', class: 'btn ghost', onclick: () => submit(true) }, '答えを見る'));
        card.append(ta, controls);
        if (hint) card.append(hint);
      }

      function answer(right, given) {
        const minutes = Math.min(1.5, Math.max(0.05, (Date.now() - itemStart) / 60000));
        entry.prev = grade(item.id, right);
        entry.hadPrev = true;
        entry.result = right ? 'right' : 'wrong';
        entry.given = given;
        C1.logActivity('grammar', minutes);
        showFeedback(right, given, true);
      }

      function showFeedback(right, given, fresh) {
        after.innerHTML = '';
        const typedKind = item.kind !== 'mc';
        const model = correctSentence(item, typedKind && given ? given : null);
        const fb = el('div', { class: 'card' });
        const verdict = el('span', { class: 'chip ' + (right ? 'good' : 'bad'), text: right ? '正解' : '不正解' });
        const play = el('button', { type: 'button', class: 'btn sm grammar-play', 'aria-label': '正しい文を聞く', onclick: () => { C1.speak(model, { rate: rate() }); } }, '▶ 聞く');
        fb.append(el('div', { class: 'row between' }, verdict, play));
        if (!right && typedKind && given) {
          const uw = words(given), mw = words(model);
          const f = lcsFlags(uw, mw);
          fb.append(
            el('div', { class: 'stack tight' }, el('span', { class: 'label', text: 'あなたの答え' }), diffLine(uw, f.fa, 'ng')),
            el('div', { class: 'stack tight' }, el('span', { class: 'label', text: '模範解答' }), diffLine(mw, f.fb, 'ok')));
        } else {
          fb.append(el('div', { class: 'stack tight' }, el('span', { class: 'label', text: right ? '正しい文' : '模範解答' }), el('p', { class: 'en', text: model })));
        }
        if (typedKind && item.answers.length > 1) {
          const others = item.answers.filter((a) => a !== model);
          fb.append(el('details', { class: 'fold' }, el('summary', { text: 'ほかの正解例(' + others.length + ')' }),
            el('div', { class: 'stack tight' }, others.map((a) => el('p', { class: 'en', text: a })))));
        }
        fb.append(el('div', { class: 'feedback', text: item.why }));
        if (unit) fb.append(el('details', { class: 'fold' }, el('summary', { text: 'ユニット解説:' + unit.ja }), unitInfo(unit)));
        if (!right && typedKind && given && entry.hadPrev) {
          fb.append(el('button', { type: 'button', class: 'btn sm', onclick: () => {
            restore(item.id, entry.prev);
            entry.prev = grade(item.id, true);
            entry.result = 'right';
            C1.toast('正解として記録しました');
            showFeedback(true, given, false);
            syncPlay();
          } }, '正解にする(別の言い方として正しい場合)'));
        }
        const last = s.idx >= s.entries.length - 1;
        const next = el('button', { type: 'button', class: 'btn primary block', onclick: () => {
          if (last) {
            s.finished = true;
            if (s.mode === 'daily') C1.store.set('grammar.daily', { date: C1.today(), done: true });
          } else s.idx++;
          draw();
          window.scrollTo(0, 0);
        } }, last ? '結果を見る' : '次へ');
        after.append(fb, next);
        syncPlay();
        if (fresh) { try { next.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) { /* older engines */ } }
      }
    }

    /** One calm line on what this session achieved: score plus the unit whose overall accuracy rose most. */
    function winLine(s, total, right) {
      let line = total + '問に取り組み、' + right + '問正解でした。';
      try {
        const now = getProg();
        const before = Object.assign({}, now);
        s.entries.forEach((e) => { if (!e.hadPrev) return; if (e.prev) before[e.id] = e.prev; else delete before[e.id]; });
        let best = null;
        const seen = {};
        s.entries.forEach((e) => {
          const u = byId[e.id] && byId[e.id].unit;
          if (!u || seen[u] || !unitById[u]) return;
          seen[u] = 1;
          const a = unitStats(u, before), b = unitStats(u, now);
          if (a.pct == null || b.pct == null || b.pct <= a.pct) return;
          if (!best || b.pct - a.pct > best.b - best.a) best = { name: unitById[u].ja, a: a.pct, b: b.pct };
        });
        if (best) line += '「' + best.name + '」の正答率が ' + best.a + '% から ' + best.b + '% に上がりました。';
      } catch (e) { /* keep the score line */ }
      return line;
    }

    function drawEnd(s) {
      const total = s.entries.length;
      const right = s.entries.filter((e) => e.result === 'right').length;
      const per = {};
      s.entries.forEach((e) => {
        const u = byId[e.id].unit;
        if (!per[u]) per[u] = { r: 0, n: 0 };
        per[u].n++; if (e.result === 'right') per[u].r++;
      });
      const rows = UNITS.filter((u) => per[u.id]).map((u) => el('div', { class: 'row between' },
        el('span', { class: 'grow', text: u.ja }),
        el('span', { class: 'num ' + (per[u.id].r === per[u.id].n ? 'ok' : per[u.id].r === 0 ? 'ng' : ''), text: per[u.id].r + ' / ' + per[u.id].n })));
      const missed = total - right;
      body.append(
        el('div', { class: 'card' },
          el('span', { class: 'label', text: sessionTitle(s) + ' 結果' }),
          el('p', { class: 'en-big' }, el('span', { class: 'num', text: String(right) }), ' / ' + total),
          el('p', { class: 'small', text: winLine(s, total, right) }),
          el('p', { class: 'muted small', text: missed ? 'まちがえた ' + missed + '問は弱点に入りました。次のドリルと翌日にもう一度出題されます。' : '全問正解です。正解した問題は3日後・7日後・21日後に復習します。' })));
      if (C1.engage && C1.engage.nextCard) {
        try { const nc = C1.engage.nextCard('grammar'); if (nc) body.append(nc); } catch (e) { /* engine optional */ }
      }
      body.append(
        el('div', { class: 'card' }, el('h2', { class: 'h2', text: 'ユニット別' }), el('div', { class: 'stack tight' }, rows)),
        el('button', { type: 'button', class: 'btn primary block', onclick: () => {
          const hasWeak = s.mode === 'weak' && weakIds().length > 0;
          startSession(s.mode === 'weak' && !hasWeak ? 'daily' : s.mode, s.unitId);
        } }, 'もう10問'),
        s.mode !== 'daily' ? el('button', { type: 'button', class: 'btn block', onclick: () => startSession('daily') }, '今日のドリルへ') : null,
        s.mode !== 'alt' ? el('button', { type: 'button', class: 'btn block', onclick: () => startSession('alt') }, stageNow() === 1 ? 'C1に挑戦(表現の幅から10問)' : 'B2の基礎を復習(10問)') : null,
        missed ? el('button', { type: 'button', class: 'btn ghost block', onclick: () => { state.tab = 'weak'; draw(); } }, '弱点を確認する') : null);
    }

    /* ----- units ----- */
    function drawUnits() {
      const prog = getProg();
      body.append(el('p', { class: 'small muted', text: stageNow() === 1
        ? 'いまの段階(B1→B2)では「基礎」と「正確さ」が中心です。「表現の幅」はC1向けの発展ユニットです。'
        : 'いまの段階(B2→C1)では「表現の幅」が中心です。「正確さ」と「基礎」は復習に使えます。' }));
      groupOrder().forEach((g) => {
        const title = GROUP_JA[g];
        const list = el('div', null);
        UNITS.filter((u) => u.group === g).forEach((u) => {
          const st = unitStats(u.id, prog);
          list.append(el('button', { type: 'button', class: 'grammar-row', onclick: () => { state.openUnit = u.id; draw(); window.scrollTo(0, 0); } },
            el('span', { class: 't' }, el('b', { text: u.ja }), el('span', { class: 'small muted', text: u.name + ' ・ ' + st.done + ' / ' + st.total + '問' })),
            lvChip(u.lv),
            el('span', { class: 'chip ' + (st.pct == null ? '' : st.pct >= 80 ? 'good' : st.pct >= 50 ? 'gold' : 'bad'), text: st.pct == null ? '未着手' : '正答率 ' + st.pct + '%' }),
            el('span', { class: 'muted', 'aria-hidden': 'true', text: '›' })));
        });
        body.append(el('div', { class: 'card' }, el('h2', { class: 'h2', text: title }), list));
      });
    }
    function drawUnit(u) {
      const st = unitStats(u.id, getProg());
      body.append(
        el('button', { type: 'button', class: 'btn ghost sm', style: { alignSelf: 'flex-start' }, onclick: () => { state.openUnit = null; draw(); } }, '‹ ユニット一覧へ'),
        el('div', { class: 'card' },
          el('div', { class: 'stack tight' },
            el('div', { class: 'row' }, el('span', { class: 'label', text: GROUP_JA[u.group] || '' }), lvChip(u.lv)),
            el('h2', { class: 'h2', text: u.ja }),
            el('p', { class: 'en muted', text: u.name })),
          el('p', { class: 'small muted', text: '進み具合 ' + st.done + ' / ' + st.total + '問' + (st.pct == null ? '' : ' ・ 正答率 ' + st.pct + '%') }),
          el('div', { class: 'progress' }, el('i', { style: { width: (st.total ? Math.round((st.done / st.total) * 100) : 0) + '%' } })),
          unitInfo(u),
          el('button', { type: 'button', class: 'btn primary block', onclick: () => startSession('unit', u.id) }, 'このユニットを練習')));
    }

    /* ----- weak ----- */
    function drawWeak() {
      const prog = getProg();
      const ids = weakIds(prog);
      if (!ids.length) {
        body.append(el('div', { class: 'card' },
          el('h2', { class: 'h2', text: '弱点はありません' }),
          el('p', { class: 'muted', text: 'ドリルでまちがえた問題がここにたまります。2回続けて正解すると弱点から外れます。' }),
          el('button', { type: 'button', class: 'btn primary block', onclick: () => { state.tab = 'drill'; draw(); } }, '今日のドリルへ')));
        return;
      }
      body.append(el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('h2', { class: 'h2', text: '弱点 ' + ids.length + '問' }),
          el('span', { class: 'chip bad', text: '今日出題 ' + ids.filter((id) => isDue(prog[id])).length + '問' })),
        el('p', { class: 'small muted', text: 'まちがえた問題は、次のドリルと翌日にもう一度出題されます。2回続けて正解すると弱点から外れます。' }),
        el('button', { type: 'button', class: 'btn primary block', onclick: () => startSession('weak') }, '弱点だけ練習')));
      const go = groupOrder();
      UNITS.slice().sort((a, b) => go.indexOf(a.group) - go.indexOf(b.group)).forEach((u) => {
        const list = ids.filter((id) => byId[id].unit === u.id);
        if (!list.length) return;
        body.append(el('div', { class: 'card' },
          el('div', { class: 'row between' }, el('h2', { class: 'h2', text: u.ja }), el('span', { class: 'row' }, lvChip(u.lv), el('span', { class: 'chip', text: list.length + '問' }))),
          el('ul', { class: 'plain' }, list.map((id) => {
            const it = byId[id];
            return el('li', null, el('span', { class: 'en', text: it.q }), ' ',
              el('span', { class: 'chip', text: KIND_JA[it.kind] }),
              it.kind === 'transform' ? el('span', { class: 'small muted', text: ' → ' + it.cue }) : null);
          }))));
      });
    }

    draw();
    return function cleanup() {
      alive = false;
      document.removeEventListener('c1:caps', onCaps);
      C1.stopSpeaking();
    };
  }

  /** Motivation-layer contract: numbers only, zeros when empty, never throws. */
  function stats() {
    const zero = { answered: 0, correctRate: 0, unitsMastered: 0, unitsTotal: UNITS.length || 0, weak: 0 };
    try {
      const prog = getProg();
      if (!prog || typeof prog !== 'object') return zero;
      const num = (v) => { const n = Number(v); return isFinite(n) && n > 0 ? n : 0; };
      let r = 0, w = 0, weak = 0;
      const per = {};
      ITEMS.forEach((it) => {
        const p = prog[it.id];
        if (!p || typeof p !== 'object') return;
        const pr = num(p.r), pw = num(p.w);
        r += pr; w += pw;
        if (p.k) weak++;
        if (!per[it.unit]) per[it.unit] = { r: 0, w: 0 };
        per[it.unit].r += pr; per[it.unit].w += pw;
      });
      let mastered = 0;
      UNITS.forEach((u) => {
        const x = per[u.id];
        if (x && x.r + x.w >= 8 && x.r / (x.r + x.w) >= 0.8) mastered++;
      });
      return { answered: r + w, correctRate: r + w ? Math.round((r / (r + w)) * 100) : 0, unitsMastered: mastered, unitsTotal: UNITS.length, weak };
    } catch (e) { return zero; }
  }

  C1.register({
    id: 'grammar',
    label: '文法',
    icon: '<svg viewBox="0 0 24 24"><path d="M4 6h11M4 12h7M4 18h5"/><path d="M13 17l3 3 5-7"/></svg>',
    render,
    stats,
    status() {
      const n = weakIds().length;
      return '今日のドリル ' + (dailyDone() ? '完了' : '未完了') + (n ? '・弱点 ' + n + '問' : '');
    },
  });
})();
