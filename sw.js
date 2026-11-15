// オフラインでも開けるよう、アプリ本体をキャッシュする(ネット優先・つながらなければキャッシュ)
// v2: C1 Climb(./climb/)も一緒にキャッシュする
const CACHE = 'shadowing-coach-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
const CLIMB = ['index.html', 'core.js', 'radio.js', 'engage.js', 'home.js', 'vocab.js', 'vocab-data.js', 'listen.js', 'listen-data.js',
  'speak.js', 'speak-data.js', 'write.js', 'write-data.js', 'grammar.js', 'grammar-data.js'].map(f => './climb/' + f);
const CLIMB_PAGE = './climb/index.html';

self.addEventListener('install', e => {
  // 1つずつキャッシュする。どれか1つが取れなくても、インストール全体は失敗させない
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([...ASSETS, ...CLIMB].map(u =>
    c.add(new Request(u, { cache: 'reload' })).catch(() => {})))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // 古い版(shadowing-coach-v1 など)だけを消す。同じドメインの他のアプリのキャッシュには触らない
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('shadowing-coach-') && k !== CACHE).map(k => caches.delete(k))))
    .catch(() => {})
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  const network = fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
    return res;
  });
  network.catch(() => {}); // タイムアウトで先に進んだ後の失敗を未処理にしない
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
  // 画面そのもの(ナビゲーション)が見つからないときは、その画面のトップに戻す。climb/ の中なら C1 Climb、それ以外は Shadowing Coach
  const page = e.request.mode === 'navigate'
    ? (/\/climb(\/|$)/.test(url.pathname) ? CLIMB_PAGE : './index.html') : null;
  e.respondWith(Promise.race([network, timeout]).catch(() =>
    caches.match(e.request, { ignoreSearch: true })
      .then(r => r || (page ? caches.match(page) : null))
      .then(r => r || network)));
});
