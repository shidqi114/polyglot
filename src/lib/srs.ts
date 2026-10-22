import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";

/** Compact, JSON-friendly FSRS card as stored locally and in Firestore. */
export interface SrsCard {
  due: number;
  s: number; // stability
  d: number; // difficulty
  sd: number; // scheduled days
  ls: number; // learning steps
  reps: number;
  lapses: number;
  st: number; // state
  lr: number | null; // last review (ms)
  up: number; // last local change (ms), used for merge
}

// Short-term (minute-level) steps make little sense for a lesson app, so
// even failed cards come back the next day.
const scheduler = fsrs({ enable_fuzz: true, enable_short_term: false, request_retention: 0.9 });

function toCard(c: SrsCard): Card {
  return {
    due: new Date(c.due),
    stability: c.s,
    difficulty: c.d,
    elapsed_days: 0,
    scheduled_days: c.sd,
    learning_steps: c.ls,
    reps: c.reps,
    lapses: c.lapses,
    state: c.st,
    last_review: c.lr != null ? new Date(c.lr) : undefined,
  };
}

function fromCard(c: Card, now: number): SrsCard {
  return {
    due: c.due.getTime(),
    s: c.stability,
    d: c.difficulty,
    sd: c.scheduled_days,
    ls: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    st: c.state,
    lr: c.last_review ? c.last_review.getTime() : null,
    up: now,
  };
}

export type Grading = "again" | "hard" | "good" | "easy";
const GRADES: Record<Grading, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export function reviewCard(card: SrsCard | undefined, grading: Grading, now = Date.now()): SrsCard {
  const base = card ? toCard(card) : createEmptyCard(new Date(now));
  return fromCard(scheduler.next(base, new Date(now), GRADES[grading]).card, now);
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.due <= now;
}

/** Probability of recall right now (0–1). */
export function retrievability(card: SrsCard, now = Date.now()): number {
  if (card.lr == null) return 0;
  return scheduler.get_retrievability(toCard(card), new Date(now), false);
}

/** 1–3 strength bars, a simple visual heuristic. */
export function strengthBars(card: SrsCard | undefined, now = Date.now()): 0 | 1 | 2 | 3 {
  if (!card) return 0;
  const r = retrievability(card, now);
  if (r >= 0.9 && card.s >= 7) return 3;
  if (r >= 0.75) return 2;
  return 1;
}
