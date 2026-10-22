import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Lesson content is split into a few large JSON chunks; precache them for offline use.
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  // App shells, so every screen opens offline from the home-screen app.
  additionalPrecacheEntries: ["/", "/lesson", "/review", "/practice", "/practice/run", "/dictionary", "/profile", "/credits"].map(
    (url) => ({ url, revision: process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now()) }),
  ),
});

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets the emulator-backed sync tests build alongside the normal build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    if (!projectId) return [];
    // Serves Firebase's sign-in helper from this domain so redirect sign-in works
    // in Safari / iOS home-screen apps (third-party storage is blocked there).
    return [{ source: "/__/auth/:path*", destination: `https://${projectId}.firebaseapp.com/__/auth/:path*` }];
  },
};

export default withSerwist(nextConfig);
