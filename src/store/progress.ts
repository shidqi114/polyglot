"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { computeStreak, dayKey } from "@/lib/dates";
import { reviewCard, type SrsCard } from "@/lib/srs";

export interface LessonProgress {
  done: number; // first completion (ms)
  best: number; // best accuracy 0–1
  times: number;
  up: number;
}

export interface DayStats {
  xp: number;
  lessons: number;
  reviews: number;
}

export interface Settings {
  dailyGoal: number;
  theme: "system" | "light" | "dark";
  sound: boolean;
  autoplayAudio: boolean;
  ttsRate: number;
  showReadings: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoal: 20,
  theme: "system",
  sound: true,
  autoplayAudio: true,
  ttsRate: 0.9,
  showReadings: true,
};

/** Local changes not yet written to Firestore. */
export interface Pending {
  days: Record<string, DayStats>;
  lessons: Record<string, number>; // completions delta
  cards: Record<string, number>; // change marker from stamp()
  settings: boolean;
}

let lastStamp = 0;
/** Strictly increasing marker, so two edits in the same millisecond are still distinguishable. */
function stamp(): number {
  lastStamp = Math.max(Date.now(), lastStamp + 1);
  return lastStamp;
}

const emptyPending = (): Pending => ({ days: {}, lessons: {}, cards: {}, settings: false });

export interface ProgressData {
  ownerUid: string | null;
  lessons: Record<string, LessonProgress>;
  cards: Record<string, SrsCard>;
  days: Record<string, DayStats>;
  settings: Settings;
  settingsUp: number;
  lastPull: number;
  pending: Pending;
}

interface ProgressActions {
  completeLesson(lessonId: string, accuracy: number, xp: number, results: { itemId: string; correct: boolean }[]): void;
  recordReview(itemId: string, correct: boolean): void;
  addXp(xp: number): void;
  updateSettings(patch: Partial<Settings>): void;
  /** Bulk replace, used by sync and import. */
  setData(patch: Partial<ProgressData>): void;
  clearPending(snapshot: Pending): void;
  reset(ownerUid?: string | null): void;
}

export type ProgressState = ProgressData & ProgressActions;

const initialData = (): ProgressData => ({
  ownerUid: null,
  lessons: {},
  cards: {},
  days: {},
  settings: DEFAULT_SETTINGS,
  settingsUp: 0,
  lastPull: 0,
  pending: emptyPending(),
});

function bumpDay(s: ProgressData, delta: Partial<DayStats>): Pick<ProgressData, "days" | "pending"> {
  const key = dayKey();
  const add = (base: DayStats | undefined): DayStats => ({
    xp: (base?.xp ?? 0) + (delta.xp ?? 0),
    lessons: (base?.lessons ?? 0) + (delta.lessons ?? 0),
    reviews: (base?.reviews ?? 0) + (delta.reviews ?? 0),
  });
  return {
    days: { ...s.days, [key]: add(s.days[key]) },
    pending: { ...s.pending, days: { ...s.pending.days, [key]: add(s.pending.days[key]) } },
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initialData(),

      completeLesson(lessonId, accuracy, xp, results) {
        set((s) => {
          const now = Date.now();
          const prev = s.lessons[lessonId];
          const lessons = {
            ...s.lessons,
            [lessonId]: {
              done: prev?.done ?? now,
              best: Math.max(prev?.best ?? 0, accuracy),
              times: (prev?.times ?? 0) + 1,
              up: now,
            },
          };
          const cards = { ...s.cards };
          const pendingCards = { ...s.pending.cards };
          for (const r of results) {
            const existing = cards[r.itemId];
            // New items enter the review queue; repeating a lesson only resets items you missed.
            if (!existing) cards[r.itemId] = reviewCard(undefined, r.correct ? "good" : "hard", now);
            else if (!r.correct) cards[r.itemId] = reviewCard(existing, "again", now);
            else continue;
            pendingCards[r.itemId] = stamp();
          }
          const day = bumpDay(s, { xp, lessons: 1 });
          return {
            lessons,
            cards,
            days: day.days,
            pending: {
              ...day.pending,
              cards: pendingCards,
              lessons: { ...s.pending.lessons, [lessonId]: (s.pending.lessons[lessonId] ?? 0) + 1 },
            },
          };
        });
      },

      recordReview(itemId, correct) {
        set((s) => {
          const card = reviewCard(s.cards[itemId], correct ? "good" : "again");
          const day = bumpDay(s, { xp: correct ? 1 : 0, reviews: 1 });
          return {
            cards: { ...s.cards, [itemId]: card },
            days: day.days,
            pending: { ...day.pending, cards: { ...s.pending.cards, [itemId]: stamp() } },
          };
        });
      },

      addXp(xp) {
        if (xp > 0) set((s) => bumpDay(s, { xp }));
      },

      updateSettings(patch) {
        set((s) => ({
          settings: { ...s.settings, ...patch },
          settingsUp: Date.now(),
          pending: { ...s.pending, settings: true },
        }));
      },

      setData(patch) {
        set(patch);
      },

      clearPending(snapshot) {
        // Remove what was flushed, keeping anything recorded while the write was in flight.
        set((s) => {
          const days: Record<string, DayStats> = {};
          for (const [k, v] of Object.entries(s.pending.days)) {
            const sent = snapshot.days[k];
            const rest = {
              xp: v.xp - (sent?.xp ?? 0),
              lessons: v.lessons - (sent?.lessons ?? 0),
              reviews: v.reviews - (sent?.reviews ?? 0),
            };
            if (rest.xp || rest.lessons || rest.reviews) days[k] = rest;
          }
          const lessons: Record<string, number> = {};
          for (const [k, v] of Object.entries(s.pending.lessons)) {
            const rest = v - (snapshot.lessons[k] ?? 0);
            if (rest) lessons[k] = rest;
          }
          const cards: Record<string, number> = {};
          for (const [k, up] of Object.entries(s.pending.cards)) if (snapshot.cards[k] !== up) cards[k] = up;
          return {
            pending: { days, lessons, cards, settings: s.pending.settings && !snapshot.settings },
          };
        });
      },

      reset(ownerUid = null) {
        set({ ...initialData(), ownerUid });
      },
    }),
    {
      name: "polyglot-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        ownerUid: s.ownerUid,
        lessons: s.lessons,
        cards: s.cards,
        days: s.days,
        settings: s.settings,
        settingsUp: s.settingsUp,
        lastPull: s.lastPull,
        pending: s.pending,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressData>;
        return { ...current, ...p, settings: { ...DEFAULT_SETTINGS, ...p.settings }, pending: { ...emptyPending(), ...p.pending } };
      },
    },
  ),
);

/* ---------- selectors ---------- */

export function totalXp(days: Record<string, DayStats>): number {
  return Object.values(days).reduce((a, d) => a + d.xp, 0);
}

export function streakOf(days: Record<string, DayStats>) {
  return computeStreak(new Set(Object.entries(days).filter(([, d]) => d.xp > 0).map(([k]) => k)));
}

export function dueCount(cards: Record<string, SrsCard>, now = Date.now()): number {
  let n = 0;
  for (const c of Object.values(cards)) if (c.due <= now) n++;
  return n;
}
