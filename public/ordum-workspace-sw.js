/* global self, caches, fetch, Request, Response, URL */

const CACHE_PREFIX =
  "ordum-workspace-shell-";
const CACHE_NAME =
  `${CACHE_PREFIX}v1`;
const OFFLINE_FALLBACK_URL =
  "/pwa/workspace/offline.html";

const PRECACHE_URLS = [
  OFFLINE_FALLBACK_URL,
  "/pwa/workspace/icon-192.png",
  "/pwa/workspace/icon-512.png",
  "/pwa/workspace/maskable-512.png",
  "/pwa/workspace/apple-touch-icon.png",
];

const PRECACHE_PATHS =
  new Set(
    PRECACHE_URLS
  );

async function precacheWorkspaceShell() {
  const cache =
    await caches.open(
      CACHE_NAME
    );

  await cache.addAll(
    PRECACHE_URLS
  );
}

async function removeOldWorkspaceCaches() {
  const cacheNames =
    await caches.keys();

  await Promise.all(
    cacheNames
      .filter(
        (cacheName) =>
          cacheName.startsWith(
            CACHE_PREFIX
          ) &&
          cacheName !==
            CACHE_NAME
      )
      .map(
        (cacheName) =>
          caches.delete(
            cacheName
          )
      )
  );
}

self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      precacheWorkspaceShell()
    );

    self.skipWaiting();
  }
);

self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      Promise.all([
        removeOldWorkspaceCaches(),
        self.clients.claim(),
      ])
    );
  }
);

self.addEventListener(
  "fetch",
  (event) => {
    const {
      request,
    } = event;

    if (
      request.method !==
      "GET"
    ) {
      return;
    }

    const url =
      new URL(
        request.url
      );

    if (
      url.origin !==
      self.location.origin
    ) {
      return;
    }

    const {
      pathname,
    } = url;

    if (
      request.mode ===
        "navigate" &&
      pathname.startsWith(
        "/workspace"
      )
    ) {
      event.respondWith(
        fetch(
          new Request(
            request,
            {
              cache:
                "no-store",
            }
          )
        ).catch(
          async () =>
            (
              await caches.match(
                OFFLINE_FALLBACK_URL
              )
            ) ??
            Response.error()
        )
      );

      return;
    }

    if (
      PRECACHE_PATHS.has(
        pathname
      )
    ) {
      event.respondWith(
        caches.match(
          request
        ).then(
          (cachedResponse) =>
            cachedResponse ??
            fetch(request)
        )
      );
    }
  }
);

self.addEventListener(
  "message",
  (event) => {
    if (
      event.data?.type !==
      "ORDUM_WORKSPACE_REFRESH_SHELL"
    ) {
      return;
    }

    event.waitUntil(
      caches
        .delete(
          CACHE_NAME
        )
        .then(
          () =>
            precacheWorkspaceShell()
        )
    );
  }
);
