/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

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
    ...defaultCache,
  ],
  fallbacks: {
    entries: [{ url: "/", matcher: ({ request }) => request.destination === "document" }],
  },
});

// Earlier versions cached cross-origin responses, which can include sign-in traffic. Drop that cache.
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.delete("cross-origin"));
});

serwist.addEventListeners();
