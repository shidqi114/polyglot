"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import {
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  signInWithCredential,
  signInWithPopup,
  connectAuthEmulator,
  signInWithRedirect,
  signOut as fbSignOut,
  browserPopupRedirectResolver,
  type Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function getFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (!firebaseConfigured || typeof window === "undefined") return null;
  if (!app) {
    const existing = getApps().length > 0;
    app = existing ? getApp() : initializeApp({ ...config, authDomain: config.authDomain || `${config.projectId}.firebaseapp.com` });
    // App Check adds a token to every request, so copied config alone cannot read or write data.
    // Active only when a reCAPTCHA v3 site key is configured (enforce it in the Firebase console).
    const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (recaptchaKey && process.env.NEXT_PUBLIC_FIREBASE_EMULATOR !== "1") {
      initializeAppCheck(app, { provider: new ReCaptchaV3Provider(recaptchaKey), isTokenAutoRefreshEnabled: true });
    }
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
    try {
      db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
    } catch {
      db = getFirestore(app);
    }
    if (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1") connectEmulators(auth, db);
  }
  return { app: app!, auth: auth!, db: db! };
}

/** Local emulators for end-to-end tests (never enabled in production builds). */
function connectEmulators(a: Auth, d: Firestore) {
  connectAuthEmulator(a, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(d, "127.0.0.1", 8080);
  // The auth emulator accepts unsigned Google credentials, which lets tests sign in without a popup.
  (window as unknown as Record<string, unknown>).__polyglotTestSignIn = (sub: string, email: string) =>
    signInWithCredential(a, GoogleAuthProvider.credential(JSON.stringify({ sub, email, email_verified: true })));
}

/** Home-screen web apps on iOS can't open popups, so they use a redirect instead. */
function preferRedirect(): boolean {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return standalone || ios;
}

export async function signInWithGoogle(): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error("Firebase is not configured");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  if (preferRedirect()) return signInWithRedirect(fb.auth, provider);
  try {
    await signInWithPopup(fb.auth, provider);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(fb.auth, provider);
    } else if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
      throw err;
    }
  }
}

export async function completeRedirectSignIn(): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  try {
    await getRedirectResult(fb.auth);
  } catch (err) {
    console.warn("Redirect sign-in failed", err);
  }
}

export async function signOut(): Promise<void> {
  const fb = getFirebase();
  if (fb) await fbSignOut(fb.auth);
}
