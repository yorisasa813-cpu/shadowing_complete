/* C1 Climb — motivation layer ("engage"). Streaks with rest tickets, daily menu, the route of camps,
   badges, phrase/challenge of the day, celebrations and small shared widgets. Exposes window.C1.engage.
   Loads after core.js and before every module: modules are only touched inside functions. */
(function () {
  'use strict';
  const C1 = window.C1;
  if (!C1) return;
  const store = C1.store;
  const P = 'engage.';
  const get = (k, d) => { try { const v = store.get(P + k, d); return v == null ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { store.set(P + k, v); } catch (e) { /* ignore */ } return v; };
  const hasDoc = typeof document !== 'undefined';
  const fire = () => { if (hasDoc) try { document.dispatchEvent(new CustomEvent('c1:engage')); } catch (e) { /* ignore */ } };
  const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

  /* ---------- dates ---------- */
  const keyOf = (d) => C1.dateKey(d);
  const todayKey = () => keyOf(new Date());
  function parseKey(k) { const p = String(k).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDays(k, n) { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
  function dayIndex(k) { const p = String(k).split('-').map(Number); return Math.floor(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5); }
  function ym(d) { return d.getFullYear() + '年' + (d.getMonth() + 1) + '月'; }
  const WD = ['日', '月', '火', '水', '木', '金', '土'];

  const mins = (k) => safe(() => Number(C1.minutesOn(k)) || 0, 0);
  const log = () => safe(() => C1.getLog() || {}, {});
  const isKept = (k) => mins(k) >= 2;
  const skillMin = (k, s) => { const d = log()[k] || {}; return Number(d[s]) || 0; };
  const r1 = (x) => Math.round(x * 10) / 10;

  /* ---------- goal ---------- */
  const GOALS = [5, 15, 30, 45];
  function goal() { const g = Number(get('goal', 15)); return GOALS.indexOf(g) >= 0 ? g : 15; }
  function setGoal(m) { m = Number(m); if (GOALS.indexOf(m) < 0) return; set('goal', m); refresh(); }
  function todayMinutes() { return r1(mins(todayKey())); }

  /* ---------- streak & rest tickets ---------- */
  const frozenList = () => { const f = get('frozen', []); return Array.isArray(f) ? f : []; };
  function tickets() { const t = Math.floor(Number(get('tickets', 0)) || 0); return Math.max(0, Math.min(2, t)); }

  function streakDays() {
    const fz = new Set(frozenList());
    let k = todayKey();
    if (!isKept(k)) k = addDays(k, -1);
    let n = 0;
    for (let i = 0; i < 4000; i++) {
      if (isKept(k)) n++;
      else if (!fz.has(k)) break;
      k = addDays(k, -1);
    }
    return n;
  }
  function streak() {
    const days = streakDays();
    const best = Math.max(Number(get('best', 0)) || 0, days);
    return { days, keptToday: isKept(todayKey()), tickets: tickets(), frozen: frozenList().slice(), best };
  }

  /* Spend tickets on missed days between the last kept/frozen day and yesterday. Tickets are only spent
     when they cover the whole gap (spending them on a streak that breaks anyway would just waste them). */
  function settle() {
    const t = todayKey();
    const yest = addDays(t, -1);
    const settled = get('settled', '');
    if (settled >= yest) return 0;
    const fz = new Set(frozenList());
    let last = null;
    let k = yest;
    for (let i = 0; i < 400; i++) { if (isKept(k) || fz.has(k)) { last = k; break; } k = addDays(k, -1); }
    // days up to `settled` were judged before; if any of them stayed uncovered the streak already restarted
    const from = last && !(settled && addDays(last, 1) <= settled) ? addDays(last, 1) : null;
    let used = 0;
    if (from && from <= yest) {
      const gap = [];
      for (let d = from; d <= yest && gap.length < 400; d = addDays(d, 1)) gap.push(d);
      const have = tickets();
      if (gap.length <= have) {
        set('frozen', frozenList().concat(gap).slice(-60));
        set('tickets', have - gap.length);
        used = gap.length;
      }
    }
    set('settled', yest);
    return used;
  }

  /* ---------- week ---------- */
  function dayState(k, t, fz) {
    const m = mins(k);
    if (k > t) return 'future';
    if (m >= goal()) return 'done';
    if (m >= 2) return 'kept';
    if (k === t) return 'today';
    if (fz.has(k)) return 'frozen';
    return 'missed';
  }
  function week() {
    const t = todayKey();
    const d = parseKey(t);
    const mon = addDays(t, -((d.getDay() + 6) % 7));
    const fz = new Set(frozenList());
    const days = [];
    let total = 0, last = 0, kept = 0;
    for (let i = 0; i < 7; i++) {
      const k = addDays(mon, i);
      const m = r1(mins(k));
      const state = dayState(k, t, fz);
      if (state === 'done' || state === 'kept') kept++;
      total += m;
      last += mins(addDays(mon, i - 7));
      days.push({ key: k, wd: WD[parseKey(k).getDay()], minutes: m, state });
    }
    return { days, minutes: r1(total), lastWeekMinutes: r1(last), keptDays: kept };
  }

  /* ---------- daily menu ---------- */
  const TASKS = [
    { skill: 'vocab', mod: 'vocab', name: '語彙', min: 10, what: '単語カードの復習と新しい語' },
    { skill: 'listening', mod: 'listen', name: 'リスニング', min: 10, what: 'ディクテーションかシャドーイング' },
    { skill: 'speaking', mod: 'speak', name: 'スピーキング', min: 5, what: 'お題で1分スピーチ' },
    { skill: 'grammar', mod: 'grammar', name: '文法', min: 5, what: '要点の確認と練習問題' },
    { skill: 'writing', mod: 'write', name: 'ライティング', min: 10, what: '短い英文を書いて見直す' },
  ];
  // Radio Eikaiwa (Shadowing Coach on this device) comes first for listening when the bridge has lessons
  const radioOn = () => safe(() => !!(C1.radio && C1.radio.available()), false);
  const RADIO_WHAT = 'ラジオ英会話のシャドーイングか書き取り';
  const pickTask = (t) => ({ skill: t.skill, mod: t.mod, name: t.name, min: t.min, what: t.skill === 'listening' && radioOn() ? RADIO_WHAT : t.what });
  function listenStatus(own) {
    if (!radioOn()) return own;
    const n = safe(() => Number(C1.radio.todayPlan().total) || 0, 0);
    if (n > 0) return '今日やること ' + n + '件';
    return own;
  }
  function modStatus(id) {
    return safe(() => { const m = C1.getModule(id); if (!m || typeof m.status !== 'function') return ''; const s = m.status(); return s == null ? '' : String(s); }, '');
  }
  function menu() {
    const t = todayKey();
    return TASKS.map((x) => {
      const m = r1(skillMin(t, x.skill));
      const st = modStatus(x.mod);
      return Object.assign(pickTask(x), { done: m >= 3, minutes: m, status: x.skill === 'listening' ? listenStatus(st) : st });
    });
  }
  function doneSet() { const t = todayKey(); return TASKS.filter((x) => skillMin(t, x.skill) >= 3).map((x) => x.skill); }
  function nextStep() {
    const t = todayKey();
    const x = TASKS.find((y) => skillMin(t, y.skill) < 3);
    return x ? pickTask(x) : null;
  }
  function nextCard(currentSkill) {
    if (!hasDoc) return null;
    try {
      const t = todayKey();
      const undone = TASKS.filter((y) => skillMin(t, y.skill) < 3);
      const n = TASKS.length - undone.length;
      const card = C1.el('div', { class: 'card sunken engage-next' });
      if (undone.length) {
        const nx = undone.find((y) => y.skill !== currentSkill) || undone[0];
        card.append(
          C1.el('div', { class: 'row between' },
            C1.el('span', { class: 'small muted' }, '今日のメニュー ' + n + ' / ' + TASKS.length),
            C1.el('span', { class: 'small muted' }, '今日 ' + Math.round(mins(t)) + ' / ' + goal() + '分')),
          C1.el('div', { class: 'progress' }, C1.el('i', { style: { width: (n / TASKS.length * 100) + '%' } })),
          C1.el('button', { type: 'button', class: 'btn primary block', onclick: () => C1.go(nx.mod) }, '次へ：' + nx.name + '（' + nx.min + '分）'));
      } else {
        card.append(
          C1.el('p', { class: 'h2' }, '今日のメニューは完了です'),
          C1.el('p', { class: 'small muted' }, '今日は合計' + Math.round(mins(t)) + '分。おつかれさまでした。'),
          C1.el('button', { type: 'button', class: 'btn block', onclick: () => C1.go('home') }, 'ホームへ戻る'));
      }
      return card;
    } catch (e) {
      const c = document.createElement('div');
      c.className = 'card sunken';
      return c;
    }
  }

  /* ---------- route ---------- */
  const NEED = { B1: 400, B2: 200, 'B2+': 100 };
  function totalHours() {
    const l = log(); let s = 0;
    for (const k in l) { const d = l[k] || {}; for (const sk in d) s += Number(d[sk]) || 0; }
    return s / 60;
  }
  function campNames(level, camps) {
    const names = [];
    const marks = { 1: '樹林帯', 2: '見晴台', 3: '森林限界', 5: '岩稜', 6: '肩の小屋', 7: '最後の稜線' };
    for (let i = 0; i <= camps; i++) {
      let n = '第' + i + 'キャンプ';
      const f = (i * 8) / camps;
      if (Number.isInteger(f) && marks[f]) n = marks[f];
      if (i * 2 === camps) n = level === 'B1' ? 'B2キャンプ' : '中間キャンプ';
      if (i === 0) n = '登山口';
      if (i === camps) n = 'C1 山頂';
      names.push(n);
    }
    return names;
  }
  function routeRaw() {
    const level = safe(() => C1.level(), 'B1');
    const need = NEED[level] || 400;
    const base = Number(safe(() => store.get('home.levelBase', 0), 0)) || 0;
    const hours = Math.max(0, totalHours() - base);
    const camps = need / 10;
    const camp = Math.min(camps, Math.floor(hours / 10 + 1e-9));
    const names = campNames(level, camps);
    const summit = hours >= need;
    const idx = summit ? camps : camp + 1;
    const minutesLeft = summit ? 0 : Math.max(0, Math.ceil((idx * 10 - hours) * 60 - 1e-6));
    const pct = summit ? 100 : Math.max(0, Math.min(100, Math.round((hours - camp * 10) * 10)));
    // waypoints (道標): one every 2 hours, so the next milestone is always about a week away at 15 min/day
    const marksDone = Math.floor(hours / 2 + 1e-9);
    const mark = { done: marksDone, minutesLeft: summit ? 0 : Math.max(1, Math.ceil(((marksDone + 1) * 2 - hours) * 60 - 1e-6)), pct: summit ? 100 : Math.max(0, Math.min(100, Math.round((hours - marksDone * 2) * 50))) };
    return { level, need, hours: r1(hours), hoursRaw: hours, camps, camp, base, nextCamp: { index: idx, name: names[idx], minutesLeft, pct }, mark, summit, names };
  }
  function route() { const r = routeRaw(); delete r.hoursRaw; delete r.base; return r; }

  function projection() {
    const t = todayKey();
    let s = 0;
    for (let i = 0; i < 7; i++) s += mins(addDays(t, -i));
    const avg7 = r1(s / 7);
    const r = routeRaw();
    const leftMin = Math.max(0, (r.need - r.hoursRaw) * 60);
    const eta = (perDay) => { const d = parseKey(t); d.setDate(d.getDate() + Math.ceil(leftMin / perDay)); return ym(d); };
    return { avg7, etaAtAvg: avg7 > 0 ? eta(s / 7) : null, etaAtGoal: eta(goal()) };
  }

  /* ---------- module stats ---------- */
  function modStats(id) {
    return safe(() => { const m = C1.getModule(id); if (!m || typeof m.stats !== 'function') return null; const v = m.stats(); return v && typeof v === 'object' ? v : null; }, null);
  }
  function stats() { return { vocab: modStats('vocab'), listen: modStats('listen'), speak: modStats('speak'), write: modStats('write'), grammar: modStats('grammar') }; }

  /* ---------- badges ---------- */
  const num = (o, k) => (o && Number(o[k])) || 0;
  function allFiveEver() {
    const l = log();
    for (const k in l) if (TASKS.every((x) => (Number((l[k] || {})[x.skill]) || 0) >= 3)) return true;
    return false;
  }
  function anyStudy() { const l = log(); for (const k in l) if (mins(k) > 0) return true; return false; }
  const BADGES = [
    ['first', '継続', 'はじめの一歩', '初めて学習を記録した', (c) => c.any],
    ['s3', '継続', '三日続く', '3日連続で学習した', (c) => c.best >= 3],
    ['s7', '継続', '一週間', '7日連続で学習した', (c) => c.best >= 7],
    ['s14', '継続', '二週間', '14日連続で学習した', (c) => c.best >= 14],
    ['s30', '継続', 'ひと月', '30日連続で学習した', (c) => c.best >= 30],
    ['s100', '継続', '百日', '100日連続で学習した', (c) => c.best >= 100],
    ['all5', '継続', '全メニュー', '1日で5つのメニューをすべて終えた', (c) => c.all5],
    ['h10', '時間', '10時間', '合計10時間学習した', (c) => c.h >= 10],
    ['h50', '時間', '50時間', '合計50時間学習した', (c) => c.h >= 50],
    ['h100', '時間', '100時間', '合計100時間学習した', (c) => c.h >= 100],
    ['h200', '時間', '200時間', '合計200時間学習した', (c) => c.h >= 200],
    ['v50', '語彙', '語彙50', '50語を学習した', (c) => num(c.s.vocab, 'learned') >= 50],
    ['v200', '語彙', '語彙200', '200語を学習した', (c) => num(c.s.vocab, 'learned') >= 200],
    ['v400', '語彙', '語彙400', '400語を学習した', (c) => num(c.s.vocab, 'learned') >= 400],
    ['dict90', '聴く', '聞き取り90', 'ディクテーションで初めて90%以上', (c) => num(c.s.listen, 'dictBest') >= 90],
    ['pass10', '聴く', '10の文章', 'リスニング教材を10本終えた', (c) => num(c.s.listen, 'done') >= 10],
    ['sp1', '話す', '最初のスピーチ', '初めてスピーチをした', (c) => num(c.s.speak, 'speeches') >= 1],
    ['sp10', '話す', 'スピーチ10回', 'スピーチを10回した', (c) => num(c.s.speak, 'speeches') >= 10],
    ['wpm100', '話す', '毎分100語', '毎分100語のペースで話した', (c) => num(c.s.speak, 'bestWpm') >= 100],
    ['w1', '書く', '最初の提出', '初めて英文を提出した', (c) => num(c.s.write, 'submissions') >= 1],
    ['w1000', '書く', '1,000語', '合計1,000語を書いた', (c) => num(c.s.write, 'words') >= 1000],
    ['g1', '文法', '最初の単元', '文法の単元を初めて習得した', (c) => num(c.s.grammar, 'unitsMastered') >= 1],
    ['g100', '文法', '文法100問', '文法問題に100問答えた', (c) => num(c.s.grammar, 'answered') >= 100],
  ];
  const earnedMap = () => { const m = get('badges', {}); return m && typeof m === 'object' ? m : {}; };
  function badges() {
    const m = earnedMap();
    return BADGES.map((b) => ({ id: b[0], name: b[2], desc: b[3], earned: !!m[b[0]], date: m[b[0]] || null, group: b[1] }));
  }
  function detectBadges() {
    const ctx = { any: anyStudy(), best: Math.max(Number(get('best', 0)) || 0, streakDays()), all5: allFiveEver(), h: totalHours(), s: stats() };
    const m = earnedMap();
    const fresh = [];
    BADGES.forEach((b) => { if (!m[b[0]] && safe(() => !!b[4](ctx), false)) { m[b[0]] = todayKey(); fresh.push(b); } });
    if (fresh.length) set('badges', m);
    return fresh;
  }

  /* ---------- profile ---------- */
  function profile() {
    const p = get('profile', {}) || {};
    return { why: typeof p.why === 'string' ? p.why : '', when: typeof p.when === 'string' ? p.when : '', onboarded: !!p.onboarded };
  }
  function setProfile(partial) {
    if (!partial || typeof partial !== 'object') return;
    const p = Object.assign(profile(), partial);
    set('profile', { why: String(p.why || ''), when: String(p.when || ''), onboarded: !!p.onboarded });
    refresh();
  }

  /* ---------- phrase & challenge of the day ---------- */
  const CHALLENGES = [
    { id: 'c-use-word', skill: 'speaking', mod: 'speak', text: '今日覚えた語を1つ使って1分スピーチをする' },
    { id: 'c-dict90', skill: 'listening', mod: 'listen', text: 'ディクテーションで90%以上を1文出す' },
    { id: 'c-rephrase3', skill: 'writing', mod: 'write', text: '言い換えを3問やる' },
    { id: 'c-review10', skill: 'vocab', mod: 'vocab', text: '単語カードを10枚復習する' },
    { id: 'c-gram5', skill: 'grammar', mod: 'grammar', text: '文法問題を5問続けて正解する' },
    { id: 'c-shadow2', skill: 'listening', mod: 'listen', text: '同じ文章でシャドーイングを2回通す' },
    { id: 'c-phrase3', skill: 'speaking', mod: 'speak', text: '今日のフレーズを声に出して3回言う' },
    { id: 'c-write50', skill: 'writing', mod: 'write', text: '50語以上の英文を1つ書く' },
    { id: 'c-new5', skill: 'vocab', mod: 'vocab', text: '新しい語を5つ覚える' },
    { id: 'c-gist', skill: 'listening', mod: 'listen', text: '文章を1つ聞いて要点を答える' },
    { id: 'c-redo3', skill: 'grammar', mod: 'grammar', text: '間違えた問題を3問解き直す' },
    { id: 'c-pace', skill: 'speaking', mod: 'speak', text: '前回より少し速いペースで話してみる' },
    { id: 'c-read1', skill: 'writing', mod: 'write', text: 'リーディングを1つ読み終える' },
    { id: 'c-own-ex', skill: 'vocab', mod: 'vocab', text: '例文を1つ自分の話に書き換えて言う' },
  ];
  function phraseFor(k) {
    const want = safe(() => C1.stage(), 1) === 1 ? 'B2' : 'C1';
    const pool = [];
    safe(() => {
      const v = window.C1_VOCAB;
      if (Array.isArray(v)) v.forEach((x) => { if (x && x.term) pool.push({ en: String(x.term), ja: String(x.ja || ''), ex: String(x.ex || ''), lv: x.lv === 'C1' ? 'C1' : 'B2' }); });
    });
    safe(() => {
      const p = window.C1_SPEAK && window.C1_SPEAK.phrases;
      if (Array.isArray(p)) p.forEach((x) => { if (x && x.en) pool.push({ en: String(x.en), ja: String(x.ja || ''), ex: String(x.ex || ''), lv: x.lv === 'C1' ? 'C1' : 'B2' }); });
    });
    if (!pool.length) return null;
    const pref = pool.filter((x) => x.lv === want);
    const list = pref.length ? pref : pool;
    return list[((dayIndex(k) * 7919) % list.length + list.length) % list.length];
  }
  function daily() {
    const k = todayKey();
    const c = CHALLENGES[((dayIndex(k) % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];
    const done = !!(get('challenge', {}) || {})[k];
    return { phrase: phraseFor(k), challenge: Object.assign({}, c, { done }) };
  }
  function setChallengeDone(b) {
    const k = todayKey();
    const m = get('challenge', {}) || {};
    if (b) m[k] = true; else delete m[k];
    const keys = Object.keys(m).sort();
    while (keys.length > 60) delete m[keys.shift()];
    set('challenge', m);
    refresh();
  }

  /* ---------- celebration queue ---------- */
  function pending() { const p = get('pending', []); return Array.isArray(p) ? p.map((x) => ({ kind: x.kind, title: x.title, text: x.text })) : []; }
  function queue(key, item) {
    const done = get('celebrated', {}) || {};
    if (done[key]) return false;
    done[key] = todayKey();
    set('celebrated', done);
    const p = get('pending', []);
    const list = Array.isArray(p) ? p : [];
    list.push({ kind: item.kind, title: item.title, text: item.text, key });
    set('pending', list.slice(-12));
    return true;
  }

  /* ---------- the check that runs on init and after each log ---------- */
  let snap = null;
  let inited = false;
  let settled = false;
  function snapshot() { return { kept: isKept(todayKey()), done: doneSet() }; }

  function check(silentFirstRun) {
    const t = todayKey();
    const used = settle();
    const st = streak();
    if (st.days > (Number(get('best', 0)) || 0)) set('best', st.days);

    // daily goal and the full menu
    const m = mins(t);
    if (m >= goal()) queue('goal:' + t, { kind: 'goal', title: '今日の目標を達成', text: '今日の目標' + goal() + '分を達成。連続' + st.days + '日目です。' });
    if (doneSet().length === TASKS.length) queue('all5:' + t, { kind: 'menu', title: '今日のメニューを完走', text: '5つのメニューをすべて終えました。今日は合計' + Math.round(m) + '分です。' });

    // rest ticket at every multiple of 7
    if (st.keptToday && st.days > 0 && st.days % 7 === 0) {
      const td = get('ticketDays', {}) || {};
      if (!td[t]) {
        td[t] = st.days;
        set('ticketDays', td);
        if (tickets() < 2) {
          set('tickets', tickets() + 1);
          queue('ticket:' + t, { kind: 'ticket', title: 'お休み券を1枚獲得', text: '連続' + st.days + '日の記念です。来られない日があっても、この券が連続記録を守ります（手持ち' + tickets() + '枚）。' });
        }
      }
    }

    // camps
    const r = routeRaw();
    const rk = r.level + '@' + r1(r.base);
    const seen = get('camp', null);
    if (!seen || seen.key !== rk || silentFirstRun) set('camp', { key: rk, camp: r.camp });
    else if (r.camp > seen.camp) {
      set('camp', { key: rk, camp: r.camp });
      const name = r.names[r.camp];
      const hrs = Math.round(r.hoursRaw);
      const text = r.summit
        ? r.need + '時間の登山をやり遂げました。ここがC1の景色です。'
        : name + '到達。ここまで' + hrs + '時間。次の' + r.names[r.camp + 1] + 'まで10時間です。';
      queue('camp:' + rk + ':' + r.camp, { kind: 'camp', title: r.summit ? 'C1 山頂に到達' : name + 'に到達', text });
    }

    // badges
    const firstBadges = !get('badgesInit', false);
    const fresh = detectBadges();
    set('badgesInit', true);
    if (fresh.length && !firstBadges && !silentFirstRun) {
      if (fresh.length <= 2) fresh.forEach((b) => queue('badge:' + b[0], { kind: 'badge', title: 'バッジ獲得：' + b[2], text: b[3] + '。' }));
      else queue('badges:' + fresh.map((b) => b[0]).join(','), { kind: 'badge', title: 'バッジを' + fresh.length + '個獲得', text: fresh.map((b) => b[2]).join('・') + '。' });
    } else if (fresh.length) {
      const done = get('celebrated', {}) || {};
      fresh.forEach((b) => { done['badge:' + b[0]] = t; });
      set('celebrated', done);
    }
    return used;
  }

  function onLog() {
    if (!settled) { fire(); return; }
    try {
      const before = snap || { kept: false, done: [] };
      check(false);
      const after = snapshot();
      const st = streak();
      let msg = '';
      const newly = TASKS.filter((x) => after.done.indexOf(x.skill) >= 0 && before.done.indexOf(x.skill) < 0);
      const taskMsg = newly.length ? newly[newly.length - 1].name + ' 完了・今日 ' + after.done.length + ' / ' + TASKS.length : '';
      if (after.kept && !before.kept) msg = '連続 ' + st.days + '日目' + (taskMsg ? '・' + taskMsg : '');
      else msg = taskMsg;
      snap = after;
      // waypoint passed (every 2 hours): a small toast when nothing more important is being said
      const rr = routeRaw();
      const mk = rr.level + '@' + r1(rr.base);
      const seenM = get('mark', null);
      if (!seenM || seenM.key !== mk) set('mark', { key: mk, done: rr.mark.done });
      else if (rr.mark.done > seenM.done) {
        set('mark', { key: mk, done: rr.mark.done });
        if (!msg && rr.mark.done % 5 !== 0) msg = '道標を通過・ここまで' + (rr.mark.done * 2) + '時間';
      }
      if (msg) C1.toast(msg);
    } catch (e) { /* never break logging */ }
    fire();
  }

  function refresh() { snap = safe(snapshot, snap); fire(); }

  /* ---------- styles (once) ---------- */
  function css() {
    if (!hasDoc || document.getElementById('engage-style')) return;
    const s = document.createElement('style');
    s.id = 'engage-style';
    s.textContent = [
      '.engage-top{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:3px 10px 3px 8px;border-radius:99px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent}',
      '.engage-top .eg-s{display:inline-flex;align-items:center;gap:3px;color:var(--gold)}',
      '.engage-top .eg-t{display:inline-flex;align-items:center;gap:2px;color:var(--muted);font-size:12px}',
      '.engage-top svg{display:block;flex:none}',
      '.engage-top .eg-u{font-size:11px;font-weight:600;margin-left:1px}',
      '.engage-ov{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:24px 16px}',
      '.engage-ov .eg-back{position:absolute;inset:0;background:var(--ink);opacity:.42}',
      '.engage-ov canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}',
      '.engage-ov .card{position:relative;width:100%;max-width:360px;text-align:center;padding:24px 20px 18px;box-shadow:0 10px 40px rgba(0,0,0,.25);animation:engage-in .28s ease-out}',
      '.engage-ov .eg-kind{color:var(--gold)}',
      '@keyframes engage-in{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}',
      '.engage-mtn{display:flex;flex-direction:column;gap:6px}','.engage-mtn svg{display:block;width:100%;height:auto}','.engage-mtn-cap b{font-weight:700}',
      '.engage-ring{position:relative;display:inline-block;flex:none}',
      '.engage-ring svg{display:block}',
    ].join('\n');
    (document.head || document.documentElement).append(s);
  }

  /* ---------- top-bar widget ---------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs) { const n = document.createElementNS(SVGNS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function miniRing(size, frac, stroke) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const s = svg('svg', { width: size, height: size, viewBox: '0 0 ' + size + ' ' + size, 'aria-hidden': 'true' });
    s.append(svg('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: 'var(--sunken)', 'stroke-width': stroke }));
    const f = Math.max(0, Math.min(1, frac));
    if (f > 0) s.append(svg('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: f >= 1 ? 'var(--good)' : 'var(--accent)', 'stroke-width': stroke, 'stroke-linecap': 'round', 'stroke-dasharray': (c * f) + ' ' + c, transform: 'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')' }));
    return s;
  }
  function renderTop() {
    if (!hasDoc) return;
    const host = document.getElementById('topstat');
    if (!host) return;
    try {
      const st = streak(), m = todayMinutes(), g = goal();
      const peak = svg('svg', { width: 14, height: 14, viewBox: '0 0 24 24', 'aria-hidden': 'true' });
      peak.append(svg('path', { d: 'M2 20 L9.5 7 L13 13 L15.5 9 L22 20 Z', fill: st.keptToday ? 'currentColor' : 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
      const parts = [C1.el('span', { class: 'eg-s' }, peak, C1.el('span', null, String(st.days)), C1.el('span', { class: 'eg-u' }, '日'))];
      if (st.tickets > 0) {
        const tk = svg('svg', { width: 13, height: 13, viewBox: '0 0 24 24', 'aria-hidden': 'true' });
        tk.append(svg('path', { d: 'M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linejoin': 'round' }));
        parts.push(C1.el('span', { class: 'eg-t' }, tk, String(st.tickets)));
      }
      parts.push(C1.el('span', { class: 'eg-t' }, miniRing(18, m / g, 3), C1.el('span', null, Math.floor(m) + '/' + g)));
      const label = '連続' + st.days + '日' + (st.tickets ? '、お休み券' + st.tickets + '枚' : '') + '、今日' + Math.floor(m) + '分／目標' + g + '分。ホームへ';
      const b = C1.el('button', { type: 'button', class: 'engage-top', 'aria-label': label, title: label, onclick: () => C1.go('home') }, parts);
      host.innerHTML = '';
      host.append(b);
    } catch (e) { /* ignore */ }
  }

  /* ---------- ring ---------- */
  function ring(size) {
    if (!hasDoc) return null;
    size = Number(size) > 0 ? Number(size) : 96;
    const m = todayMinutes(), g = goal();
    const stroke = Math.max(4, Math.round(size / 11));
    const wrap = C1.el('div', { class: 'engage-ring', role: 'img', 'aria-label': '今日 ' + Math.floor(m) + '分／目標 ' + g + '分', style: { width: size + 'px', height: size + 'px' } });
    const s = miniRing(size, m / g, stroke);
    const fs = Math.round(size * 0.27);
    const t1 = svg('text', { x: size / 2, y: size / 2 + fs * 0.2, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': fs, 'font-weight': 700, style: 'font-family:var(--font-display);font-variant-numeric:tabular-nums' });
    t1.textContent = String(Math.floor(m));
    const t2 = svg('text', { x: size / 2, y: size / 2 + fs * 0.2 + Math.max(10, size * 0.14), 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': Math.max(9, Math.round(size * 0.12)), style: 'font-family:var(--font-body)' });
    t2.textContent = '/ ' + g + '分';
    s.append(t1, t2);
    wrap.append(s);
    return wrap;
  }

  /* ---------- mountain ---------- */
  function mountain() {
    if (!hasDoc) return null;
    try {
      css();
      const r = routeRaw();
      const W = 343, H = 210, x0 = 18, x1 = W - 18, y0 = 178, y1 = 38;
      const N = r.camps;
      const pt = (i) => {
        const t = i / N;
        const wob = Math.sin(t * Math.PI * 5.3) * 7 * Math.sin(t * Math.PI);
        return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * Math.pow(t, 0.92) + wob];
      };
      const pts = []; for (let i = 0; i <= N; i++) pts.push(pt(i));
      const frac = r.summit ? N : Math.min(N, r.hoursRaw / 10);
      const ci = Math.floor(frac), cf = frac - ci;
      const a = pts[ci], b = pts[Math.min(N, ci + 1)];
      const me = [a[0] + (b[0] - a[0]) * cf, a[1] + (b[1] - a[1]) * cf];
      const line = (arr) => arr.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-hidden': 'true' });
      // far range and mountain body
      s.append(svg('path', { d: 'M0 ' + H + ' L0 150 L60 112 L104 134 L170 84 L228 120 L282 70 L343 104 L343 ' + H + ' Z', fill: 'var(--sunken)', opacity: '.7' }));
      s.append(svg('path', { d: line(pts) + ' L' + x1 + ' ' + H + ' L' + x0 + ' ' + H + ' Z', fill: 'var(--sunken)' }));
      s.append(svg('path', { d: line(pts), fill: 'none', stroke: 'var(--line)', 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-dasharray': '4 4' }));
      const done = pts.slice(0, ci + 1).concat([me]);
      s.append(svg('path', { d: line(done), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      const mid = N % 2 === 0 ? N / 2 : -1;
      pts.forEach((p, i) => {
        const major = i === 0 || i === N || i === mid || (N >= 8 && (i * 8 / N) % 1 === 0);
        const reached = i <= r.camp;
        s.append(svg('circle', { cx: p[0], cy: p[1], r: major ? 3.6 : 2, fill: reached ? 'var(--accent)' : 'var(--surface)', stroke: reached ? 'var(--accent)' : 'var(--muted)', 'stroke-width': major ? 1.5 : 1 }));
      });
      // summit flag
      const sp = pts[N];
      s.append(svg('path', { d: 'M' + sp[0] + ' ' + (sp[1] - 3) + ' V' + (sp[1] - 20) + ' l9 4 l-9 4', fill: 'var(--gold)', stroke: 'var(--gold)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
      const text = (x, y, str, o) => {
        o = o || {};
        const tx = svg('text', { x, y, 'text-anchor': o.anchor || 'middle', fill: o.fill || 'var(--muted)', 'font-size': o.size || 11, 'font-weight': o.bold ? 700 : 500, style: 'font-family:var(--font-body)' });
        tx.textContent = str;
        s.append(tx);
      };
      text(x0 - 4, H - 8, r.names[0], { anchor: 'start' });
      text(x1 + 4, sp[1] - 25, r.names[N], { anchor: 'end', fill: 'var(--gold)', bold: true, size: 12 });
      const nxt = r.nextCamp.index;
      const leftStr = 'あと ' + r.nextCamp.minutesLeft + '分';
      if (mid > 0) {
        const mp = pts[mid];
        text(mp[0], mp[1] + 20, r.names[mid], { fill: r.camp >= mid ? 'var(--accent)' : 'var(--ink)', bold: true });
      }
      if (!r.summit) {
        const np = pts[nxt];
        s.append(svg('circle', { cx: np[0], cy: np[1], r: 7, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }));
      }
      // learner position: halo, dot and a small pennant
      s.append(svg('circle', { cx: me[0], cy: me[1], r: 11, fill: 'var(--accent)', opacity: '.22' }));
      s.append(svg('path', { d: 'M' + me[0] + ' ' + (me[1] - 5) + ' V' + (me[1] - 24) + ' l10 4.5 l-10 4.5', fill: 'var(--accent)', stroke: 'var(--accent)', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
      s.append(svg('circle', { cx: me[0], cy: me[1], r: 5.5, fill: 'var(--accent)', stroke: 'var(--surface)', 'stroke-width': 2 }));
      const cap = C1.el('div', { class: 'row between small engage-mtn-cap', 'aria-hidden': 'true' },
        C1.el('span', { class: 'muted' }, '現在地 ', C1.el('b', { style: { color: 'var(--accent)' } }, r.names[r.camp]), '・' + r.hours + '時間'),
        r.summit ? C1.el('b', { style: { color: 'var(--gold)' } }, '登頂')
          : C1.el('span', { class: 'muted' }, '次 ', C1.el('b', { style: { color: 'var(--ink)' } }, r.names[nxt]), ' ' + leftStr));
      const aria = r.summit
        ? 'C1 山頂に到達しています。累計' + r.hours + '時間。'
        : '現在' + r.names[r.camp] + '（' + r.camp + ' / ' + N + 'キャンプ、' + r.hours + '時間）。次の' + r.names[nxt] + 'まで' + leftStr + '。山頂のC1まであと' + r1(Math.max(0, r.need - r.hoursRaw)) + '時間。';
      return C1.el('div', { class: 'engage-mtn', role: 'img', 'aria-label': aria }, s, cap);
    } catch (e) {
      return C1.el('div', { class: 'engage-mtn' });
    }
  }

  /* ---------- celebration overlay ---------- */
  let showing = false;
  const reduced = () => safe(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, false);
  function burst(canvas) {
    if (reduced()) return;
    try {
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.scale(dpr, dpr);
      const cs = getComputedStyle(document.documentElement);
      const cols = ['--accent', '--gold', '--good', '--accent-soft', '--gold-soft'].map((v) => cs.getPropertyValue(v).trim()).filter(Boolean);
      if (!cols.length) return;
      const ps = [];
      for (let i = 0; i < 90; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1, sp = 5 + Math.random() * 8;
        ps.push({ x: w / 2, y: h * 0.42, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, s: 3 + Math.random() * 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[i % cols.length] });
      }
      const t0 = performance.now();
      const step = (now) => {
        const el = now - t0;
        if (!canvas.isConnected || el > 1700) { ctx.clearRect(0, 0, w, h); return; }
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = Math.max(0, 1 - el / 1700);
        ps.forEach((p) => {
          p.vy += 0.22; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
        });
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    } catch (e) { /* ignore */ }
  }
  function overlay(items, done) {
    if (!hasDoc || !document.body || !items.length) { if (done) done(); return; }
    css();
    showing = true;
    const prev = document.activeElement;
    let i = 0;
    const ov = C1.el('div', { class: 'engage-ov' });
    const back = C1.el('div', { class: 'eg-back' });
    const canvas = C1.el('canvas', { 'aria-hidden': 'true' });
    const kind = C1.el('p', { class: 'label eg-kind' });
    const title = C1.el('h2', { class: 'h1', id: 'engage-ov-title' });
    const text = C1.el('p', { class: 'muted', id: 'engage-ov-text' });
    const btn = C1.el('button', { type: 'button', class: 'btn primary block' }, '続ける');
    const card = C1.el('div', { class: 'card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'engage-ov-title', 'aria-describedby': 'engage-ov-text' }, kind, title, text, btn);
    ov.append(back, canvas, card);
    const KIND = { goal: '今日の目標', menu: '今日のメニュー', camp: 'ルート', badge: 'バッジ', ticket: 'お休み券' };
    const fill = () => {
      const it = items[i];
      kind.textContent = KIND[it.kind] || '達成';
      title.textContent = it.title || '';
      text.textContent = it.text || '';
      btn.textContent = i < items.length - 1 ? '続ける（' + (i + 1) + ' / ' + items.length + '）' : '続ける';
      burst(canvas);
      btn.focus();
    };
    const close = () => {
      document.removeEventListener('keydown', onKey, true);
      ov.remove();
      showing = false;
      try { if (prev && prev.focus && prev.isConnected) prev.focus(); } catch (e) { /* ignore */ }
      if (done) done();
    };
    const next = () => { i++; if (i < items.length) fill(); else close(); };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); next(); }
      else if (e.key === 'Tab') { e.preventDefault(); btn.focus(); }
    };
    btn.addEventListener('click', next);
    back.addEventListener('click', next);
    ov.addEventListener('click', (e) => { if (e.target === ov) next(); });
    document.addEventListener('keydown', onKey, true);
    document.body.append(ov);
    fill();
  }
  function showPending() {
    if (showing || !hasDoc) return;
    const items = pending();
    if (!items.length) return;
    set('pending', []);
    overlay(items);
  }
  function celebrate(item) {
    if (!item || showing) return;
    overlay([{ kind: item.kind || '', title: item.title || '', text: item.text || '' }]);
  }

  /* ---------- init ---------- */
  function init() {
    if (inited) { renderTop(); return; }
    inited = true;
    try {
      css();
      // settle rest tickets only once Shadowing Coach minutes are known, so a day kept there is never paid with a ticket
      const settleNow = () => {
        if (settled) return;
        settled = true;
        try {
          const firstRun = !get('seen', false);
          const used = check(firstRun);
          set('seen', true);
          snap = snapshot();
          if (used > 0) safe(() => C1.toast('お休み券を' + used + '枚使いました。連続' + streakDays() + '日は続いています'));
        } catch (e) { /* never block start */ }
        renderTop();
        fire();
      };
      if (C1.radio && typeof C1.radio.ready === 'function') {
        safe(() => C1.radio.ready().then(settleNow, settleNow));
        setTimeout(settleNow, 7000);
      } else settleNow();
      if (hasDoc) {
        document.addEventListener('c1:log', onLog);
        document.addEventListener('c1:engage', renderTop);
        document.addEventListener('c1:radio', fire);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState !== 'visible' || !settled) return;
          try { if (get('settled', '') < addDays(todayKey(), -1)) { check(false); snap = snapshot(); fire(); } } catch (e) { /* ignore */ }
        });
      }
    } catch (e) { /* never block start */ }
    renderTop();
    fire();
  }

  /* every public function is guarded: a failure returns a harmless default instead of throwing */
  const guard = (fn, d) => function () { try { return fn.apply(null, arguments); } catch (e) { return typeof d === 'function' ? d() : d; } };
  const emptyEl = () => (hasDoc ? document.createElement('div') : null);
  C1.engage = {
    init: guard(init), goal: guard(goal, 15), setGoal: guard(setGoal), todayMinutes: guard(todayMinutes, 0),
    streak: guard(streak, () => ({ days: 0, keptToday: false, tickets: 0, frozen: [], best: 0 })),
    week: guard(week, () => ({ days: [], minutes: 0, lastWeekMinutes: 0, keptDays: 0 })),
    menu: guard(menu, () => []), nextStep: guard(nextStep, null), nextCard: guard(nextCard, emptyEl),
    route: guard(route, () => ({ level: 'B1', need: 400, hours: 0, camps: 40, camp: 0, nextCamp: { index: 1, name: '第1キャンプ', minutesLeft: 600, pct: 0 }, summit: false, names: [] })),
    projection: guard(projection, () => ({ avg7: 0, etaAtAvg: null, etaAtGoal: '' })),
    stats: guard(stats, () => ({ vocab: null, listen: null, speak: null, write: null, grammar: null })),
    badges: guard(badges, () => []), profile: guard(profile, () => ({ why: '', when: '', onboarded: false })),
    setProfile: guard(setProfile), daily: guard(daily, () => ({ phrase: null, challenge: Object.assign({}, CHALLENGES[0], { done: false }) })),
    setChallengeDone: guard(setChallengeDone), pending: guard(pending, () => []), showPending: guard(showPending),
    celebrate: guard(celebrate), mountain: guard(mountain, emptyEl), ring: guard(ring, emptyEl),
  };
})();
