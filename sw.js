const STATIC_CACHE = 'orlando-flow-static-v20';
const RUNTIME_CACHE = 'orlando-flow-runtime-v20';
const STATIC_ASSETS = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest', './data/sample-itinerary.json', './icons/icon-192.png', './icons/icon-512.png', './icons/hollywood-studios-reference-clean.png', './icons/animal-kingdom-reference-clean.png', './icons/universal-studios-reference-clean.png', './icons/islands-of-adventure-reference-clean.png', './icons/epic-universe-reference-clean.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>![STATIC_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isLiveApi = url.hostname === 'api.themeparks.wiki' || url.hostname === 'api.open-meteo.com';
  if (isLiveApi) {
    event.respondWith(networkFirst(req));
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) (await caches.open(STATIC_CACHE)).put(req,res.clone());
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req,res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    throw new Error('Offline and no cached response');
  }
}
