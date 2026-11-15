/* C1 Climb — listening module: gist, dictation, shadowing. */
(function () {
  'use strict';
  const C1 = window.C1;
  const el = C1.el;
  const DATA = Array.isArray(window.C1_LISTEN) ? window.C1_LISTEN : [];
  const KEY = 'listen.progress';
  const RATES = [0.7, 0.8, 1.0, 1.2];
  function lvOf(p) { return p && p.lv === 'B2' ? 'B2' : 'C1'; }
  function curStage() { try { return C1.stage() === 2 ? 2 : 1; } catch (e) { return 1; } }
  /** Main pool for the learner's stage (stage 1 → lv B2, stage 2 → lv C1) and the secondary pool. */
  function pools() {
    const main = curStage() === 1 ? 'B2' : 'C1';
    return { main: DATA.filter((p) => lvOf(p) === main), other: DATA.filter((p) => lvOf(p) !== main) };
  }
  const MODES = [['gist', '聞き取り'], ['dict', 'ディクテーション'], ['shadow', 'シャドーイング']];
  let carry = 0; // unlogged practice ms carried between renders

  /* ---------- Radio Eikaiwa bridge (C1.radio, optional). All lesson text comes from the bridge at run time. ---------- */
  const RKEY = 'listen.radio';          // { [lessonId]: { best, last, runs, at } } — C1 Climb's own storage only
  const RRATES = [0.7, 0.8, 1.0];
  const RLIST_MAX = 12;
  function radioOK() { try { return !!(C1.radio && C1.radio.available()); } catch (e) { return false; } }
  function radioCall(name, args, dflt) {
    try { const R = C1.radio; return R && typeof R[name] === 'function' ? R[name].apply(R, args || []) : dflt; } catch (e) { return dflt; }
  }
  function radioLessons() { const a = radioOK() ? radioCall('lessons', [], []) : []; return Array.isArray(a) ? a : []; }
  function radioProg() { const p = C1.store.get(RKEY, {}); return p && typeof p === 'object' ? p : {}; }
  function radioRec(id) { const r = radioProg()[id]; return r && typeof r === 'object' ? r : {}; }
  function radioPlayable() { return radioLessons().filter((l) => l && l.canPlayAll); }
  /** Lessons for the dictation list: most recently practised here first, then started in Shadowing Coach, then newest date. */
  function radioSorted(list) {
    const pr = radioProg();
    return list.slice().sort((a, b) => {
      const ta = Number((pr[a.id] || {}).at) || 0, tb = Number((pr[b.id] || {}).at) || 0;
      if (ta !== tb) return tb - ta;
      if (!!a.started !== !!b.started) return a.started ? -1 : 1;
      return String(b.date || '') < String(a.date || '') ? -1 : String(b.date || '') > String(a.date || '') ? 1 : 0;
    });
  }
  function radioSummaryCounts() {
    if (!radioOK()) return null;
    const pr = radioProg();
    const pl = radioPlayable();
    let runs = 0;
    Object.keys(pr).forEach((k) => { const r = Number(pr[k] && pr[k].runs); if (isFinite(r) && r > 0) runs += Math.floor(r); });
    return { runs: runs, done: pl.filter((l) => Number((pr[l.id] || {}).runs) > 0).length, total: pl.length };
  }

  function addStyle() {
    if (document.getElementById('listen-style')) return;
    const s = document.createElement('style');
    s.id = 'listen-style';
    s.textContent =
      '.listen-list{display:flex;flex-direction:column}' +
      '.listen-item{display:flex;align-items:center;gap:10px;width:100%;min-height:56px;padding:10px 0;background:none;border:0;border-top:1px solid var(--line);text-align:left;cursor:pointer}' +
      '.listen-item:first-child{border-top:0}' +
      '.listen-item .t{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px}' +
      '.listen-item .t b{font-weight:600;overflow-wrap:anywhere}' +
      '.listen-peek{width:100%;min-height:72px;border:1px dashed var(--line);border-radius:var(--r-sm);background:var(--sunken);color:var(--muted);padding:12px;text-align:left;cursor:pointer}' +
      '.listen-diff{line-height:1.9;overflow-wrap:anywhere}' +
      '.listen-opt{justify-content:flex-start;text-align:left;height:auto}' +
      '.listen-play{min-height:64px;font-size:18px}';
    document.head.append(s);
  }

  /* ---------- progress ---------- */
  function allProg() { const p = C1.store.get(KEY, {}); return p && typeof p === 'object' ? p : {}; }
  function getProg(id) { return allProg()[id] || {}; }
  function setProg(id, patch) {
    const all = allProg();
    all[id] = Object.assign({}, all[id] || {}, patch);
    C1.store.set(KEY, all);
  }
  function steps(pr) { return (pr.gist === true ? 1 : 0) + (typeof pr.dict === 'number' ? 1 : 0) + (pr.shadow >= 1 ? 1 : 0); }
  function isDone(pr) { return steps(pr) === 3; }
  function doneCount(list) { const all = allProg(); return (list || pools().main).filter((p) => isDone(all[p.id] || {})).length; }

  /* ---------- word diff (LCS) ---------- */
  function norm(w) {
    return String(w).toLowerCase().replace(/[‘’`]/g, "'").replace(/[^a-z0-9']/g, '').replace(/^'+|'+$/g, '');
  }
  // Hyphens and dashes separate words, so "twenty-minute" matches "twenty minute" and vice versa.
  function units(token) { return String(token).split(/[-‐‑–—\/]+/).map(norm).filter(Boolean); }
  function words(text) { return String(text || '').split(/\s+/).reduce((a, w) => a.concat(units(w)), []); }
  /** Align learner text against target; returns {node, acc, missed[]} */
  function diff(target, typed) {
    // display tokens (split on spaces) each own one or more matching units
    const raw = String(target).split(/\s+/).filter(Boolean).map((w) => ({ w: w, parts: units(w).map((n) => ({ n: n, hit: false })) }));
    const t = raw.reduce((a, x) => a.concat(x.parts), []);
    const u = words(typed);
    const n = t.length, m = u.length;
    const L = [];
    for (let i = 0; i <= n; i++) { L.push(new Array(m + 1).fill(0)); }
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        L[i][j] = t[i].n === u[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      }
    }
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (t[i].n === u[j]) { t[i].hit = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
    }
    const node = el('p', { class: 'en listen-diff' });
    const missed = [];
    const hits = t.filter((x) => x.hit).length;
    raw.forEach((x, k) => {
      if (k) node.append(' ');
      if (!x.parts.length) { node.append(x.w); return; }
      const ok = x.parts.every((q) => q.hit);
      x.parts.forEach((q) => { if (!q.hit && missed.indexOf(q.n) < 0) missed.push(q.n); });
      node.append(el('mark', { class: ok ? 'ok' : 'ng' }, x.w));
    });
    return { node: node, acc: n ? Math.round((hits / n) * 100) : 0, missed: missed };
  }

  function tipsFold() {
    return el('details', { class: 'fold' },
      el('summary', null, 'なぜこの練習が効くか'),
      el('div', null, el('ul', { class: 'plain small' },
        el('li', null, '音はつながります。子音で終わる語と母音で始まる語は一語のように聞こえます（例: turn up → 「ターナップ」、a lot of → 「アロタヴ」）。書き取りで落とした箇所が、自分の聞き取れない連結です。'),
        el('li', null, '機能語は弱く短くなります。to, of, and, have, can などは強く発音されず、should\'ve は「シュダヴ」、going to は「ガナ」に近くなります。弱形を知っていれば聞こえるようになります。'),
        el('li', null, '自分で言える音は聞き取れます。シャドーイングで同じリズムと速さを口で再現すると、速い自然な発話でも意味のかたまりごとに処理できるようになります。')
      )));
  }

  function render(root) {
    addStyle();
    let cur = null;        // selected passage
    let mode = 'gist';
    let st = {};           // state of the current mode
    let body = null;       // mode container
    const stage = curStage();
    const pool = pools();
    const ordered = pool.main.concat(pool.other);
    // a stored rate exists only when the learner picked one; otherwise stage 1 starts slower
    let rate = C1.store.get('listen.rate', null);
    if (RATES.indexOf(rate) < 0) rate = stage === 1 ? 0.8 : 1.0;
    let recGen = 0;        // bumps whenever audio/recording is cut off externally
    let speakOK = C1.canSpeak();
    let dictOK = C1.canDictate();
    let playTok = 0;
    let resetBtn = null;
    let speaking = false;
    let rec = null;        // active speech-to-text session
    let dead = false;
    let radioId = null;    // Radio Eikaiwa lesson open in radio dictation
    let radioBox = null;   // landing-screen container for the Radio Eikaiwa section
    let radioAll = false;  // "もっと見る" expanded
    let rrate = C1.store.get('listen.radioRate', null);
    if (RRATES.indexOf(rrate) < 0) rrate = stage === 1 ? 0.8 : 1.0;

    /* ----- time tracking: counts only while practising, visible and recently active ----- */
    let lastAct = 0, lastTick = Date.now();
    function touch() { lastAct = Date.now(); }
    function flush(force) {
      if (carry >= (force ? 6000 : 60000)) { C1.logActivity('listening', carry / 60000); carry = 0; }
    }
    const timer = setInterval(() => {
      const now = Date.now();
      const gap = Math.min(now - lastTick, 2000);
      lastTick = now;
      if ((cur || radioId) && document.visibilityState === 'visible' && (speaking || rec || now - lastAct < 60000)) carry += gap;
      flush(false);
    }, 1000);
    function onVis() { if (document.visibilityState !== 'visible') { stopAudio(); flush(true); } else lastTick = Date.now(); }
    document.addEventListener('visibilitychange', onVis);
    root.addEventListener('pointerdown', touch);
    root.addEventListener('keydown', touch);

    function stopAudio() {
      playTok++;
      recGen++;
      speaking = false;
      if (resetBtn) { resetBtn(); resetBtn = null; }
      C1.stopSpeaking();
      radioCall('stop');
      if (rec) { const r = rec; rec = null; try { r.stop(); } catch (e) { /* ignore */ } }
    }

    function onCaps() {
      const s = C1.canSpeak(), d = C1.canDictate();
      if (s === speakOK && d === dictOK) return;
      speakOK = s; dictOK = d;
      if (rec || speaking || radioId) return;
      if (cur) renderMode(); else draw();
    }
    document.addEventListener('c1:caps', onCaps);
    // the bridge (re)loaded: refresh the landing section only, never an exercise in progress
    function onRadio() { if (!dead && !cur && !radioId && radioBox) fillRadio(); }
    document.addEventListener('c1:radio', onRadio);
    if (C1.radio) { try { Promise.resolve(C1.radio.ready()).catch(() => {}); } catch (e) { /* bridge optional */ } }

    /* ----- shared widgets ----- */
    function playBtn(label, getText, opts) {
      opts = opts || {};
      const b = el('button', { class: 'btn ' + (opts.cls || 'primary'), type: 'button' }, label);
      let playing = false;
      function reset() { playing = false; b.textContent = label; }
      b.addEventListener('click', () => {
        touch();
        if (playing) { stopAudio(); return; }
        stopAudio();
        const my = ++playTok;
        playing = true; speaking = true; b.textContent = '停止';
        resetBtn = reset;
        if (opts.onStart) opts.onStart();
        // opts.play (radio) starts the real audio synchronously inside this tap; otherwise built-in TTS
        let pr;
        try { pr = opts.play ? opts.play() : C1.speak(getText(), { rate: rate }); } catch (e) { pr = false; }
        Promise.resolve(pr).then((ok) => {
          if (my !== playTok || dead) return;
          speaking = false; resetBtn = null; reset(); touch();
          // false while still current = playback failed (not stopped by us)
          if (!ok) C1.toast(opts.failMsg || '音声を再生できませんでした。スクリプトで確認してください。');
          if (ok && opts.onEnd) opts.onEnd();
        }, () => { if (my === playTok) { speaking = false; resetBtn = null; reset(); } });
      });
      return b;
    }
    /** Speed selector. Default: the built-in TTS rates; radio passes its own list, current value and setter. */
    function rateSeg(cfg) {
      cfg = cfg || { list: RATES, get: () => rate, set: (r) => { rate = r; C1.store.set('listen.rate', r); } };
      const seg = el('div', { class: 'seg', role: 'group', 'aria-label': '再生速度' });
      cfg.list.forEach((r) => {
        seg.append(el('button', {
          type: 'button', 'aria-pressed': String(r === cfg.get()),
          onclick: () => {
            cfg.set(r);
            seg.querySelectorAll('button').forEach((x, k) => x.setAttribute('aria-pressed', String(cfg.list[k] === r)));
          },
        }, r.toFixed(1) + '×'));
      });
      return seg;
    }
    function scriptCard(p) {
      return el('div', { class: 'card' },
        el('div', { class: 'label' }, 'スクリプト'),
        el('div', { class: 'stack tight' }, p.sentences.map((s) => el('p', { class: 'en' }, s))),
        el('hr', { class: 'divider' }),
        el('div', { class: 'label' }, '日本語訳'),
        el('p', { class: 'small' }, p.ja),
        el('hr', { class: 'divider' }),
        el('div', { class: 'label' }, '使える表現'),
        el('ul', { class: 'plain' }, p.notes.map((n) => el('li', null, el('span', { class: 'en' }, n.phrase), el('span', { class: 'muted small' }, '　' + n.ja)))));
    }
    function noAudioCard(msg) {
      return el('div', { class: 'card sunken' },
        el('div', { class: 'h2' }, 'このブラウザでは音声を再生できません'),
        el('p', { class: 'small' }, msg));
    }
    function progressBar(i, n) {
      return el('div', { class: 'progress' }, el('i', { style: { width: Math.round((i / n) * 100) + '%' } }));
    }

    /* ----- list screen ----- */
    function draw() {
      stopAudio();
      root.innerHTML = '';
      radioBox = null;
      if (radioId) { drawRadio(); return; }
      if (cur) { drawPassage(); return; }
      const all = allProg();
      root.append(el('div', { class: 'stack tight' },
        el('h1', { class: 'h1' }, '聴く'),
        el('p', { class: 'muted' }, stage === 1
          ? '自然な速さの英語を、音のつながりごと聞き取る力を鍛えます。まずはB2レベルの短い会話や連絡で、知っている単語が速い音でも聞き取れるようにします。'
          : '速く自然な英語の「音のつながり」を聞き取る力を鍛えます。C1では、単語を知っているだけでなく、つながった音をそのまま理解できることが必要です。')));
      radioBox = el('div', { class: 'stack' });
      root.append(radioBox);
      fillRadio();
      if (!DATA.length) { root.append(el('div', { class: 'card' }, el('p', null, '教材を読み込めませんでした。'))); return; }
      if (!speakOK) root.append(noAudioCard('代わりに、スクリプトを使った読解と音読の練習ができます。'));

      const main = pool.main.length ? pool.main : ordered;
      const next = main.find((p) => !isDone(all[p.id] || {})) || main[0];
      const npr = all[next.id] || {};
      const nextMode = npr.gist !== true ? 'gist' : typeof npr.dict !== 'number' ? 'dict' : 'shadow';
      root.append(el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('span', { class: 'label' }, '次の練習'), el('span', { class: 'chip' }, '完了 ' + doneCount(main) + '/' + main.length)),
        el('div', { class: 'h2' }, next.title),
        el('div', { class: 'row' }, el('span', { class: 'chip accent' }, next.topic), el('span', { class: 'chip gold' }, next.level),
          el('span', { class: 'muted small' }, MODES.find((m) => m[0] === nextMode)[1] + 'から')),
        el('button', { class: 'btn primary block', type: 'button', onclick: () => open(next, nextMode) }, '始める')));

      function listCard(label, items, note) {
        const list = el('div', { class: 'listen-list' });
        items.forEach((p) => {
          const pr = all[p.id] || {};
          const n = steps(pr);
          list.append(el('button', { class: 'listen-item', type: 'button', onclick: () => open(p, 'gist') },
            el('span', { class: 't' },
              el('b', null, p.title),
              el('span', { class: 'row' }, el('span', { class: 'chip gold' }, p.level), el('span', { class: 'chip accent' }, p.topic),
                typeof pr.dict === 'number' ? el('span', { class: 'muted small' }, '書き取り ' + pr.dict + '%') : null)),
            n === 3 ? el('span', { class: 'chip good' }, '完了') : n > 0 ? el('span', { class: 'chip' }, n + '/3') : el('span', { class: 'muted', 'aria-hidden': 'true' }, '›')));
        });
        return el('div', { class: 'card' },
          el('div', { class: 'row between' }, el('span', { class: 'label' }, label + '（' + items.length + '本）'),
            el('span', { class: 'chip' }, '完了 ' + doneCount(items) + '/' + items.length)),
          note ? el('p', { class: 'small muted' }, note) : null,
          list);
      }
      if (pool.main.length) root.append(listCard(stage === 1 ? 'B2をめざす教材' : 'C1の教材', pool.main));
      if (pool.other.length) {
        root.append(stage === 1
          ? listCard('C1に挑戦', pool.other, '速く長めの教材です。B2の教材に慣れてから、0.7×や0.8×で試してみましょう。')
          : listCard('B2の復習', pool.other, '短く聞きやすい教材です。速度を1.2×にして復習に使えます。'));
      }
      root.append(el('div', { class: 'card' }, tipsFold()));
    }

    function open(p, m) { cur = p; mode = m; st = {}; touch(); draw(); window.scrollTo(0, 0); }

    /* ----- Radio Eikaiwa section on the landing screen ----- */
    function openCoach() { stopAudio(); flush(true); radioCall('open'); }
    function fillRadio() {
      if (!radioBox) return;
      radioBox.innerHTML = '';
      if (!radioOK()) {
        if (C1.radio && !radioLessons().length) {
          radioBox.append(el('p', { class: 'small muted' }, 'Shadowing Coach に取り込んだラジオ英会話のレッスンは、ここに表示されます。'));
        }
        radioBox.style.display = radioBox.childNodes.length ? '' : 'none';
        return;
      }
      radioBox.style.display = '';
      const plan = radioCall('todayPlan', [], null) || {};
      const total = Math.max(0, Number(plan.total) || 0);
      const due = Math.max(0, Number(plan.due) || 0), fresh = Math.max(0, Number(plan.fresh) || 0);
      radioBox.append(el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('span', { class: 'label' }, 'ラジオ英会話'), el('span', { class: 'chip accent' }, '本物の音声')),
        el('div', { class: 'h2' }, total ? '今日のシャドーイング ' + total + '件' : '今日のシャドーイングはありません'),
        el('p', { class: 'small' }, total
          ? '復習 ' + due + '件・新しい回 ' + fresh + '件'
          : '予定の回はすべて終わっています。好きな回を選んで練習することもできます。'),
        el('p', { class: 'small muted' }, 'シャドーイングは Shadowing Coach で、すべてのステップに沿って行います。そこで練習した時間は、ここの今日のメニューにも数えられます。'),
        el('button', { class: 'btn primary block', type: 'button', onclick: openCoach }, 'Shadowing Coach を開く')));

      const lessons = radioLessons();
      const playable = radioSorted(lessons.filter((l) => l && l.canPlayAll));
      const missing = lessons.length - playable.length;
      const pr = radioProg();
      const done = playable.filter((l) => Number((pr[l.id] || {}).runs) > 0).length;
      const shown = radioAll ? playable : playable.slice(0, RLIST_MAX);
      const list = el('div', { class: 'listen-list' });
      shown.forEach((l) => {
        const r = pr[l.id] || {};
        const best = Number(r.best);
        list.append(el('button', { class: 'listen-item', type: 'button', onclick: () => openRadio(l.id) },
          el('span', { class: 't' },
            el('b', null, String(l.title || '')),
            el('span', { class: 'row' },
              l.no != null && isFinite(Number(l.no)) ? el('span', { class: 'chip' }, '第' + Number(l.no) + '回') : null,
              typeof r.best === 'number' && isFinite(best) ? el('span', { class: 'chip gold' }, '書き取り ' + Math.round(best) + '%') : null,
              l.date ? el('span', { class: 'muted small' }, String(l.date)) : null)),
          Number(r.runs) > 0 ? el('span', { class: 'chip good' }, '完了') : el('span', { class: 'muted', 'aria-hidden': 'true' }, '›')));
      });
      radioBox.append(el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('span', { class: 'label' }, 'ラジオ英会話で書き取り（' + playable.length + '回）'),
          playable.length ? el('span', { class: 'chip' }, '完了 ' + done + '/' + playable.length) : null),
        el('p', { class: 'small muted' }, '番組の本物の音声を一文ずつ聞いて書き取ります。聞き慣れた会話で、音のつながりを確かめましょう。'),
        playable.length ? list : null,
        !radioAll && playable.length > RLIST_MAX
          ? el('button', { class: 'btn ghost block', type: 'button', onclick: () => { radioAll = true; fillRadio(); } }, 'もっと見る（あと' + (playable.length - RLIST_MAX) + '回）')
          : null,
        missing > 0 ? el('p', { class: 'small muted' }, '音声の割り当てがまだの回は Shadowing Coach で設定できます。') : null));
    }

    /* ----- Radio Eikaiwa dictation screen ----- */
    function openRadio(id) { cur = null; radioId = id; mode = 'radio'; st = {}; touch(); draw(); window.scrollTo(0, 0); }
    function leaveRadio() { stopAudio(); radioId = null; st = {}; flush(true); draw(); window.scrollTo(0, 0); }
    function radioLesson() { return radioId == null ? null : radioCall('lesson', [radioId], null); }
    function drawRadio() {
      const L = radioLesson();
      body = el('div', { class: 'stack loose' });
      root.append(
        el('div', { class: 'stack tight' },
          el('div', null, el('button', { class: 'btn ghost sm', type: 'button', onclick: leaveRadio }, '‹ 教材一覧')),
          el('h1', { class: 'h1' }, L ? String(L.title || '') : 'ラジオ英会話'),
          el('div', { class: 'row' }, el('span', { class: 'chip accent' }, 'ラジオ英会話'),
            L && L.no != null && isFinite(Number(L.no)) ? el('span', { class: 'chip' }, '第' + Number(L.no) + '回') : null,
            el('span', { class: 'muted small' }, '書き取り')),
          el('p', { class: 'muted small' }, '番組の音声を一文ずつ聞いて、聞こえたとおりに書きます。落とした語が、自分の聞き取れない音のつながりです。')),
        body, el('div', { class: 'card' }, tipsFold()));
      renderMode();
    }
    function radioBack(msg) {
      body.append(el('div', { class: 'card sunken' },
        el('p', { class: 'small' }, msg),
        el('div', { class: 'btn-grid' },
          el('button', { class: 'btn primary', type: 'button', onclick: leaveRadio }, '一覧に戻る'),
          C1.radio ? el('button', { class: 'btn', type: 'button', onclick: openCoach }, 'Shadowing Coach を開く') : null)));
    }
    function radioMode() {
      const id = radioId;
      const L = radioLesson();
      if (!L || !Array.isArray(L.sentences)) { radioBack('このレッスンを読み込めませんでした。Shadowing Coach で確認してください。'); return; }
      if (!st.prep) {
        if (radioCall('prepared', [id], false)) st.prep = 'ok';
        else {
          st.prep = 'wait';
          const my = st;
          const done = (ok) => { if (dead || st !== my || radioId !== id) return; my.prep = ok ? 'ok' : 'fail'; renderMode(); };
          Promise.resolve(radioCall('prepare', [id], false)).then((ok) => done(ok === true), () => done(false));
        }
      }
      if (st.prep === 'wait') {
        body.append(el('div', { class: 'card' }, el('p', { class: 'small muted' }, '音声を準備中…')));
        return;
      }
      if (st.prep === 'fail') {
        radioBack('この回の音声を準備できませんでした。音声ファイルの割り当ては Shadowing Coach で確認できます。');
        return;
      }
      // very short lines ("Oh.", "Thanks.") carry little to write down: skip them
      const sents = L.sentences.filter((s) => s && s.hasSeg && words(s.en).length > 2);
      if (!sents.length) { radioBack('この回には書き取りに向く文がありません。'); return; }
      dictation({
        n: sents.length,
        text: (k) => String(sents[k].en || ''),
        audio: true,
        play: (k, bump) => [
          el('div', { class: 'row' },
            sents[k].speaker ? el('span', { class: 'chip accent' }, String(sents[k].speaker)) : null,
            el('span', { class: 'small muted' }, '一文ずつ聞いて、聞こえたとおりに入力します。')),
          rateSeg({ list: RRATES, get: () => rrate, set: (r) => { rrate = r; C1.store.set('listen.radioRate', r); } }),
          playBtn('この文を再生', null, {
            cls: 'primary block listen-play', onStart: bump,
            play: () => (C1.radio ? C1.radio.play(id, sents[k].i, { rate: rrate }) : false),
            failMsg: '音声を再生できませんでした。もう一度タップしてください。',
          })],
        hint: (k) => {
          const ja = String(sents[k].ja || '');
          if (!ja) return null;
          const box = el('div');
          box.append(el('button', {
            class: 'listen-peek', type: 'button',
            onclick: () => { box.innerHTML = ''; box.append(el('div', { class: 'feedback small' }, el('span', { class: 'label' }, '日本語訳（ヒント）'), '\n' + ja)); },
          }, 'タップして日本語訳を見る（ヒント）'));
          return box;
        },
        after: (k) => (sents[k].ja ? el('div', { class: 'feedback small' }, el('span', { class: 'label' }, '日本語訳'), '\n' + String(sents[k].ja)) : null),
        summary: () => radioSummary(L, sents),
      });
    }
    function radioSummary(L, sents) {
      const t = dictTally();
      if (!st.saved) {
        st.saved = true;
        const prevRec = radioRec(L.id);
        st.prev = typeof prevRec.best === 'number' ? prevRec.best : null;
        const all = radioProg();
        all[L.id] = {
          best: Math.max(t.avg, st.prev == null ? 0 : st.prev), last: t.avg,
          runs: (Number(prevRec.runs) || 0) + 1, at: Date.now(),
        };
        C1.store.set(RKEY, all);
        flush(true);
      }
      body.append(dictResultCard(t, 'この回'));
      addNextCard();
      body.append(el('details', { class: 'fold' },
        el('summary', null, '全文と日本語訳'),
        el('div', { class: 'stack tight' }, sents.map((s) => el('div', null,
          el('p', { class: 'en' }, (s.speaker ? String(s.speaker) + ': ' : '') + String(s.en || '')),
          s.ja ? el('p', { class: 'small muted' }, String(s.ja)) : null)))));
      body.append(el('div', { class: 'btn-grid' },
        el('button', { class: 'btn primary', type: 'button', onclick: openCoach }, 'この回を Shadowing Coach でシャドーイング'),
        el('button', { class: 'btn', type: 'button', onclick: () => { st = {}; renderMode(); } }, 'もう一度'),
        el('button', { class: 'btn', type: 'button', onclick: leaveRadio }, '一覧に戻る')));
    }

    /* ----- passage screen ----- */
    function drawPassage() {
      const p = cur;
      const seg = el('div', { class: 'seg' });
      MODES.forEach((m) => seg.append(el('button', {
        type: 'button', 'aria-pressed': String(m[0] === mode),
        onclick: () => { if (mode === m[0]) return; mode = m[0]; st = {}; draw(); },
      }, m[1])));
      body = el('div', { class: 'stack loose' });
      root.append(
        el('div', { class: 'stack tight' },
          el('div', null, el('button', { class: 'btn ghost sm', type: 'button', onclick: () => { cur = null; flush(true); draw(); window.scrollTo(0, 0); } }, '‹ 教材一覧')),
          el('h1', { class: 'h1' }, p.title),
          el('div', { class: 'row' }, el('span', { class: 'chip accent' }, p.topic), el('span', { class: 'chip gold' }, p.level))),
        seg, body, el('div', { class: 'card' }, tipsFold()));
      renderMode();
    }
    function renderMode() {
      if ((!cur && !radioId) || !body) return;
      stopAudio();
      body.innerHTML = '';
      if (radioId) radioMode();
      else if (mode === 'gist') gist(); else if (mode === 'dict') dictation(); else shadow();
    }
    function nextPassageBtn() {
      // stay within the same level group as the current passage
      const grp = pool.main.indexOf(cur) >= 0 ? pool.main : pool.other.indexOf(cur) >= 0 ? pool.other : ordered;
      const k = grp.indexOf(cur);
      const nx = grp[(k + 1) % grp.length];
      return el('button', { class: 'btn', type: 'button', onclick: () => open(nx, 'gist') }, '次の教材へ');
    }
    /** Motivation-layer "next task" card; appended only when the engine exists. Pending time is flushed first. */
    function addNextCard() {
      if (!(C1.engage && C1.engage.nextCard)) return;
      flush(true);
      try { const nc = C1.engage.nextCard('listening'); if (nc) body.append(nc); } catch (e) { /* engine optional */ }
    }
    function passageLine(id) {
      const n = steps(getProg(id));
      return n === 3 ? 'この教材は3つのステップをすべて終えました。' : 'この教材は3ステップ中 ' + n + ' ステップを終えています。';
    }
    function modeBtn(m, label, cls) {
      return el('button', { class: 'btn ' + (cls || ''), type: 'button', onclick: () => { mode = m; st = {}; draw(); window.scrollTo(0, 0); } }, label);
    }

    /* ----- mode 1: gist ----- */
    function gist() {
      const p = cur, q = p.q;
      const answered = typeof st.picked === 'number';
      const optBtns = [];
      if (speakOK) {
        body.append(el('div', { class: 'card' },
          el('div', { class: 'label' }, '1. 全体を聞く'),
          el('p', { class: 'small muted' }, '文字を見ずに全体を聞き、話の要点と話し手の意図をつかみます。何度聞いてもかまいません。'),
          rateSeg(),
          playBtn('全体を再生', () => p.sentences.join(' '), {
            cls: 'primary block',
            onStart: () => { st.played = true; optBtns.forEach((b) => { b.disabled = false; }); hint.textContent = ''; },
          })));
      } else {
        body.append(noAudioCard('読解練習に切り替えます。下の文章を一度だけ、戻らずに読んでから質問に答えてください。'));
        body.append(el('div', { class: 'card' }, el('div', { class: 'label' }, '1. 一度で読む'),
          el('div', { class: 'stack tight' }, p.sentences.map((s) => el('p', { class: 'en' }, s)))));
      }
      const locked = speakOK && !st.played && !answered;
      const hint = el('p', { class: 'small muted' }, locked ? '再生すると選択できます。' : '');
      const opts = el('div', { class: 'stack tight' });
      q.options.forEach((o, k) => {
        let cls = 'btn block listen-opt';
        if (answered && k === q.answer) cls += ' good';
        else if (answered && k === st.picked) cls += ' bad';
        const b = el('button', {
          class: cls, type: 'button',
          onclick: () => {
            if (typeof st.picked === 'number') return;
            st.picked = k;
            const right = k === q.answer;
            const pr = getProg(p.id);
            if (right || pr.gist !== true) setProg(p.id, { gist: right });
            flush(true);
            renderMode();
          },
        }, o);
        b.disabled = locked || answered;
        optBtns.push(b);
        opts.append(b);
      });
      const qcard = el('div', { class: 'card' },
        el('div', { class: 'label' }, '2. 質問に答える'),
        el('p', { class: 'en' }, q.question), opts, hint);
      body.append(qcard);
      if (answered) {
        const right = st.picked === q.answer;
        qcard.append(el('div', { class: 'feedback' },
          el('b', { class: right ? 'ok' : 'ng' }, right ? '正解です' : '不正解です'), '\n' + q.why));
        qcard.append(el('p', { class: 'small' }, (right ? '要点を聞き取れました。' : '全体を一度聞き通しました。') + passageLine(p.id)));
        if (st.reveal == null) st.reveal = stage === 1; // stage 1: script and translation shown right away
        if (!st.reveal) {
          qcard.append(el('button', { class: 'btn block', type: 'button', onclick: () => { st.reveal = true; renderMode(); } }, 'スクリプト・訳・表現を見る'));
        }
        addNextCard();
        if (st.reveal) body.append(scriptCard(p));
        body.append(el('div', { class: 'btn-grid' }, modeBtn('dict', 'ディクテーションへ', 'primary'), nextPassageBtn()));
      }
    }

    /* ----- mode 2: dictation ----- */
    /** Built-in passage as a dictation source (sentences spoken by TTS). */
    function builtinDict() {
      const p = cur;
      return {
        n: p.sentences.length,
        text: (k) => p.sentences[k],
        audio: speakOK,
        play: (k, bump) => [
          el('p', { class: 'small muted' }, '一文ずつ聞いて、聞こえたとおりに入力します。何度再生してもかまいません。'),
          rateSeg(),
          playBtn('この文を再生', () => p.sentences[k], { cls: 'primary block', onStart: bump })],
        hint: () => (stage === 1 ? el('div', { class: 'feedback small' }, el('span', { class: 'label' }, '全体の日本語訳（ヒント）'), '\n' + p.ja) : null),
        after: null,
        summary: dictSummary,
      };
    }
    /** Shared dictation flow. src = { n, text(k), audio, play(k, bump), hint(k), after(k), summary() } */
    function dictation(src) {
      src = src || builtinDict();
      const n = src.n;
      if (!st.results) { st.i = 0; st.results = []; st.replays = 0; st.text = ''; st.checked = null; st.hidden = false; }
      if (st.i >= n) { src.summary(); return; }
      const sent = src.text(st.i);
      const counter = el('span', { class: 'chip' }, (src.audio ? '再生 ' : '表示 ') + st.replays + '回');
      const card = el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('span', { class: 'label' }, '文 ' + (st.i + 1) + ' / ' + n), counter),
        progressBar(st.i, n));
      body.append(card);
      const bump = () => { st.replays++; counter.textContent = (src.audio ? '再生 ' : '表示 ') + st.replays + '回'; };

      if (src.audio) {
        card.append(...[].concat(src.play(st.i, bump)).filter(Boolean));
      } else {
        card.append(el('p', { class: 'small muted' }, '音声が使えないため、文を覚えてから隠して書く練習に切り替えます。'));
        if (!st.hidden && !st.checked) {
          if (!st.replays) st.replays = 1;
          counter.textContent = '表示 ' + st.replays + '回';
          card.append(el('p', { class: 'en' }, sent),
            el('button', { class: 'btn primary block', type: 'button', onclick: () => { st.hidden = true; renderMode(); } }, '覚えたら隠す'));
          return;
        }
        if (!st.checked) card.append(el('button', { class: 'btn block', type: 'button', onclick: () => { st.hidden = false; st.replays++; renderMode(); } }, 'もう一度見る'));
      }

      const ta = el('textarea', {
        class: 'textarea', rows: '3', placeholder: 'Type what you hear', 'aria-label': '聞こえた英文',
        autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false',
        style: { minHeight: '96px' },
        oninput: () => { st.text = ta.value; },
      });
      ta.value = st.text || '';
      const hint = !st.checked && src.hint ? src.hint(st.i) : null;
      if (hint) card.append(hint);
      card.append(ta);

      if (!st.checked) {
        card.append(el('button', {
          class: 'btn block', type: 'button',
          onclick: () => {
            if (!String(st.text || '').trim()) { C1.toast('聞こえた語を入力してください。'); ta.focus(); return; }
            const d = diff(sent, st.text);
            st.checked = { acc: d.acc, missed: d.missed };
            st.results.push({ acc: d.acc, missed: d.missed, replays: st.replays });
            renderMode();
          },
        }, '答え合わせ'));
      } else {
        ta.readOnly = true;
        const d = diff(sent, st.text);
        card.append(
          el('div', { class: 'row between' }, el('span', { class: 'label' }, '正しい文'), el('span', { class: 'num' }, '正確さ ' + d.acc + '%')),
          d.node);
        const after = src.after ? src.after(st.i) : null;
        if (after) card.append(after);
        card.append(
          el('p', { class: 'small muted' }, d.missed.length ? '赤い語が聞き取れなかった箇所です。もう一度再生して、音を確かめましょう。' : 'すべて聞き取れました。'),
          el('button', {
            class: 'btn primary block', type: 'button',
            onclick: () => { st.i++; st.replays = 0; st.text = ''; st.checked = null; st.hidden = false; renderMode(); },
          }, st.i + 1 < n ? '次の文へ' : '結果を見る'));
      }
    }
    /** Average accuracy and missed words of the finished dictation run in st.results. */
    function dictTally() {
      const avg = Math.round(st.results.reduce((s, r) => s + r.acc, 0) / Math.max(1, st.results.length));
      const missed = [];
      st.results.forEach((r) => r.missed.forEach((w) => { if (missed.indexOf(w) < 0) missed.push(w); }));
      return { avg: avg, missed: missed };
    }
    function dictSummary() {
      const p = cur;
      const t = dictTally();
      if (!st.saved) {
        st.saved = true;
        const prev = getProg(p.id).dict;
        st.prev = typeof prev === 'number' ? prev : null;
        setProg(p.id, { dict: Math.max(t.avg, st.prev == null ? 0 : st.prev) });
        flush(true);
      }
      body.append(dictResultCard(t, 'この教材'));
      addNextCard();
      body.append(scriptCard(p));
      body.append(el('div', { class: 'btn-grid' },
        modeBtn('shadow', 'シャドーイングへ', 'primary'),
        el('button', { class: 'btn', type: 'button', onclick: () => { st = {}; renderMode(); } }, 'もう一度'),
        nextPassageBtn()));
    }
    /** Result card shared by passage and radio dictation; st.prev = previous best or null. */
    function dictResultCard(t, noun) {
      const avg = t.avg, missed = t.missed;
      const best = Math.max(avg, st.prev == null ? 0 : st.prev);
      return el('div', { class: 'card' },
        el('div', { class: 'label' }, 'ディクテーションの結果'),
        el('div', { class: 'row between' },
          el('span', { class: 'num', style: { fontSize: '32px' } }, avg + '%'),
          el('span', { class: 'chip ' + (st.prev != null && avg > st.prev ? 'good' : '') }, '自己ベスト ' + best + '%')),
        el('p', { class: 'small' }, st.results.length + '文を書き取り、正確さは ' + avg + '% でした。' +
          (st.prev == null ? noun + 'の初めての記録です。' : avg > st.prev ? noun + 'の自己ベストを更新しました（前回まで ' + st.prev + '%）。' : noun + 'の自己ベストは ' + best + '% です。')),
        el('p', { class: 'small muted' }, '文ごとの正確さ: ' + st.results.map((r) => r.acc + '%').join(' ・ ')),
        el('hr', { class: 'divider' }),
        el('div', { class: 'label' }, '聞き取れなかった語'),
        missed.length
          ? el('div', { class: 'row' }, missed.map((w) => el('span', { class: 'chip bad en', style: { fontSize: '14px' } }, w)))
          : el('p', { class: 'small' }, 'ありません。'),
        missed.length ? el('p', { class: 'small muted' }, '短い機能語や語のつなぎ目が多ければ、音の連結と弱形が原因です。シャドーイングで口に覚えさせましょう。') : null);
    }

    /* ----- mode 3: shadowing ----- */
    const STEP_LABEL = ['聞く', '文字ありで', '文字なしで'];
    function shadow() {
      const p = cur, n = p.sentences.length;
      if (!st.self) { st.i = 0; st.step = 0; st.self = []; st.peek = false; st.rec = null; }
      if (speakOK) {
        body.append(el('div', { class: 'row between' }, rateSeg(),
          playBtn('通しで再生', () => p.sentences.join(' '), { cls: 'sm' })));
      } else {
        body.append(noAudioCard('音読練習に切り替えます。文を見て声に出し、次に文字を隠して言ってみましょう。'));
      }
      if (st.i >= n) { shadowSummary(); return; }
      const sent = p.sentences[st.i];
      const guide = speakOK
        ? ['まず聞いて、音のつながりと強弱を確かめます。', '音声にかぶせるように、文字を見ながら声に出します。', '文字を見ずに、音声のすぐ後を追いかけて声に出します。']
        : ['意味を確かめながら黙読します。', '区切りと強弱を意識して、声に出して読みます。', '文字を隠して、覚えた文を声に出します。'];
      const card = el('div', { class: 'card' },
        el('div', { class: 'row between' }, el('span', { class: 'label' }, '文 ' + (st.i + 1) + ' / ' + n),
          el('span', { class: 'row' }, STEP_LABEL.map((s, k) => el('span', { class: 'chip' + (k === st.step ? ' accent' : k < st.step ? ' good' : '') }, (k + 1) + ' ' + s)))),
        progressBar(st.i * 3 + st.step, n * 3),
        el('p', { class: 'small muted' }, guide[st.step]));
      body.append(card);

      if (st.step < 2 || st.peek) {
        card.append(el('p', { class: 'en' }, sent));
        if (st.step === 2) card.append(el('button', { class: 'btn ghost sm', type: 'button', onclick: () => { st.peek = false; renderMode(); } }, '文字を隠す'));
      } else {
        card.append(el('button', { class: 'listen-peek', type: 'button', onclick: () => { st.peek = true; renderMode(); } }, 'タップして文字を見る'));
      }
      if (speakOK) card.append(playBtn(st.step === 0 ? 'この文を再生' : '再生してシャドーイング', () => sent, { cls: 'primary block' }));

      if (st.step < 2) {
        card.append(el('button', { class: 'btn block', type: 'button', onclick: () => { st.step++; st.peek = false; renderMode(); } }, '次のステップへ'));
        return;
      }
      /* step 3: check */
      card.append(el('hr', { class: 'divider' }));
      if (dictOK) {
        const out = el('div', { class: 'stack tight' });
        const live = el('p', { class: 'small muted' }, '音声を止めて、この文を一人で言ってみましょう。');
        const showRec = () => {
          out.innerHTML = '';
          if (!st.rec) return;
          const d = diff(sent, st.rec);
          out.append(el('div', { class: 'row between' }, el('span', { class: 'label' }, '認識された発話'), el('span', { class: 'num' }, d.acc + '%')), d.node,
            el('p', { class: 'small muted' }, '認識: ' + st.rec));
        };
        const rb = el('button', { class: 'btn block', type: 'button' }, '録音して確認');
        rb.addEventListener('click', () => {
          touch();
          if (rec) { const r = rec; rec = null; try { r.stop(); } catch (e) { /* ignore */ } return; }
          stopAudio();
          const gen = recGen, myst = st;
          let finals = '', partial = '';
          // callbacks from a session cut off by navigation/next sentence must not touch the new state
          const stale = () => dead || gen !== recGen || myst !== st;
          const session = C1.listen({
            onPartial: (t) => { if (stale()) return; partial = t || ''; live.textContent = (finals + ' ' + partial).trim() || '聞いています…'; },
            onFinal: (t) => { if (stale()) return; finals = (finals + ' ' + (t || '')).trim(); partial = ''; live.textContent = finals; },
            onEnd: () => {
              if (rec === session) rec = null;
              if (stale()) return;
              rb.textContent = '録音して確認';
              const text = (finals + ' ' + partial).trim();
              if (text) { st.rec = text; live.textContent = ''; showRec(); } else live.textContent = '声を認識できませんでした。下のセルフチェックで確認してください。';
              touch();
            },
          });
          if (!session) { live.textContent = '録音を使えません。下のセルフチェックで確認してください。'; return; }
          rec = session;
          rb.textContent = '録音を止める';
          live.textContent = '聞いています…';
        });
        card.append(rb, live, out);
        showRec();
      }
      card.append(el('div', { class: 'label' }, 'セルフチェック（選ぶと次の文へ）'));
      const grid = el('div', { class: 'stack tight' });
      [['good', 'ついていけた', 'good'], ['part', '一部落とした', ''], ['bad', 'ついていけなかった', 'bad']].forEach((o) => {
        grid.append(el('button', {
          class: 'btn block ' + o[2], type: 'button',
          onclick: () => { st.self.push(o[0]); st.i++; st.step = 0; st.peek = false; st.rec = null; renderMode(); },
        }, o[1]));
      });
      card.append(grid);
    }
    function shadowSummary() {
      const p = cur;
      if (!st.saved) {
        st.saved = true;
        setProg(p.id, { shadow: (getProg(p.id).shadow || 0) + 1 });
        flush(true);
      }
      const c = { good: 0, part: 0, bad: 0 };
      st.self.forEach((s) => { c[s]++; });
      const rounds = getProg(p.id).shadow || 1;
      body.append(el('div', { class: 'card' },
        el('div', { class: 'label' }, 'シャドーイング ' + rounds + '周目 完了'),
        el('div', { class: 'row' },
          el('span', { class: 'chip good' }, 'ついていけた ' + c.good),
          el('span', { class: 'chip' }, '一部落とした ' + c.part),
          el('span', { class: 'chip bad' }, 'ついていけなかった ' + c.bad)),
        el('p', { class: 'small' }, st.self.length + '文を通してシャドーイングし、' + c.good + '文についていけました。' + passageLine(p.id)),
        el('p', { class: 'small muted' }, c.part + c.bad > 0
          ? (rate > RATES[0]
            ? '落とした文は速度を' + RATES[Math.max(0, RATES.indexOf(rate) - 1)].toFixed(1) + '×に下げてもう一周しましょう。同じ教材を3周すると定着します。'
            : '同じ速度でもう一周しましょう。同じ教材を3周すると定着します。')
          : rate < 1 ? '次は速度を一段上げて、もう一周してみましょう。' : '仕上げに1.2×で通しのシャドーイングに挑戦しましょう。')));
      addNextCard();
      body.append(scriptCard(p));
      body.append(el('div', { class: 'btn-grid' },
        el('button', { class: 'btn primary', type: 'button', onclick: () => { st = {}; renderMode(); } }, 'もう一周'),
        nextPassageBtn()));
    }

    draw();

    return function cleanup() {
      dead = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('c1:caps', onCaps);
      document.removeEventListener('c1:radio', onRadio);
      root.removeEventListener('pointerdown', touch);
      root.removeEventListener('keydown', touch);
      stopAudio();
      C1.stopSpeaking();
      flush(true);
    };
  }

  /** Motivation-layer contract: numbers only, zeros when empty, never throws. */
  function stats() {
    const out = { done: 0, total: DATA.length, dictBest: 0, dictAvg: 0, shadowRounds: 0, gistCorrect: 0 };
    try {
      const all = allProg();
      let dSum = 0, dN = 0;
      DATA.forEach((p) => {
        const pr = p && all[p.id];
        if (!pr || typeof pr !== 'object') return;
        if (isDone(pr)) out.done++;
        if (pr.gist === true) out.gistCorrect++;
        const d = Number(pr.dict);
        if (typeof pr.dict === 'number' && isFinite(d)) { dSum += d; dN++; out.dictBest = Math.max(out.dictBest, Math.round(d)); }
        const sh = Number(pr.shadow);
        if (isFinite(sh) && sh > 0) out.shadowRounds += Math.floor(sh);
      });
      // Radio Eikaiwa dictation: each lesson's best counts like a passage's best (own storage; no bridge needed)
      const rp = radioProg();
      Object.keys(rp).forEach((k) => {
        const r = rp[k];
        const b = r && Number(r.best);
        if (r && typeof r.best === 'number' && isFinite(b)) { dSum += b; dN++; out.dictBest = Math.max(out.dictBest, Math.round(b)); }
      });
      out.dictAvg = dN ? Math.round(dSum / dN) : 0;
    } catch (e) { return { done: 0, total: DATA.length, dictBest: 0, dictAvg: 0, shadowRounds: 0, gistCorrect: 0 }; }
    return out;
  }

  C1.register({
    id: 'listen',
    label: '聴く',
    icon: '<svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1z"/><path d="M20 14h-3v6h2a1 1 0 0 0 1-1z"/></svg>',
    render: render,
    stats: stats,
    status: function () {
      try {
        const r = radioSummaryCounts();
        if (r && r.total) return 'ラジオ英会話 書き取り ' + r.runs + '回・完了 ' + r.done + '/' + r.total;
      } catch (e) { /* fall back to the built-in passages */ }
      const m = pools().main; return m.length ? '完了 ' + doneCount(m) + '/' + m.length : '';
    },
  });
})();
