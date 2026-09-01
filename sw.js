const STATIC_CACHE = 'orlando-flow-static-v41-4-3-final';
const RUNTIME_CACHE = 'orlando-flow-runtime-v41-4-3-final';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './data/sample-itinerary.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/apple-touch-icon-152.png',
  './icons/apple-touch-icon-167.png',
  './icons/apple-touch-icon-180.png',
  './icons/apple-touch-icon-precomposed.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png',
  './icons/favicon.ico',
  './icons/hollywood-studios-reference-clean.png',
  './icons/animal-kingdom-reference-clean.png',
  './icons/universal-studios-globe-clean.png',
  './icons/islands-of-adventure-hp-clean.png',
  './icons/epic-universe-reference-clean.png'
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
  const isVolatileDecisionApi = url.hostname === 'api.themeparks.wiki' || url.hostname === 'api.open-meteo.com';
  const isAuxApi = url.hostname === 'orlando-flow-history.kaue-person9.workers.dev';
  const isHistoryGuardNetworkOnly = isAuxApi && (url.pathname.startsWith('/api/v4.2.1/') || url.pathname.startsWith('/api/v4.2.3/') || url.pathname.startsWith('/api/v4.2.4/') || url.pathname.startsWith('/api/v4.2.5/'));
  if (isVolatileDecisionApi || isHistoryGuardNetworkOnly) {
    // Filas/clima e o histórico decisório continuam network-only.
    event.respondWith(networkOnly(req));
  } else if (isAuxApi) {
    event.respondWith(networkFirst(req));
  } else if (url.origin === self.location.origin && req.mode === 'navigate') {
    // HTML de navegação deve preferir a versão atual da rede; evita '/' preso
    // em uma cópia antiga enquanto /index.html já foi atualizado.
    event.respondWith(navigationNetworkFirst(req));
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
  }
});

async function navigationNetworkFirst(req) {
  const runtime = await caches.open(RUNTIME_CACHE);
  try {
    const res = await fetch(req, { cache:'no-store' });
    if (res.ok) runtime.put(req, res.clone());
    return res;
  } catch {
    const runtimeCached = await runtime.match(req);
    if (runtimeCached) return runtimeCached;
    const exactCached = await caches.match(req);
    if (exactCached) return exactCached;
    const indexCached = await caches.match('./index.html');
    if (indexCached) return indexCached;
    throw new Error('Offline and no cached navigation response');
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res.ok) (await caches.open(STATIC_CACHE)).put(req,res.clone());
  return res;
}

async function networkOnly(req) {
  return fetch(req, { cache:'no-store' });
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

// v41.1 — entrega confiável do Copiloto Proativo.
// O app persiste a fila/ledger. O Service Worker é o transporte local e já
// aceita o mesmo envelope que poderá ser enviado por Web Push no futuro.
const PROACTIVE_PUSH_SCHEMA_V411='orlando-flow-proactive-alert-v1';

self.addEventListener('push', event => {
  let payload=null;try{payload=event.data?.json?.()||null;}catch{}
  if(!payload||payload.schema!==PROACTIVE_PUSH_SCHEMA_V411||!payload.title)return;
  const deliveryId=payload.deliveryId||null,alertKey=payload.key||null,target=payload.url||'./?view=live';
  event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body||'',icon:'./icons/icon-192.png',tag:`orlando-flow-${alertKey||deliveryId||'proactive'}`,renotify:false,data:{url:target,type:payload.type||null,deliveryId,alertKey,schema:payload.schema}}));
});

self.addEventListener('notificationclick', event => {
  const data=event.notification?.data||{},deliveryId=data.deliveryId||null,alertKey=data.alertKey||null;
  event.notification.close();
  const rawTarget=data.url||'./?view=live';
  const joiner=rawTarget.includes('?')?'&':'?';
  const target=deliveryId&&!rawTarget.includes('delivery=')?`${rawTarget}${joiner}delivery=${encodeURIComponent(deliveryId)}`:rawTarget;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async list => {
    const existing=list.find(client=>client.url.includes(self.location.origin));
    if(existing){await existing.focus();try{existing.postMessage({type:'ORLANDO_FLOW_NOTIFICATION_OPEN',deliveryId,alertKey});}catch{}return existing;}
    return clients.openWindow(target);
  }));
});

self.addEventListener('notificationclose', event => {
  const data=event.notification?.data||{},deliveryId=data.deliveryId||null,alertKey=data.alertKey||null;if(!deliveryId)return;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>Promise.all(list.map(client=>{try{return client.postMessage({type:'ORLANDO_FLOW_NOTIFICATION_DISMISSED',deliveryId,alertKey});}catch{return null;}}))));
});
