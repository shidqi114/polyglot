/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, NetworkOnly, Serwist } from "serwist";
import { PACK_CACHE } from "@/content/packs";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Sign-in and sync traffic can carry account data, so it is never stored in Cache Storage.
const PRIVATE_HOSTS = /(^|\.)(googleapis\.com|firebaseapp\.com|firebaseio\.com|google\.com|gstatic\.com)$/;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Firebase auth handler pages must always hit the network.
    { matcher: ({ url }) => url.pathname.startsWith("/__/"), handler: new NetworkOnly() },
    { matcher: ({ url }) => PRIVATE_HOSTS.test(url.hostname), handler: new NetworkOnly() },
    // Knowledge packs are versioned by path, so a cached copy never goes stale; they stay until the user clears them.
    { matcher: ({ url }) => url.pathname.startsWith("/packs/"), handler: new CacheFirst({ cacheName: PACK_CACHE }) },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [{ url: "/", matcher: ({ request }) => request.destination === "document" }],
  },
});

// Earlier versions cached cross-origin responses, which can include sign-in traffic, and used older pack versions.
// Drop those caches; the current pack cache is kept.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await caches.delete("cross-origin");
      for (const name of await caches.keys()) {
        if (name.startsWith("knowledge-packs-") && name !== PACK_CACHE) await caches.delete(name);
      }
    })(),
  );
});

serwist.addEventListeners();
