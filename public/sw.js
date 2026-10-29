const CACHE_NAME = "missao-fronteiras-offline-v6";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/icons/favicon-32.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/assets/heroes/lucas.jpg",
  "/assets/heroes/sofia.jpg",
  "/assets/heroes/davi.jpg",
  "/assets/heroes/ester.jpg",
  "/assets/npcs/caua.jpg",
  "/assets/npcs/tariq.jpg",
  "/assets/npcs/hina.jpg",
  "/assets/npcs/samora.jpg",
  "/assets/maps/amazonia.jpg",
  "/assets/maps/janela1040.jpg",
  "/assets/maps/toquio.jpg",
  "/assets/maps/mocambique.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: "reload" }))
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      );
      await self.clients.claim();
    })()
  );
});

// Allow client page to send currently loaded /_next/static JS/CSS/font bundles for immediate Visit #1 offline readiness
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_RUNTIME_URLS") {
    const urls = Array.isArray(event.data.urls) ? event.data.urls : [];
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        await Promise.allSettled(
          urls.map(async (url) => {
            const existing = await cache.match(url);
            if (!existing) {
              const res = await fetch(url);
              if (res && res.ok) {
                await cache.put(url, res);
              }
            }
          })
        );
        if (event.source && "postMessage" in event.source) {
          event.source.postMessage({ type: "OFFLINE_READY" });
        }
      })()
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js dev HMR / Turbopack live streams
  if (
    url.pathname.startsWith("/_next/webpack-hmr") ||
    url.pathname.includes("turbopack-hmr") ||
    request.headers.get("accept") === "text/event-stream"
  ) {
    return;
  }

  // 1. HTML Page Navigations -> Network-First, fallback to cached "/" App Shell
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put("/", networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cachedPage =
            (await cache.match(request)) || (await cache.match("/"));
          if (cachedPage) return cachedPage;
          return new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // 2. Static Game Assets (3D Images, Icons, Next Static JS/CSS/Fonts) -> Cache-First with network fill
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const res = await fetch(request);
          if (res && res.ok) {
            cache.put(request, res.clone());
          }
          return res;
        } catch {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // 3. All other same-origin GET requests -> Network-First with Cache fallback
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const res = await fetch(request);
        if (res && res.ok) {
          cache.put(request, res.clone());
        }
        return res;
      } catch {
        const cached = await cache.match(request);
        return cached || Response.error();
      }
    })()
  );
});
