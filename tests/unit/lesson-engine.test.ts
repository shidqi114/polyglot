import { describe, expect, it } from "vitest";
import { ALL_KANA, KANA_ROWS } from "@/content/kana";
import { GRAMMAR } from "@/content/grammar";
import { loadLevel } from "@/content/loader";
import {
  buildGrammarLesson,
  buildItemLesson,
  buildPracticeExercise,
  buildReviewExercise,
  kanjiReading,
  match,
} from "@/lib/lesson-engine";
import type { Exercise, StudyItem } from "@/lib/types";

/** Small deterministic PRNG so tests are reproducible. */
function rng(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function assertChoiceValid(ex: Exercise, item?: StudyItem) {
  if (ex.type !== "choice") return;
  const correct = ex.options.filter((o) => o.correct);
  expect(correct).toHaveLength(1);
  expect(correct[0].label).toBe(ex.answer);
  const labels = ex.options.map((o) => o.label.toLowerCase());
  expect(new Set(labels).size).toBe(labels.length);
  if (item && item.kind !== "kanji") {
    // No distractor may also be a valid answer for the item.
    const meanings = new Set(item.meanings.map((m) => m.toLowerCase()));
    for (const o of ex.options.filter((o) => !o.correct)) {
      expect(meanings.has(o.label.toLowerCase())).toBe(false);
      expect(o.label).not.toBe(item.front);
    }
  }
}

describe("buildItemLesson", () => {
  it("introduces every kana item and produces valid questions", () => {
    const pool = ALL_KANA.filter((k) => k.script === "hiragana");
    for (const row of KANA_ROWS.hiragana) {
      const lesson = buildItemLesson(row.items.slice(0, 6), pool, rng());
      const intros = lesson.filter((e) => e.type === "intro").map((e) => (e.type === "intro" ? e.item.id : ""));
      expect(new Set(intros)).toEqual(new Set(row.items.slice(0, 6).map((i) => i.id)));
      for (const ex of lesson) {
        const item = "itemId" in ex ? pool.find((p) => p.id === ex.itemId) : undefined;
        assertChoiceValid(ex, item);
      }
      expect(lesson.some((e) => e.type === "match")).toBe(true);
    }
  });

  it("never offers ぢ as a wrong answer for じ (same romaji)", () => {
    const pool = ALL_KANA.filter((k) => k.script === "hiragana");
    const ji = pool.find((k) => k.front === "じ")!;
    for (let seed = 1; seed < 200; seed++) {
      const ex = buildPracticeExercise(ji, pool, "reverse-pick", rng(seed));
      if (ex.type === "choice") expect(ex.options.some((o) => !o.correct && o.label === "ぢ")).toBe(false);
    }
  });

  it("builds vocab and kanji lessons from generated content", async () => {
    const n5 = await loadLevel("n5");
    expect(n5.vocab.length).toBeGreaterThan(500);
    expect(n5.kanji.length).toBeGreaterThan(50);
    const words = n5.vocab.slice(0, 6);
    for (const ex of buildItemLesson(words, n5.vocab.slice(0, 80), rng(7))) {
      assertChoiceValid(ex, words.find((w) => "itemId" in ex && w.id === ex.itemId));
    }
    const kanji = n5.kanji.slice(0, 4);
    for (const ex of buildItemLesson(kanji, n5.kanji, rng(9))) assertChoiceValid(ex);
  });

  it("offers exactly one correct kanji reading", async () => {
    const { kanji } = await loadLevel("n5");
    for (const k of kanji.slice(0, 30)) {
      const ex = kanjiReading(k, kanji, rng(3));
      if (ex.type !== "choice") throw new Error("expected choice");
      const own = new Set([...(k.on ?? []), ...(k.kun ?? [])]);
      expect(ex.options.filter((o) => own.has(o.label))).toHaveLength(1);
    }
  });
});

describe("match", () => {
  it("returns unique pairs", () => {
    const ex = match(KANA_ROWS.katakana[0].items, rng());
    expect(ex?.type).toBe("match");
    if (ex?.type === "match") {
      expect(new Set(ex.pairs.map((p) => p.left)).size).toBe(ex.pairs.length);
      expect(new Set(ex.pairs.map((p) => p.right)).size).toBe(ex.pairs.length);
    }
  });
});

describe("buildGrammarLesson", () => {
  it("starts with a note and every build exercise is solvable from its tiles", () => {
    for (const g of GRAMMAR) {
      const ex = buildGrammarLesson(g, rng());
      expect(ex[0].type).toBe("note");
      const builds = ex.filter((e) => e.type === "build");
      expect(builds).toHaveLength(g.sentences.length);
      for (const b of builds) {
        if (b.type !== "build") continue;
        const remaining = [...b.tiles];
        for (const t of b.answer) {
          const i = remaining.indexOf(t);
          expect(i).toBeGreaterThanOrEqual(0);
          remaining.splice(i, 1);
        }
      }
      for (const e of ex) assertChoiceValid(e);
    }
  });
});

describe("buildReviewExercise", () => {
  it("always targets the reviewed item", async () => {
    const { vocab } = await loadLevel("n4");
    const r = rng(5);
    for (const item of vocab.slice(0, 50)) {
      const ex = buildReviewExercise(item, vocab.slice(0, 120), r);
      expect("itemId" in ex && ex.itemId).toBe(item.id);
      assertChoiceValid(ex, item);
    }
  });
});
