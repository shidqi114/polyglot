"use client";

import { deleteUser, onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  increment,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import { create } from "zustand";
import { completeRedirectSignIn, getFirebase, signOut } from "./firebase";
import type { SrsCard } from "./srs";
import { useProgress, type DayStats, type LessonProgress, type Pending, type Settings } from "@/store/progress";

export type SyncStatus = "off" | "idle" | "syncing" | "offline" | "error";

interface AuthState {
  user: Pick<User, "uid" | "displayName" | "email" | "photoURL"> | null;
  ready: boolean;
  status: SyncStatus;
  lastSync: number;
}

export const useAuth = create<AuthState>(() => ({ user: null, ready: false, status: "off", lastSync: 0 }));

const BATCH_LIMIT = 450;
let started = false;
let currentUid: string | null = null;
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let busy: Promise<void> = Promise.resolve();

/** Serialises sync work so flushes and pulls never interleave. */
function enqueue(task: () => Promise<void>): Promise<void> {
  busy = busy.then(task, task);
  return busy;
}

function hasPending(p: Pending): boolean {
  return (
    p.settings ||
    Object.keys(p.days).length > 0 ||
    Object.keys(p.lessons).length > 0 ||
    Object.keys(p.cards).length > 0
  );
}

async function flush(db: Firestore, uid: string): Promise<void> {
  const state = useProgress.getState();
  const snapshot = state.pending;
  if (!hasPending(snapshot)) return;

  const ops: ((b: ReturnType<typeof writeBatch>) => void)[] = [];
  const base = `users/${uid}`;
  if (snapshot.settings) {
    ops.push((b) =>
      b.set(doc(db, base), { settings: state.settings, settingsUp: state.settingsUp, srv: serverTimestamp() }, { merge: true }),
    );
  }
  for (const [day, d] of Object.entries(snapshot.days)) {
    ops.push((b) =>
      b.set(
        doc(db, `${base}/days/${day}`),
        { xp: increment(d.xp), lessons: increment(d.lessons), reviews: increment(d.reviews), srv: serverTimestamp() },
        { merge: true },
      ),
    );
  }
  for (const [id, times] of Object.entries(snapshot.lessons)) {
    const l = state.lessons[id];
    if (!l) continue;
    ops.push((b) =>
      b.set(
        doc(db, `${base}/lessons/${id}`),
        { done: l.done, best: l.best, times: increment(times), up: l.up, srv: serverTimestamp() },
        { merge: true },
      ),
    );
  }
  for (const id of Object.keys(snapshot.cards)) {
    const c = state.cards[id];
    if (!c) continue;
    ops.push((b) => b.set(doc(db, `${base}/cards/${id}`), { ...c, srv: serverTimestamp() }));
  }

  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    ops.slice(i, i + BATCH_LIMIT).forEach((op) => op(batch));
    await batch.commit();
  }
  useProgress.getState().clearPending(snapshot);
}

type WithSrv<T> = T & { srv?: Timestamp };

async function pull(db: Firestore, uid: string): Promise<void> {
  const since = Timestamp.fromMillis(useProgress.getState().lastPull);
  const sub = (name: string) =>
    getDocsFromServer(query(collection(db, `users/${uid}/${name}`), where("srv", ">", since)));
  const [profile, days, lessons, cards] = await Promise.all([
    getDocFromServer(doc(db, `users/${uid}`)),
    sub("days"),
    sub("lessons"),
    sub("cards"),
  ]);

  const s = useProgress.getState();
  let maxSrv = s.lastPull;
  const seen = (srv?: Timestamp) => {
    if (srv) maxSrv = Math.max(maxSrv, srv.toMillis());
  };

  const nextDays = { ...s.days };
  days.forEach((d) => {
    const r = d.data() as WithSrv<DayStats>;
    seen(r.srv);
    const p = s.pending.days[d.id];
    nextDays[d.id] = {
      xp: (r.xp ?? 0) + (p?.xp ?? 0),
      lessons: (r.lessons ?? 0) + (p?.lessons ?? 0),
      reviews: (r.reviews ?? 0) + (p?.reviews ?? 0),
    };
  });

  const nextLessons = { ...s.lessons };
  lessons.forEach((d) => {
    const r = d.data() as WithSrv<LessonProgress>;
    seen(r.srv);
    const local = s.lessons[d.id];
    nextLessons[d.id] = {
      done: Math.min(r.done ?? Infinity, local?.done ?? Infinity),
      best: Math.max(r.best ?? 0, local?.best ?? 0),
      times: (r.times ?? 0) + (s.pending.lessons[d.id] ?? 0),
      up: Math.max(r.up ?? 0, local?.up ?? 0),
    };
  });

  const nextCards = { ...s.cards };
  cards.forEach((d) => {
    const { srv, ...card } = d.data() as WithSrv<SrsCard>;
    seen(srv);
    const local = s.cards[d.id];
    if (s.pending.cards[d.id] && local) return; // local edit wins until it's flushed
    if (!local || card.up >= local.up) nextCards[d.id] = card;
  });

  let settings = s.settings;
  let settingsUp = s.settingsUp;
  if (profile.exists()) {
    const r = profile.data() as { settings?: Settings; settingsUp?: number };
    if (r.settings && (r.settingsUp ?? 0) > s.settingsUp && !s.pending.settings) {
      settings = { ...s.settings, ...r.settings };
      settingsUp = r.settingsUp ?? 0;
    }
  }

  useProgress.getState().setData({
    days: nextDays,
    lessons: nextLessons,
    cards: nextCards,
    settings,
    settingsUp,
    lastPull: maxSrv,
  });
}

function isOffline(err: unknown): boolean {
  const code = (err as { code?: string }).code;
  return code === "unavailable" || (typeof navigator !== "undefined" && !navigator.onLine);
}

export function syncNow(): Promise<void> {
  const fb = getFirebase();
  const uid = currentUid;
  if (!fb || !uid) return Promise.resolve();
  return enqueue(async () => {
    if (uid !== currentUid) return;
    useAuth.setState({ status: "syncing" });
    try {
      await flush(fb.db, uid);
      await pull(fb.db, uid);
      useAuth.setState({ status: "idle", lastSync: Date.now() });
    } catch (err) {
      console.warn("Sync failed", err);
      useAuth.setState({ status: isOffline(err) ? "offline" : "error" });
    }
  });
}

function scheduleFlush() {
  if (!currentUid) return;
  clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    const fb = getFirebase();
    const uid = currentUid;
    if (!fb || !uid) return;
    void enqueue(async () => {
      if (uid !== currentUid) return;
      try {
        await flush(fb.db, uid);
        useAuth.setState({ status: "idle", lastSync: Date.now() });
      } catch (err) {
        useAuth.setState({ status: isOffline(err) ? "offline" : "error" });
      }
    });
  }, 1500);
}

/** Turns all local guest progress into pending writes so it merges into the account. */
function adoptGuestData(uid: string) {
  const s = useProgress.getState();
  const cards: Record<string, number> = {};
  for (const [id, c] of Object.entries(s.cards)) cards[id] = c.up;
  const lessons: Record<string, number> = {};
  for (const [id, l] of Object.entries(s.lessons)) lessons[id] = l.times;
  s.setData({
    ownerUid: uid,
    lastPull: 0,
    pending: { days: { ...s.days }, lessons, cards, settings: s.settingsUp > 0 },
  });
}

const CLOUD_COLLECTIONS = ["days", "lessons", "cards", "notes"] as const;

/** Removes every progress document of this account. The local copy is untouched until the caller resets it. */
async function wipeCloudProgress(db: Firestore, uid: string): Promise<void> {
  for (const name of CLOUD_COLLECTIONS) {
    const snap = await getDocsFromServer(collection(db, `users/${uid}/${name}`));
    for (let i = 0; i < snap.docs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      for (const d of snap.docs.slice(i, i + BATCH_LIMIT)) batch.delete(d.ref);
      await batch.commit();
    }
  }
  await deleteDoc(doc(db, `users/${uid}`));
}

/** Deletes this account's cloud progress, then signs this device out and clears its local progress. */
export async function deleteCloudData(): Promise<void> {
  const fb = getFirebase();
  const uid = currentUid;
  if (!fb || !uid) throw new Error("Sign in first.");
  await enqueue(() => wipeCloudProgress(fb.db, uid));
  await signOut();
  useProgress.getState().reset(null);
}

/**
 * Deletes the cloud progress and the account. Firebase requires a recent sign-in for this, so if it
 * answers auth/requires-recent-login the user signs in again and presses the button once more.
 */
export async function deleteAccount(): Promise<void> {
  const fb = getFirebase();
  const uid = currentUid;
  const user = fb?.auth.currentUser;
  if (!fb || !uid || !user) throw new Error("Sign in first.");
  await enqueue(() => wipeCloudProgress(fb.db, uid));
  await deleteUser(user);
  useProgress.getState().reset(null);
}

export function startSync(): void {
  if (started) return;
  started = true;
  const fb = getFirebase();
  if (!fb) {
    useAuth.setState({ ready: true, status: "off" });
    return;
  }
  void completeRedirectSignIn();

  onAuthStateChanged(fb.auth, (user) => {
    const s = useProgress.getState();
    if (user) {
      useAuth.setState({
        user: { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL },
        ready: true,
      });
      if (s.ownerUid === null) adoptGuestData(user.uid);
      else if (s.ownerUid !== user.uid) s.reset(user.uid);
      currentUid = user.uid;
      void syncNow();
    } else {
      currentUid = null;
      clearTimeout(flushTimer);
      useAuth.setState({ user: null, ready: true, status: "off" });
      // Signing out leaves this device as a fresh guest; the account keeps its data.
      if (s.ownerUid !== null) s.reset(null);
    }
  });

  useProgress.subscribe((state, prev) => {
    if (state.pending !== prev.pending && hasPending(state.pending)) scheduleFlush();
  });

  let lastFocusSync = 0;
  const onResume = () => {
    if (document.visibilityState !== "visible" || Date.now() - lastFocusSync < 30_000) return;
    lastFocusSync = Date.now();
    void syncNow();
  };
  document.addEventListener("visibilitychange", onResume);
  window.addEventListener("online", () => void syncNow());
}
