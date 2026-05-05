// ============================================================
// SERVICE WORKER — MicroERP PWA
// Estratégia:
//   • Cache-first  → assets estáticos (_next/static/*, *.png, *.svg, *.ico, *.woff2)
//   • Network-first → páginas da aplicação (/dashboard, /boletos, etc.)
//   • Passthrough   → API calls (/api/*) — nunca cacheia dados financeiros
// ============================================================

const CACHE_VERSION = 'v1';
const STATIC_CACHE  = `microerp-static-${CACHE_VERSION}`;
const PAGE_CACHE    = `microerp-pages-${CACHE_VERSION}`;

// Assets para pré-cachear no install
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/login',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
];

// ── Install: pré-cache dos assets principais ─────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_ASSETS).catch(() => {
        // ignora falhas de pré-cache individualmente
      })
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: limpa caches antigos ───────────────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, PAGE_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !validCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: estratégia por tipo de recurso ────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-HTTP e de outras origens
  if (!request.url.startsWith('http') || url.origin !== location.origin) return;

  // API calls → passthrough (sem cache de dados financeiros)
  if (url.pathname.startsWith('/api/')) return;

  // Assets estáticos do Next.js → cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff|woff2|ttf|css|js)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Páginas da aplicação → network-first com fallback offline
  event.respondWith(networkFirst(request, PAGE_CACHE));
});

// ── Cache-first: serve do cache, atualiza em background ──────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Asset indisponível offline', { status: 503 });
  }
}

// ── Network-first: tenta rede, cai para cache se offline ─────
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback para página offline ou login
    const offlineFallback = await caches.match('/login');
    return offlineFallback || new Response(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>MicroERP — Offline</title>
      <style>
        body{font-family:system-ui,sans-serif;display:flex;align-items:center;
             justify-content:center;min-height:100vh;margin:0;
             background:#0a0a0a;color:#fff;text-align:center}
        .icon{font-size:64px;margin-bottom:24px}
        h1{font-size:24px;margin-bottom:12px}
        p{color:#888;max-width:300px}
      </style></head>
      <body>
        <div>
          <div class="icon">📡</div>
          <h1>Sem conexão</h1>
          <p>Verifique sua internet e tente novamente.</p>
        </div>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 }
    );
  }
}
