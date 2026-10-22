import { describe, expect, it } from "vitest";
import { addClozeExercises, clozeExercise, clozeFor, conjugationExercise } from "@/lib/pack-exercises";
import type { PackWord } from "@/content/packs";
import type { Exercise, StudyItem } from "@/lib/types";

const rng = (seed = 7) => {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
};
const vocab = (front: string, reading: string, meaning: string): StudyItem => ({
  id: `v:${front}:${reading}`,
  kind: "vocab",
  front,
  reading,
  meanings: [meaning],
  level: "n5",
});
const taberu = vocab("食べる", "たべる", "to eat");
const pool = [vocab("水", "みず", "water"), vocab("本", "ほん", "book"), vocab("学校", "がっこう", "school"), taberu];

describe("sentence cloze", () => {
  const word: PackWord = {
    id: taberu.id,
    ex: [
      { ja: ["そんなに", ["食べる", "たべる"], "と", ["太る", "ふとる"], "よ。"], en: "If you eat that much, you'll get fat." },
    ],
  };

  it("blanks the word and keeps the translation", () => {
    expect(clozeFor(taberu, word)).toEqual({ prompt: "そんなに＿＿と太るよ。", en: "If you eat that much, you'll get fat." });
  });

  it("offers the word with exactly one correct option and no duplicates", () => {
    const ex = clozeExercise(taberu, word, pool, rng()) as Extract<Exercise, { type: "choice" }>;
    expect(ex.options.filter((o) => o.correct).map((o) => o.label)).toEqual(["食べる"]);
    expect(new Set(ex.options.map((o) => o.label)).size).toBe(ex.options.length);
  });

  it("does not blank a word that only appears inside a longer word", () => {
    const today = vocab("今", "いま", "now");
    const glued: PackWord = { id: today.id, ex: [{ ja: ["今日", "は"], en: "Today." }] };
    expect(clozeFor(today, glued)).toBeNull();
  });
});

describe("verb form drill", () => {
  const forms = { dict: "食べる", polite: "食べます", neg: "食べない", past: "食べた", te: "食べて" };
  const eatWord: PackWord = { id: taberu.id, forms };
  const others: PackWord[] = [
    { id: "v:見る:みる", forms: { dict: "見る", polite: "見ます", neg: "見ない", past: "見た", te: "見て" } },
    { id: "v:書く:かく", forms: { dict: "書く", polite: "書きます", neg: "書かない", past: "書いた", te: "書いて" } },
    { id: "v:寝る:ねる", forms: { dict: "寝る", polite: "寝ます", neg: "寝ない", past: "寝た", te: "寝て" } },
  ];

  it("asks for a non-dictionary form with the correct answer among its options", () => {
    const ex = conjugationExercise(taberu, eatWord, others, rng(3)) as Extract<Exercise, { type: "choice" }>;
    expect(ex.question).toMatch(/Choose the .+ form/);
    const correct = ex.options.filter((o) => o.correct);
    expect(correct).toHaveLength(1);
    expect(Object.values(forms)).toContain(correct[0].label);
    expect(ex.options.length).toBe(4);
  });

  it("returns nothing when there are not enough other verbs to offer choices", () => {
    expect(conjugationExercise(taberu, eatWord, others.slice(0, 1), rng())).toBeNull();
  });
});

describe("addClozeExercises", () => {
  it("appends cloze exercises only for items that have examples", () => {
    const words = new Map<string, PackWord>([
      [taberu.id, { id: taberu.id, ex: [{ ja: ["水", "を飲む"], en: "Drink water." }] }],
    ]);
    const base: Exercise[] = [];
    const out = addClozeExercises(base, [taberu], words, pool, 2, rng());
    expect(out.length).toBe(0); // "水" is not the target word, so no blank
    const waterWords = new Map<string, PackWord>([[pool[0].id, { id: pool[0].id, ex: [{ ja: ["水", "を飲む"], en: "Drink water." }] }]]);
    expect(addClozeExercises(base, [pool[0]], waterWords, pool, 2, rng())).toHaveLength(1);
  });
});
