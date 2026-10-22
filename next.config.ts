import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1";

// The emulator switch points sign-in and data traffic at localhost. It exists only for the
// test builds (`npm run test:sync` sets ALLOW_EMULATOR_BUILD), so refuse it in production.
if (process.env.NODE_ENV === "production" && useEmulator && process.env.ALLOW_EMULATOR_BUILD !== "1") {
  throw new Error("NEXT_PUBLIC_FIREBASE_EMULATOR=1 is only for tests. Refusing to build for production.");
}

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: isDev,
  // Lesson content is split into a few large JSON chunks; precache them for offline use.
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

/** Limits scripts and connections to this app plus the Firebase and Google hosts it uses. */
function contentSecurityPolicy(): string {
  const emulator = useEmulator ? " http://127.0.0.1:* ws://127.0.0.1:*" : "";
  const directives: Record<string, string> = {
    "default-src": "'self'",
    // Next.js inlines its bootstrap scripts, so 'unsafe-inline' stays; nonces would force dynamic rendering.
    "script-src": `'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
    "style-src": "'self' 'unsafe-inline'",
    "img-src": "'self' data: blob: https://*.googleusercontent.com",
    "font-src": "'self' data:",
    "media-src": "'self'",
    "connect-src": `'self' https://*.googleapis.com https://*.firebaseapp.com https://www.google.com/recaptcha/${emulator}`,
    "frame-src": "'self' https://accounts.google.com https://*.firebaseapp.com https://www.google.com/recaptcha/ https://recaptcha.google.com",
    "worker-src": "'self'",
    "manifest-src": "'self'",
    "object-src": "'none'",
    "base-uri": "'self'",
    "form-action": "'self' https://accounts.google.com",
    "frame-ancestors": "'none'",
  };
  return Object.entries(directives)
    .map(([name, value]) => `${name} ${value}`)
    .join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // Popup sign-in talks to its popup window, so this is same-origin-allow-popups rather than same-origin.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets the emulator-backed sync tests build alongside the normal build.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    if (!projectId) return [];
    // Serves Firebase's sign-in helper from this domain so redirect sign-in works
    // in Safari / iOS home-screen apps (third-party storage is blocked there).
    return [{ source: "/__/auth/:path*", destination: `https://${projectId}.firebaseapp.com/__/auth/:path*` }];
  },
};

export default withSerwist(nextConfig);
