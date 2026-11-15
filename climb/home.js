/* Home: the daily starting point — set-up, today's ring and next step, menu, phrase and challenge,
   the climb with an honest forecast, this week, evidence of growth, badges, and the roadmap.
   Built on C1.engage (engage.js); every call is guarded so Home still works without it. */
(function () {
  'use strict';
  const { el, store } = C1;
  const HOURS_TO_C1 = { B1: 400, B2: 200, 'B2+': 100 };
  const GOALS = [5, 15, 30, 45];

  const MENU = [
    { skill: 'vocab', mod: 'vocab', name: '語彙', what: '復習と新出語をコロケーションで覚える', min: 10 },
    { skill: 'listening', mod: 'listen', name: 'リスニング', what: 'ディクテーションかシャドーイングを1本', min: 10 },
    { skill: 'speaking', mod: 'speak', name: 'スピーキング', what: '1分スピーチを同じお題で2回', min: 5 },
    { skill: 'grammar', mod: 'grammar', name: '文法', what: '10問ドリルで基礎と正確さを固める', min: 5 },
    { skill: 'writing', mod: 'write', name: 'ライティング', what: '言い換え数問、週2回はまとまった文章を書く', min: 10 },
  ];
  const SKILL_JA = { vocab: '語彙', listening: '聴く', speaking: '話す', writing: '書く', grammar: '文法', input: '多聴多読' };
  const WHY_EXAMPLES = ['仕事の会議で英語で議論したい', '海外の大学院に進みたい', '字幕なしで映画やニュースを理解したい', '英語で自分の考えを書けるようになりたい'];
  const WHEN_CHOICES = ['朝起きてすぐ', '通勤中', '昼休み', '寝る前'];

  const ROADMAP = [
    { t: '語彙を8,000語レベルへ、コロケーションで', tab: 'vocab',
      c1: 'C1は「言いたいことに合う語」を探さずに選べる状態です。必要なのは約8,000〜10,000語族と、その語が一緒に使われる相手（コロケーション）の知識です。',
      how: ['単語単体ではなく make a concession のような塊で覚える', '日本語から英語を出す「産出」テストで復習する', '間隔反復で毎日10分。新出語は1日10語まで'] },
    { t: '自然な速さの英語を、音の崩れごと聞き取る', tab: 'listen',
      c1: 'C1は、構成が明確でない長い話や、速い会話にもついていける状態です。日本語話者がつまずくのは語彙より、連結・脱落・弱形といった音の変化です。',
      how: ['ディクテーションで「聞こえなかった語」を特定する', 'シャドーイングで音の変化を自分の口で再現する', '週3時間以上、好きな分野のポッドキャストや動画を多聴する'] },
    { t: '複雑な話題を、構成を持って流暢に話す', tab: 'speak',
      c1: 'C1は、言葉を探す様子をほとんど見せず、抽象的な話題でも筋道立てて話せる状態です。差がつくのは、つなぎ・ぼかし・言い直しの表現が自動で出るかどうかです。',
      how: ['型（PREPなど）に沿って1〜2分話す練習を毎日', '同じお題を繰り返す。2回目、3回目で流暢さが伸びる', '機能表現（hedging、譲歩、時間稼ぎ）を口が覚えるまで反復'] },
    { t: '構造の幅を広げ、基本の誤りをなくす', tab: 'grammar',
      c1: 'C1では倒置・分裂文・仮定法・分詞構文などを場面に応じて使い分け、誤りは少なく目立たないことが求められます。冠詞・前置詞・時制の精度がB2との分かれ目です。',
      how: ['高度な構文は「書き換え」問題で能動的に使う', '冠詞・可算不可算・動詞パターンは誤答を間隔を空けて解き直す', '学んだ構文を、その日のスピーチか作文で1回使う'] },
    { t: '読み手に合わせて、明晰で結束性のある文章を書く', tab: 'write',
      c1: 'C1は、複雑な主題について構成の整った文章を書き、相手に応じて文体を変えられる状態です。正しいが平板な文から、言い換え・名詞化・ぼかしを使った文へ上げます。',
      how: ['1文単位の言い換え練習でレパートリーを増やす', '週2回、120〜180語を時間を計って書く', 'フィードバックを受けたら、同じ文章を書き直す'] },
    { t: '長く複雑な文章を読み、含意と態度を読み取る', tab: 'write',
      c1: 'C1は、専門外の長文でも細部まで理解し、書き手の立場や含みまで読み取れる状態です。精読と多読の両方が必要です。',
      how: ['短い論説を読んで1文で要約する（「書く」タブの読解）', '英語のニュース解説や長めの記事を週に数本読む', '知らない語は調べる前に文脈から推測する'] },
    { t: '毎日続け、時間を積み上げる', tab: null,
      c1: 'B2からC1までは、目安として約200時間の質の高い学習が必要とされます。1日40分で約10か月、1日1時間で約7か月です。短くても毎日続ける人が到達します。',
      how: ['今日のメニューを毎日1周する（約40分）', 'アプリ外の多聴・多読も記録して合計時間を見える化する', '月に1回、自己診断をやり直してレベルを更新する'] },
  ];

  const CANDO_B2 = [
    'ゆっくりはっきり話された英語のニュースや解説の要点が分かる',
    '身近な話題（仕事、趣味、旅行）について、1分間止まらずに話せる',
    '意見を聞かれたら、理由を2つ添えて答えられる',
    '辞書を時々使えば、興味のある分野の記事を読める',
    '100語程度のメールや感想文を、大きな文法ミスなく書ける',
    '現在完了・受動態・関係代名詞・仮定法過去を会話で使える',
  ];
  const CANDO = [
    '英語のポッドキャストや講義を、字幕なしでほぼ理解できる',
    '抽象的な話題について、準備なしで2分間、筋道立てて話せる',
    '話している途中で言葉に詰まっても、言い換えて続けられる',
    '新聞の論説を読み、書き手の立場や皮肉が分かる',
    '相手に合わせて、フォーマルな文とカジュアルな文を書き分けられる',
    '会議や議論で、反対意見を丁寧に、根拠をつけて述べられる',
    '知らない単語が少しあっても、長文の内容を正確に追える',
    '倒置や仮定法などの構文を、会話や作文で自然に使える',
  ];

  const CSS = [
    '.home-today-top{display:flex;gap:14px;align-items:center;min-width:0}',
    '.home-today-top>.home-ringbox{flex:0 0 auto;display:grid;place-items:center}',
    '.home-today-top>.home-tx{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px}',
    '.home-big{min-height:52px;font-size:16px;white-space:normal;text-align:center}',
    '.home-scroll{display:flex;gap:8px;overflow-x:auto;padding:2px 0;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
    '.home-scroll::-webkit-scrollbar{display:none}',
    '.home-pick{flex:0 0 auto;min-height:44px;padding:6px 14px;border-radius:99px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:13.5px;font-weight:600;cursor:pointer;white-space:nowrap}',
    '.home-pick[aria-pressed="true"]{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}',
    '.home-setup .seg button{min-height:44px}',
    '.home-goalseg button{min-height:44px}',
    '.home-task{min-height:56px}',
    '.home-check{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer}',
    '.home-check input{width:22px;height:22px;flex:0 0 22px;margin:0;accent-color:var(--accent)}',
    '.home-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}',
    '.home-day{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums;min-width:0}',
    '.home-day.is-today{color:var(--ink);font-weight:700}',
    '.home-mark{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:13px;font-weight:700;border:2px solid var(--line);color:var(--muted);background:transparent}',
    '.home-mark.s-done{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}',
    '.home-mark.s-kept{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}',
    '.home-mark.s-frozen{background:var(--gold-soft);border-color:var(--gold);color:var(--gold)}',
    '.home-mark.s-missed{border-style:dashed}',
    '.home-mark.s-today{border-color:var(--ink);color:var(--ink)}',
    '.home-mark.s-future{border-style:dotted;opacity:.55}',
    '.home-ev{display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line);min-width:0}',
    '.home-ev:first-child{border-top:0;padding-top:0}',
    '.home-ev>.k{flex:0 0 5.5em;font-weight:600;font-size:13px}',
    '.home-ev>.v{flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:2px;overflow-wrap:anywhere}',
    '.home-badges{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}',
    '.home-badge{background:var(--sunken);border-radius:var(--r-sm);padding:10px 12px;font-size:13px;display:flex;flex-direction:column;gap:2px;min-width:0;overflow-wrap:anywhere}',
    '.home-badge.earned{background:var(--gold-soft)}',
    '.home-badge.earned>b{color:var(--gold)}',
    '.home-badge.locked{opacity:.6}',
    '.home-phrase{overflow-wrap:anywhere}',
    '.home-quiet{display:flex;align-items:center;gap:8px;min-width:0}',
    '.home-quiet>span{flex:1 1 0;min-width:0;overflow-wrap:anywhere}',
    '.home-mtn{min-width:0;overflow:hidden}',
  ].join('\n');

  function injectStyle() {
    if (document.getElementById('home-style')) return;
    const s = document.createElement('style');
    s.id = 'home-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- safe access to C1.engage ---------- */
  function hasE(name) { return !!(C1.engage && typeof C1.engage[name] === 'function'); }
  /** Call C1.engage[name](...args); on missing/throwing/null result use fb (value or function). */
  function eng(name, args, fb, allowNull) {
    if (hasE(name)) {
      try {
        const v = C1.engage[name].apply(C1.engage, args || []);
        if (v !== undefined && (v !== null || allowNull)) return v;
      } catch (e) { if (typeof console !== 'undefined') console.error('engage.' + name, e); }
    }
    return typeof fb === 'function' ? fb() : fb;
  }
  function num(x) { const n = Number(x); return isFinite(n) ? n : 0; }
  function r0(x) { return Math.round(num(x)); }

  /* ---------- local fallbacks (used only when C1.engage is missing or fails) ---------- */
  function totalHours() {
    const log = C1.getLog();
    let m = 0;
    for (const k in log) for (const s of C1.SKILLS) m += (log[k] && log[k][s]) || 0;
    return m / 60;
  }
  function dayLog(key) { return C1.getLog()[key] || {}; }
  function shiftKey(n) { const d = new Date(); d.setDate(d.getDate() + n); return C1.dateKey(d); }
  function fbGoal() { return 15; }
  function fbMenu() {
    const log = dayLog(C1.today());
    return MENU.map((t) => {
      const mod = C1.getModule(t.mod);
      let status = '';
      try { status = mod && mod.status ? String(mod.status() || '') : ''; } catch (e) { status = ''; }
      const minutes = log[t.skill] || 0;
      return Object.assign({}, t, { done: minutes >= 3, minutes, status });
    });
  }
  function fbStreak() {
    return { days: C1.streak(), keptToday: C1.minutesOn(C1.today()) >= 2, tickets: 0, frozen: [], best: 0, fallback: true };
  }
  function fbWeek(goal) {
    const now = new Date();
    const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const t = C1.today();
    const WD = ['月', '火', '水', '木', '金', '土', '日'];
    const days = [];
    let minutes = 0, lastWeekMinutes = 0, keptDays = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i);
      const key = C1.dateKey(d);
      const m = C1.minutesOn(key);
      const p = new Date(d); p.setDate(d.getDate() - 7);
      lastWeekMinutes += C1.minutesOn(C1.dateKey(p));
      let state;
      if (key > t) state = 'future';
      else if (m >= goal) state = 'done';
      else if (m >= 2) state = 'kept';
      else if (key === t) state = 'today';
      else state = 'missed';
      if (key <= t) minutes += m;
      if (m >= 2) keptDays++;
      days.push({ key, wd: WD[i], minutes: m, state });
    }
    return { days, minutes, lastWeekMinutes, keptDays };
  }
  function fbRoute() {
    const level = C1.level();
    const need = HOURS_TO_C1[level] || 200;
    const hours = Math.max(0, totalHours() - store.get('home.levelBase', 0));
    const camps = need / 10;
    const camp = Math.min(camps, Math.floor(hours / 10));
    const names = [];
    for (let i = 0; i <= camps; i++) names.push(i === 0 ? '登山口' : i === camps ? 'C1' : level === 'B1' && i === camps / 2 ? 'B2キャンプ' : 'キャンプ' + i);
    const summit = camp >= camps;
    const ni = Math.min(camps, camp + 1);
    return {
      level, need, hours, camps, camp, summit, names,
      nextCamp: { index: ni, name: names[ni], minutesLeft: summit ? 0 : Math.max(0, Math.ceil(ni * 600 - hours * 60)), pct: summit ? 100 : Math.round(((hours - camp * 10) / 10) * 100) },
    };
  }
  function ym(d) { return d.getFullYear() + '年' + (d.getMonth() + 1) + '月'; }
  function fbProjection(goal, route) {
    let sum = 0;
    for (let i = 0; i < 7; i++) sum += C1.minutesOn(shiftKey(-i));
    const avg7 = sum / 7;
    const left = Math.max(0, route.need - route.hours) * 60;
    const eta = (perDay) => { const d = new Date(); d.setDate(d.getDate() + Math.ceil(left / perDay)); return ym(d); };
    return { avg7, etaAtAvg: avg7 > 0 ? eta(avg7) : null, etaAtGoal: eta(goal) };
  }
  function fbStats() {
    const out = {};
    [['vocab', 'vocab'], ['listen', 'listen'], ['speak', 'speak'], ['write', 'write'], ['grammar', 'grammar']].forEach(([k, id]) => {
      const m = C1.getModule(id);
      try { out[k] = m && typeof m.stats === 'function' ? m.stats() || null : null; } catch (e) { out[k] = null; }
    });
    return out;
  }

  /* ---------- small widgets ---------- */
  function fbRing(min, goal) {
    const pct = Math.min(100, Math.round((min / goal) * 100));
    return el('div', { class: 'stack tight', style: { width: '84px' } },
      el('div', { class: 'num', style: { textAlign: 'center' } }, r0(min) + ' / ' + goal + '分'),
      el('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100' }, el('i', { style: { width: pct + '%' } })));
  }
  function check(labelText, checked, onchange) {
    const cb = el('input', { type: 'checkbox' });
    cb.checked = !!checked;
    cb.addEventListener('change', () => onchange(cb.checked));
    return el('label', { class: 'home-check' }, cb, el('span', null, labelText));
  }
  function picks(items, current, onpick, ariaLabel) {
    return el('div', { class: 'home-scroll', role: 'group', 'aria-label': ariaLabel },
      items.map((t) => el('button', { type: 'button', class: 'home-pick', 'aria-pressed': String(t === current), onclick: () => onpick(t) }, t)));
  }
  function goalSeg(goal, onpick) {
    return el('div', { class: 'seg home-goalseg', role: 'group', 'aria-label': '1日の目標' },
      GOALS.map((g) => el('button', { type: 'button', 'aria-pressed': String(g === goal), onclick: () => onpick(g) }, g + '分')));
  }
  function md(key) { const p = String(key || '').split('-'); return p.length === 3 ? Number(p[1]) + '月' + Number(p[2]) + '日' : ''; }

  /* ---------- render ---------- */
  function render(root) {
    injectStyle();
    const S = {}; // section containers, filled by painters
    ['setup', 'today', 'menu', 'daily', 'climb', 'week', 'growth', 'badges'].forEach((k) => { S[k] = el('div', { style: { display: 'contents' } }); });
    let editing = false;   // set-up form is open
    let deferred = false;  // a refresh was skipped while typing
    let timer = null;
    let alive = true;

    /* 1. set-up (first visit) / quiet line */
    function paintSetup() {
      const box = S.setup;
      box.textContent = '';
      if (!hasE('profile') || !hasE('setProfile')) return;
      const p = eng('profile', [], null);
      if (!p) return; // engine failing: skip the set-up rather than show a form that cannot save
      const goal = eng('goal', [], fbGoal);
      if (p.onboarded && !editing) {
        const parts = [];
        if (p.why) parts.push('目的：' + p.why);
        parts.push((p.when ? p.when + 'に' : '毎日') + goal + '分');
        box.append(el('div', { class: 'home-quiet small muted' },
          el('span', null, parts.join('　')),
          el('button', { type: 'button', class: 'btn ghost', onclick: () => { editing = true; paintSetup(); } }, '編集')));
        return;
      }
      editing = true;
      let why = p.why || '';
      let when = p.when || '';
      let g = GOALS.includes(goal) ? goal : 15;
      const whyIn = el('input', { class: 'input', type: 'text', maxlength: '80', placeholder: '例：仕事の会議で英語で議論したい', 'aria-label': 'なぜC1を目指すか（任意）' });
      whyIn.value = why;
      whyIn.addEventListener('input', () => { why = whyIn.value; });
      const otherIn = el('input', { class: 'input', type: 'text', maxlength: '20', placeholder: '例：家事のあと', 'aria-label': 'いつやるか（その他）' });
      const isOther = when && !WHEN_CHOICES.includes(when);
      otherIn.value = isOther ? when : '';
      const otherBox = el('div', { style: { display: isOther ? '' : 'none' } }, otherIn);
      otherIn.addEventListener('input', () => { when = otherIn.value.trim(); });
      let whenRow;
      const pickWhen = (t) => {
        if (t === 'その他') { otherBox.style.display = ''; when = otherIn.value.trim(); try { otherIn.focus(); } catch (e) { /* ignore */ } }
        else { otherBox.style.display = 'none'; when = t; }
        whenRow.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === t)));
      };
      whenRow = picks(WHEN_CHOICES.concat('その他'), isOther ? 'その他' : when, pickWhen, 'いつやるか');
      let segBox = el('div');
      const paintSeg = () => { segBox.textContent = ''; segBox.append(goalSeg(g, (x) => { g = x; paintSeg(); })); };
      paintSeg();
      const save = () => {
        editing = false;
        try { C1.engage.setProfile({ why: why.trim(), when: when.trim(), onboarded: true }); } catch (e) { console.error(e); }
        if (hasE('setGoal')) { try { C1.engage.setGoal(g); } catch (e) { console.error(e); } }
        if (document.activeElement && box.contains(document.activeElement)) { try { document.activeElement.blur(); } catch (e) { /* ignore */ } }
        deferred = false;
        paintAll();
      };
      box.append(el('section', { class: 'card home-setup', style: { gap: '10px' } },
        el('h2', { class: 'h2' }, 'はじめに、3つだけ決めましょう'),
        el('div', { class: 'stack tight' },
          el('div', { class: 'small' }, 'なぜC1を目指しますか（任意）'), whyIn,
          picks(WHY_EXAMPLES, null, (t) => { why = t; whyIn.value = t; }, '例から選ぶ')),
        el('div', { class: 'stack tight' },
          el('div', { class: 'small' }, 'いつやりますか'), whenRow, otherBox),
        el('div', { class: 'stack tight' },
          el('div', { class: 'small' }, '1日の目標'), segBox,
          el('p', { class: 'small muted' }, '15分で十分なスタートです。ペースごとの到達時期は、下の「C1への道のり」で確かめられます。')),
        el('div', { class: 'row' },
          el('button', { type: 'button', class: 'btn primary grow', onclick: save }, 'これで始める'),
          p.onboarded ? el('button', { type: 'button', class: 'btn', onclick: () => { editing = false; deferred = false; paintAll(); } }, 'やめる') : null)));
    }

    /* 2. today card */
    function paintToday() {
      const box = S.today;
      box.textContent = '';
      const goal = eng('goal', [], fbGoal);
      const min = eng('todayMinutes', [], () => C1.minutesOn(C1.today()));
      const s = eng('streak', [], fbStreak) || fbStreak();
      const menu = eng('menu', [], fbMenu) || fbMenu();
      const next = eng('nextStep', [], () => menu.find((t) => !t.done) || null, true);
      const daily = eng('daily', [], null);
      const allDone = menu.length > 0 && menu.every((t) => t.done);
      const yKey = shiftKey(-1);
      const frozenY = (s.frozen || []).includes(yKey);
      const log = C1.getLog();
      const hadBefore = Object.keys(log).some((k) => k < yKey && C1.minutesOn(k) > 0);
      const missedY = !frozenY && C1.minutesOn(yKey) < 2 && hadBefore;

      let title, line;
      if (allDone) { title = '今日のメニューは完了です'; line = '5つすべて終わりました。おつかれさまでした。今日はここで終えても十分です。'; }
      else if (min >= goal) { title = '今日の目標を達成しました'; line = goal + '分に届きました。余力があれば、次の一歩をどうぞ。'; }
      else if (min > 0) { title = 'いい流れです'; line = 'あと' + Math.max(1, Math.ceil(goal - min)) + '分で今日の目標（' + goal + '分）です。'; }
      else if (frozenY) { title = 'おかえりなさい'; line = '昨日はお休み券が守りました。連続記録は続いています。'; }
      else if (missedY) { title = 'おかえりなさい'; line = '今日からまた積み上げましょう。2分でも、確かな一歩です。'; }
      else { title = '今日の一歩'; line = 'まだこれからです。まず1つ、小さく始めましょう。'; }

      const ring = hasE('ring') ? eng('ring', [84], () => fbRing(min, goal)) : fbRing(min, goal);
      const facts = [el('span', { class: 'chip accent' }, '連続 ' + r0(s.days) + '日')];
      if (!s.fallback) facts.push(el('span', { class: 'chip gold' }, 'お休み券 ' + r0(s.tickets) + '枚'));
      if (s.best > 0) facts.push(el('span', { class: 'chip' }, '最長 ' + r0(s.best) + '日'));

      const card = el('section', { class: 'card' },
        el('div', { class: 'home-today-top' },
          el('div', { class: 'home-ringbox', role: 'img', 'aria-label': '今日 ' + r0(min) + '分 / 目標 ' + goal + '分' }, ring),
          el('div', { class: 'home-tx' },
            el('h1', { class: 'h1' }, title),
            el('p', { class: 'small muted' }, line),
            el('div', { class: 'row', style: { gap: '6px' } }, facts))));

      if (!allDone && next) {
        card.append(el('button', { type: 'button', class: 'btn primary block home-big', onclick: () => C1.go(next.mod) },
          '次の一歩：' + next.name + '（' + next.min + '分）'));
        if (!s.keptToday) {
          card.append(el('div', { class: 'stack tight', style: { alignItems: 'center' } },
            el('button', { type: 'button', class: 'btn ghost', onclick: () => C1.go('vocab') }, '2分だけやる（語彙）'),
            el('p', { class: 'small muted', style: { textAlign: 'center' } }, '2分の記録でも、今日の連続記録はつながります。')));
        }
      } else if (allDone) {
        const ch = daily && daily.challenge;
        if (ch && !ch.done && ch.mod) {
          card.append(el('div', { class: 'stack tight' },
            el('button', { type: 'button', class: 'btn block', onclick: () => C1.go(ch.mod) }, 'もう少しやる：今日のミニ挑戦'),
            el('p', { class: 'small muted' }, ch.text || '')));
        }
      }
      if (!s.fallback) {
        card.append(el('details', { class: 'fold small' },
          el('summary', null, el('span', null, 'お休み券とは')),
          el('div', null, el('p', { class: 'small muted' }, '7日続けるごとに1枚もらえます（最大2枚）。休んだ日があると自動で1枚使い、連続記録を守ります。'))));
      }
      box.append(card);
    }

    /* 3. menu */
    function paintMenu() {
      const box = S.menu;
      box.textContent = '';
      const menu = eng('menu', [], fbMenu) || fbMenu();
      const doneCount = menu.filter((t) => t.done).length;
      const rows = menu.map((t) => el('button', { type: 'button', class: 'task home-task' + (t.done ? ' done' : ''), 'aria-label': t.name + '（' + t.min + '分）' + (t.done ? '、完了' : '、未完了'), onclick: () => C1.go(t.mod) },
        el('span', { class: 'check', 'aria-hidden': 'true' }, '✓'),
        el('span', { class: 't' },
          el('b', null, t.name + '　', el('span', { class: 'small muted', style: { fontWeight: '400' } }, t.done ? '完了' : t.min + '分')),
          el('span', { class: 'small muted' }, t.status || t.what || '')),
        el('span', { class: 'go', 'aria-hidden': 'true' }, '›')));
      box.append(el('section', { class: 'card' },
        el('div', { class: 'row between' },
          el('h2', { class: 'h2' }, '今日のメニュー'),
          el('span', { class: 'chip ' + (doneCount === menu.length ? 'good' : 'accent') }, doneCount + ' / ' + menu.length + ' 完了')),
        el('p', { class: 'small muted' }, '各3分以上で完了になります。上から順でも、気になるものからでも構いません。'),
        el('div', null, rows),
        el('div', { class: 'stack tight' },
          el('div', { class: 'small muted' }, 'アプリ外の多聴・多読（ポッドキャスト、動画、記事、本）を記録'),
          el('div', { class: 'row' },
            [15, 30, 60].map((m) => el('button', { type: 'button', class: 'btn', onclick: () => { C1.logActivity('input', m); C1.toast('多聴多読 ' + m + '分を記録しました'); schedule(); } }, '+' + m + '分'))))));
    }

    /* 4. phrase + challenge */
    function paintDaily() {
      const box = S.daily;
      box.textContent = '';
      const d = eng('daily', [], null);
      if (!d) return;
      const ph = d.phrase;
      if (ph && ph.en) {
        box.append(el('section', { class: 'card' },
          el('div', { class: 'row between' },
            el('div', { class: 'label' }, '今日のひとこと'),
            ph.lv ? el('span', { class: 'chip' }, ph.lv) : null),
          el('p', { class: 'en home-phrase' }, ph.en),
          ph.ja ? el('p', { class: 'small' }, ph.ja) : null,
          ph.ex ? el('p', { class: 'small muted en home-phrase', style: { fontSize: '15px' } }, ph.ex) : null,
          C1.canSpeak() ? el('div', null, el('button', { type: 'button', class: 'btn', onclick: () => {
            C1.speak(ph.ex ? ph.en + '. ' + ph.ex : ph.en, { rate: C1.stage() === 1 ? 0.8 : 1 });
          } }, '音声で聞く')) : null));
      }
      const ch = d.challenge;
      if (ch && ch.text) {
        box.append(el('section', { class: 'card' },
          el('div', { class: 'label' }, '今日のミニ挑戦'),
          el('p', null, ch.text),
          el('div', { class: 'row between' },
            check(ch.done ? 'できました' : 'やったらチェック', ch.done, (v) => { eng('setChallengeDone', [v], null); schedule(); }),
            ch.mod ? el('button', { type: 'button', class: 'btn', onclick: () => C1.go(ch.mod) }, '練習を開く') : null)));
      }
    }

    /* 5. the climb */
    function paintClimb() {
      const box = S.climb;
      const wasOpen = !!box.querySelector('details[open]');
      box.textContent = '';
      const level = C1.level();
      const goal = eng('goal', [], fbGoal);
      const route = eng('route', [], fbRoute) || fbRoute();
      const pj = eng('projection', [], () => fbProjection(goal, route)) || fbProjection(goal, route);
      const names = route.names || [];
      const campName = (i) => names[i] || (i === 0 ? '登山口' : 'キャンプ' + i);
      const nc = route.nextCamp || {};
      const visual = hasE('mountain') ? eng('mountain', [], null) : null;
      const pct = Math.min(100, Math.round((num(route.hours) / (route.need || 1)) * 100));
      const fbVisual = el('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': String(pct), 'aria-valuemin': '0', 'aria-valuemax': '100' }, el('i', { style: { width: pct + '%' } }));

      const where = route.summit
        ? 'C1の頂上に着きました。ここからは維持と仕上げです。'
        : 'いま ' + campName(route.camp) + '（' + r0(route.camp) + ' / ' + r0(route.camps) + '）。'
          + (route.mark ? '次の道標（2時間ごと）まで あと' + r0(route.mark.minutesLeft) + '分。' : '')
          + (nc.name || campName(nc.index)) + 'までは あと' + (Math.round(num(nc.minutesLeft) / 6) / 10) + '時間です。';
      const avg = Math.round(num(pj.avg7) * 10) / 10;
      const fc = route.summit ? '' : (pj.etaAtAvg
        ? '直近7日の平均 ' + avg + '分/日 のペースだと、C1到達は ' + pj.etaAtAvg + 'ごろ。目標の' + goal + '分/日なら ' + pj.etaAtGoal + 'ごろ。'
        : '直近7日の記録がまだないので、平均ペースの予測はこれからです。目標の' + goal + '分/日なら C1到達は ' + pj.etaAtGoal + 'ごろ。');

      const st = C1.stage();
      const allHrs = totalHours();
      const levelSeg = el('div', { class: 'seg', role: 'group', 'aria-label': '現在のレベル' },
        ['B1', 'B2', 'B2+'].map((l) => el('button', { type: 'button', 'aria-pressed': String(l === level), onclick: () => {
          if (l !== level) { store.set('home.level', l); store.set('home.levelBase', allHrs); }
          C1.go('home');
        } }, l)));
      const STAGES = [
        { n: 1, name: 'B1 → B2', focus: '土台づくり。頻出語、基本文法の正確さ、ゆっくりめの英語の聞き取り、身近な話題を1分話す力。' },
        { n: 2, name: 'B2 → C1', focus: '仕上げ。8,000語レベルの語彙、自然な速さの聞き取り、抽象的な議論、構文と文体の使い分け。' },
      ];
      const stageFold = el('details', { class: 'fold' },
        el('summary', null, el('span', null, '2段階で登る（いま第' + st + '段階）')),
        el('div', { class: 'stack tight' },
          STAGES.map((s) => el('p', { class: 'small' + (s.n === st ? '' : ' muted') }, el('b', null, '第' + s.n + '段階 ' + s.name + '　'), s.focus)),
          el('p', { class: 'small muted' }, 'それぞれ約200時間が目安です。各タブの教材は今の段階に合うものから出ます。自己診断でB2の項目が埋まったら、レベルをB2に切り替えてください。')));
      if (wasOpen) stageFold.open = true;

      box.append(el('section', { class: 'card' },
        el('div', { class: 'row between' },
          el('h2', { class: 'h2' }, 'C1への道のり'),
          el('span', { class: 'chip' }, level + ' → C1')),
        el('div', { class: 'home-mtn' }, visual || fbVisual),
        el('p', { class: 'small' }, where),
        fc ? el('p', { class: 'small' }, fc) : null,
        el('div', { class: 'small muted' }, level + 'からの学習 ' + num(route.hours).toFixed(1) + '時間・目安 ' + r0(route.need) + '時間'),
        hasE('setGoal') ? el('div', { class: 'stack tight' },
          el('div', { class: 'small muted' }, '1日の目標（変えると予測も変わります）'),
          goalSeg(goal, (g) => { eng('setGoal', [g], null); schedule(); })) : null,
        el('div', { class: 'stack tight' },
          el('div', { class: 'small muted' }, '今のレベル（変えると道のりを数え直します）'), levelSeg),
        stageFold));
    }

    /* 6. this week */
    function paintWeek() {
      const box = S.week;
      box.textContent = '';
      const goal = eng('goal', [], fbGoal);
      const w = eng('week', [], () => fbWeek(goal)) || fbWeek(goal);
      const GLYPH = { done: '✓', kept: '+', frozen: '休', missed: '', today: '今', future: '' };
      const JA = { done: '目標達成', kept: '記録あり', frozen: 'お休み券', missed: '休み', today: '今日', future: 'これから' };
      const t = C1.today();
      const marks = el('div', { class: 'home-week' }, (w.days || []).map((d) => el('div', { class: 'home-day' + (d.key === t ? ' is-today' : '') },
        el('span', null, d.wd),
        el('span', { class: 'home-mark s-' + d.state, role: 'img', 'aria-label': d.wd + '曜 ' + (JA[d.state] || '') + (d.minutes ? ' ' + r0(d.minutes) + '分' : '') }, GLYPH[d.state] || ''),
        el('span', null, d.minutes >= 1 ? r0(d.minutes) : (d.state === 'future' ? '' : '0')))));
      const tw = r0(w.minutes), lw = r0(w.lastWeekMinutes);
      const cmp = lw === 0 ? (tw > 0 ? '今週から記録が始まりました。' : '')
        : tw >= lw ? '先週より ' + (tw - lw) + '分多く学習しています。' : '先週まであと ' + (lw - tw) + '分です。';
      // time by skill over the last 7 days
      const totals = {};
      for (let i = 0; i < 7; i++) { const day = dayLog(shiftKey(-i)); C1.SKILLS.forEach((s) => { totals[s] = (totals[s] || 0) + (day[s] || 0); }); }
      const sum7 = C1.SKILLS.reduce((a, s) => a + totals[s], 0);
      const tmax = Math.max(1, ...C1.SKILLS.map((s) => totals[s]));
      box.append(el('section', { class: 'card' },
        el('div', { class: 'row between' },
          el('h2', { class: 'h2' }, '今週'),
          el('span', { class: 'small muted' }, '今週 ' + tw + '分・先週 ' + lw + '分')),
        marks,
        el('p', { class: 'small muted' }, '✓ 目標達成　+ 2分以上　休 お休み券　点線 休み　今 今日'),
        cmp ? el('p', { class: 'small' }, cmp) : null,
        el('div', { class: 'label' }, '直近7日の技能別'),
        sum7 > 0
          ? el('div', { class: 'stack tight' }, C1.SKILLS.map((s) => el('div', { class: 'skillrow' },
              el('span', null, SKILL_JA[s]),
              el('div', { class: 'progress' }, el('i', { style: { width: Math.round((totals[s] / tmax) * 100) + '%' } })),
              el('span', { class: 'v' }, Math.round(totals[s]) + '分'))))
          : el('p', { class: 'small muted' }, 'まだ記録がありません。メニューのどれか1つをやると、ここに技能別の時間が出ます。')));
    }

    /* 7. evidence of growth */
    function paintGrowth() {
      const box = S.growth;
      box.textContent = '';
      const st = eng('stats', [], fbStats) || fbStats();
      const row = (k, mod, lines, empty) => el('div', { class: 'home-ev' },
        el('span', { class: 'k' }, k),
        el('div', { class: 'v' }, lines
          ? lines.filter(Boolean).map((l, i) => el('span', { class: i ? 'small muted' : 'small' }, l))
          : [el('span', { class: 'small muted' }, empty), el('div', null, el('button', { type: 'button', class: 'btn ghost', style: { paddingLeft: '0' }, onclick: () => C1.go(mod) }, '始める'))]));
      const v = st.vocab || {}, l = st.listen || {}, s = st.speak || {}, w = st.write || {}, g = st.grammar || {};
      box.append(el('section', { class: 'card' },
        el('div', { class: 'stack tight' },
          el('h2', { class: 'h2' }, '成長の記録'),
          el('p', { class: 'small muted' }, '積み上げた量を、実際の数字で。')),
        el('div', null,
          row('語彙', 'vocab', num(v.learned) > 0 ? [r0(v.learned) + '語を学習・うち定着 ' + r0(v.mature) + '語', '全' + r0(v.total) + '語中・いま復習 ' + r0(v.due) + '枚'] : null,
            '語彙タブで最初の1セット（約10分）を。覚えた語の数がここに出ます。'),
          row('リスニング', 'listen', num(l.done) > 0 || num(l.dictBest) > 0 ? [r0(l.done) + '本完了（全' + r0(l.total) + '本）', num(l.dictBest) > 0 ? 'ディクテーション最高 ' + r0(l.dictBest) + '%・平均 ' + r0(l.dictAvg) + '%' : '', num(l.shadowRounds) > 0 ? 'シャドーイング ' + r0(l.shadowRounds) + '回' : ''] : null,
            'ディクテーションを1本やると、聞き取れた割合が記録されます。'),
          row('スピーキング', 'speak', num(s.speeches) > 0 ? ['スピーチ ' + r0(s.speeches) + '回', num(s.firstWpm) > 0 ? '話す速さ ' + r0(s.firstWpm) + ' → ' + r0(s.lastWpm) + ' wpm（最高 ' + r0(s.bestWpm) + '）' : '話す速さは音声入力で話すと記録されます', num(s.phrasesMastered) > 0 ? '表現 ' + r0(s.phrasesMastered) + ' / ' + r0(s.phrasesTotal) + ' 習得' : ''] : null,
            '1分スピーチを1回。話す速さ（wpm）の記録が始まります。'),
          row('ライティング', 'write', num(w.submissions) > 0 || num(w.drills) > 0 || num(w.reads) > 0 ? [r0(w.words) + '語を書いて提出（' + r0(w.submissions) + '回）', '言い換えドリル ' + r0(w.drills) + '問・読解 ' + r0(w.reads) + '本', w.lastLevel ? '最新の推定レベル ' + w.lastLevel : ''] : null,
            '言い換えを数問、または短い文章を1本。書いた語数が積み上がります。'),
          row('文法', 'grammar', num(g.answered) > 0 ? [r0(g.answered) + '問回答・正答率 ' + r0(g.correctRate) + '%', '習得ユニット ' + r0(g.unitsMastered) + ' / ' + r0(g.unitsTotal) + (num(g.weak) > 0 ? '・解き直し待ち ' + r0(g.weak) + '問' : '')] : null,
            '10問ドリルを1回。正答率と習得ユニットがここに出ます。'))));
    }

    /* 8. badges */
    function paintBadges() {
      const box = S.badges;
      box.textContent = '';
      const list = eng('badges', [], null);
      if (!Array.isArray(list) || !list.length) return;
      const earned = list.filter((b) => b.earned);
      const locked = list.filter((b) => !b.earned);
      const card = (b) => el('div', { class: 'home-badge ' + (b.earned ? 'earned' : 'locked') },
        el('b', null, b.name),
        el('span', { class: 'small' + (b.earned ? '' : ' muted') }, b.desc || ''),
        el('span', { class: 'small muted' }, b.earned ? (b.date ? md(b.date) + ' 獲得' : '獲得') : '未獲得'));
      box.append(el('section', { class: 'card' },
        el('div', { class: 'row between' },
          el('h2', { class: 'h2' }, 'バッジ'),
          el('span', { class: 'chip gold' }, earned.length + ' / ' + list.length)),
        earned.length ? null : el('p', { class: 'small muted' }, '最初のバッジは、今日のメニューを1つ終えると近づきます。'),
        el('div', { class: 'home-badges' }, earned.concat(locked).map(card))));
    }

    function paintAll() {
      if (!alive) return;
      const painters = { setup: paintSetup, today: paintToday, menu: paintMenu, daily: paintDaily, climb: paintClimb, week: paintWeek, growth: paintGrowth, badges: paintBadges };
      for (const k in painters) {
        if (k === 'setup' && editing) continue; // never rebuild the form under the learner's fingers
        try { painters[k](); } catch (e) { console.error('home ' + k, e); S[k].textContent = ''; }
      }
    }
    function typingInSetup() {
      const a = document.activeElement;
      return editing && a && S.setup.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName || '');
    }
    function refresh() {
      timer = null;
      if (!alive) return;
      if (typingInSetup()) { deferred = true; return; }
      paintAll();
      eng('showPending', [], null);
    }
    function schedule() {
      if (!alive || timer) return;
      timer = setTimeout(refresh, 0);
    }
    const onFocusOut = () => { if (deferred) { deferred = false; setTimeout(() => { if (!typingInSetup()) schedule(); else deferred = true; }, 0); } };
    S.setup.addEventListener('focusout', onFocusOut);

    /* static, lower on the page: roadmap + can-do + storage note */
    const st = C1.stage();
    const roadmap = el('section', { class: 'card' },
      el('details', { class: 'fold', style: { borderTop: '0', paddingTop: '0' } },
        el('summary', null, el('span', { class: 'h2' }, 'C1に必要な7つのこと')),
        el('div', { class: 'stack' },
          el('p', { class: 'small muted' }, 'C1は「上級」の入口です。複雑な話題を、流暢に、正確に、場面に合わせて扱える力を指します。第1段階でも同じ7つを、B2の水準で鍛えます。'),
          ROADMAP.map((r, i) => el('details', { class: 'fold' },
            el('summary', null, el('span', null, (i + 1) + '. ' + r.t)),
            el('div', { class: 'stack' },
              el('p', { class: 'small' }, r.c1),
              el('ul', { class: 'plain small' }, r.how.map((h) => el('li', null, h))),
              r.tab ? el('div', null, el('button', { type: 'button', class: 'btn', onclick: () => C1.go(r.tab) }, 'この練習を開く')) : null))))));

    function candoGroup(title, items, key, judge) {
      let checks = store.get(key, []);
      if (!Array.isArray(checks)) checks = [];
      const result = el('p', { class: 'small' });
      const list = el('div', { class: 'stack tight' });
      const verdict = () => {
        const n = items.filter((_, i) => checks.includes(i)).length;
        result.textContent = n + ' / ' + items.length + '：' + judge(n);
      };
      items.forEach((c, i) => {
        const id = key.replace('.', '-') + i;
        const cb = el('input', { type: 'checkbox', id, style: { width: '20px', height: '20px', flex: '0 0 20px', marginTop: '3px' } });
        cb.checked = checks.includes(i);
        cb.addEventListener('change', () => {
          const at = checks.indexOf(i);
          if (cb.checked && at < 0) checks.push(i); else if (!cb.checked && at >= 0) checks.splice(at, 1);
          store.set(key, checks); verdict();
        });
        list.append(el('label', { for: id, style: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 0', minHeight: '44px', cursor: 'pointer' } }, cb, el('span', null, c)));
      });
      verdict();
      return el('div', { class: 'stack' }, el('div', { class: 'label' }, title), list, el('div', { class: 'feedback' }, result));
    }
    const b2 = candoGroup('第1段階のゴール：B2', CANDO_B2, 'home.candoB2', (n) =>
      n >= 5 ? 'B2に届いています。「C1への道のり」のレベルをB2に切り替えて、第2段階へ進みましょう。'
        : n >= 3 ? 'B2まであと少しです。チェックが付かなかった項目が、次に鍛える技能です。'
        : 'B1相当です。毎日のメニューを一周することから始めましょう。');
    const c1 = candoGroup('第2段階のゴール：C1', CANDO, 'home.cando', (n) =>
      n >= 7 ? 'C1に到達している可能性が高いです。C1試験の模試で確認しましょう。'
        : n >= 4 ? 'B2+相当です。チェックが付かなかった項目が、次に鍛える技能です。'
        : st === 1 ? 'ここは第2段階の目標です。今はB2の項目に集中しましょう。' : 'B2相当です。毎日のメニューを続けましょう。');
    const cando = el('section', { class: 'card' },
      el('details', { class: 'fold', style: { borderTop: '0', paddingTop: '0' } },
        el('summary', null, el('span', { class: 'h2' }, '自己診断：Can-do')),
        el('div', { class: 'stack' },
          el('p', { class: 'small muted' }, '無理なくできるものだけにチェックを付けてください。月に1回見直します。'),
          st === 1 ? [b2, el('hr', { class: 'divider' }), c1] : [c1, el('hr', { class: 'divider' }), b2])));

    root.append(S.setup, S.today, S.menu, S.daily, S.climb, S.week, S.growth, S.badges, roadmap, cando,
      el('p', { class: 'small muted', style: { textAlign: 'center' } }, '学習記録はこの端末のブラウザにだけ保存されます。'));
    paintAll();
    eng('showPending', [], null);

    document.addEventListener('c1:engage', schedule);
    document.addEventListener('c1:log', schedule);
    document.addEventListener('c1:caps', schedule);
    return function cleanup() {
      alive = false;
      if (timer) clearTimeout(timer);
      timer = null;
      document.removeEventListener('c1:engage', schedule);
      document.removeEventListener('c1:log', schedule);
      document.removeEventListener('c1:caps', schedule);
      S.setup.removeEventListener('focusout', onFocusOut);
    };
  }

  C1.register({
    id: 'home', label: 'ホーム',
    icon: '<svg viewBox="0 0 24 24"><path d="M4 20V10l8-6 8 6v10h-5v-6H9v6z"/></svg>',
    render,
  });
})();
