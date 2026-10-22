import { describe, expect, it } from "vitest";
import { KANA_ROWS } from "@/content/kana";
import { addDays, dayKey } from "@/lib/dates";
import type { SrsCard } from "@/lib/srs";
import {
  accuracyByGroup,
  cardAccuracy,
  coachingState,
  confusions,
  leeches,
  lastSevenDays,
  nextSteps,
  weakestKanaRows,
} from "@/lib/weekly";

const card = (over: Partial<SrsCard> = {}): SrsCard => ({
  due: 0, s: 1, d: 5, sd: 1, ls: 0, reps: 0, lapses: 0, st: 2, lr: null, up: 0, ...over,
});

describe("weekly review", () => {
  it("returns the last seven days, oldest first, ending today", () => {
    const today = dayKey();
    const week = lastSevenDays({ [today]: { xp: 30, lessons: 2, reviews: 4 } }, today);
    expect(week).toHaveLength(7);
    expect(week[0].key).toBe(addDays(today, -6));
    expect(week[6]).toEqual({ key: today, xp: 30, lessons: 2, reviews: 4 });
    expect(week[0].xp).toBe(0);
  });

  it("measures accuracy as reviews that were not lapses", () => {
    expect(cardAccuracy(card({ reps: 0 }))).toBeNull();
    expect(cardAccuracy(card({ reps: 10, lapses: 3 }))).toBeCloseTo(0.7);
  });

  it("sorts groups weakest first and leaves out groups with fewer than five reviews", () => {
    const cards = {
      "v:a:1": card({ reps: 10, lapses: 5 }),
      "v:b:1": card({ reps: 10, lapses: 1 }),
      "j:c": card({ reps: 2, lapses: 2 }),
    };
    const groups = accuracyByGroup(cards, (id) => (id.startsWith("v:") ? "N5 words" : "N5 kanji"));
    expect(groups.map((g) => g.group)).toEqual(["N5 words"]);
    expect(groups[0].accuracy).toBeCloseTo(0.7);
    const both = accuracyByGroup(
      { ...cards, "j:d": card({ reps: 10, lapses: 0 }) },
      (id) => (id.startsWith("v:") ? "N5 words" : "N5 kanji"),
    );
    expect(both.map((g) => g.group)).toEqual(["N5 words", "N5 kanji"]);
  });

  it("lists leeches from four lapses up, most lapses first", () => {
    const cards = { "v:a:1": card({ lapses: 3 }), "v:b:1": card({ lapses: 4 }), "v:c:1": card({ lapses: 9 }) };
    expect(leeches(cards)).toEqual([
      { id: "v:c:1", lapses: 9 },
      { id: "v:b:1", lapses: 4 },
    ]);
  });

  it("lists items with recorded mix-ups, most mix-ups first", () => {
    const cards = {
      "k:か": card({ cf: ["が"] }),
      "k:き": card({ cf: ["さ", "た"] }),
      "k:く": card(),
    };
    expect(confusions(cards).map((c) => c.id)).toEqual(["k:き", "k:か"]);
  });

  it("finds the weakest kana row once it has reviews", () => {
    const row = KANA_ROWS.hiragana[0];
    const cards = Object.fromEntries(row.items.map((i) => [i.id, card({ reps: 4, lapses: 4 })]));
    const weak = weakestKanaRows(cards);
    expect(weak[0]).toEqual({ title: row.title, reviews: row.items.length * 4, accuracy: 0 });
  });

  it("suggests at most three steps, starting from the first kana lesson for a new learner", () => {
    expect(nextSteps({ lessonsDone: 0, due: 0, leeches: 0, confusedItems: 0, streak: 0, bestStreak: 0 })).toEqual([
      "Start the path with the first kana lesson. It takes about five minutes.",
    ]);
    const steps = nextSteps({ lessonsDone: 5, due: 30, leeches: 2, confusedItems: 1, streak: 4, bestStreak: 4 });
    expect(steps).toHaveLength(3);
    expect(steps[0]).toBe("Clear the 30 reviews that are due before you start new lessons.");
    expect(steps[1]).toBe("Fix 2 leeches: they keep coming back wrong.");
  });

  it("uses the singular for one leech", () => {
    const steps = nextSteps({ lessonsDone: 5, due: 0, leeches: 1, confusedItems: 0, streak: 4, bestStreak: 4 });
    expect(steps).toEqual(["Fix 1 leech: they keep coming back wrong."]);
  });

  it("derives the coaching state from progress: streak, idle days, accuracy and due cards", () => {
    const today = dayKey();
    const now = Date.now();
    const state = coachingState(
      {
        lessons: { "kana-h-0-0": { done: now, best: 1, times: 1, up: now } },
        cards: { "v:a:1": card({ reps: 40, lapses: 4, due: now - 1000 }) },
        days: { [addDays(today, -3)]: { xp: 10, lessons: 1, reviews: 0 } },
      },
      today,
      now,
    );
    expect(state.lessonsDone).toBe(1);
    expect(state.due).toBe(1);
    expect(state.daysIdle).toBe(3);
    expect(state.streak).toBe(0);
    expect(state.accuracy).toBeCloseTo(0.9);
    expect(state.kanaLearned).toBe(0);
    expect(state.kanaTotal).toBeGreaterThan(0);
  });

  it("has no idle days or accuracy before there is any study", () => {
    const state = coachingState({ lessons: {}, cards: {}, days: {} }, dayKey());
    expect(state.daysIdle).toBeNull();
    expect(state.accuracy).toBeNull();
  });
});
