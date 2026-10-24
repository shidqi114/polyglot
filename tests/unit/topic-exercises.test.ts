import { describe, expect, it } from "vitest";
import { TOPICS, type TopicPhrase } from "@/content/topics";
import { GRAMMAR_N4 } from "@/content/grammar-n4";
import { GRAMMAR } from "@/content/grammar";
import type { Exercise } from "@/lib/types";
import {
  blankedRuby,
  blankedText,
  familyItems,
  particleDrill,
  particleExercise,
  particleItemsFromGrammar,
  phraseBuildExercise,
  phraseListenExercise,
  type ParticleItem,
} from "@/lib/topic-exercises";

/** A small deterministic random source, so each test always picks the same options. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const item = (over: Partial<ParticleItem> = {}): ParticleItem => ({
  ja: ["学校", "に行きます。"],
  at: 2,
  p: "に",
  en: "I'm going to school.",
  also: ["へ"],
  level: "n5",
  ...over,
});

const choice = (ex: Exercise) => {
  if (ex.type !== "choice") throw new Error("expected a choice exercise");
  return ex;
};

describe("particle questions", () => {
  it("blanks the particle in the text and the ruby, and keeps the other words' furigana", () => {
    const ja = [["学校", "がっこう"] as [string, string], "に行きます。"];
    const withRuby = item({ ja, at: 2 });
    expect(blankedText(withRuby)).toBe("学校＿＿行きます。");
    expect(blankedRuby(withRuby)).toEqual([["学校", "がっこう"], "＿＿", "行きます。"]);
  });

  it("blanks a two-character particle (から, まで) as one", () => {
    const withKara = item({ ja: ["日曜日だから", "学校は休みです。"], at: 4, p: "から", also: [] });
    expect(blankedText(withKara)).toBe("日曜日だ＿＿学校は休みです。");
    expect(blankedRuby(withKara)).toEqual(["日曜日だ", "＿＿", "学校は休みです。"]);
  });

  it("has exactly one correct option, and never offers a particle that also fits", () => {
    const rng = seeded(3);
    for (let i = 0; i < 40; i++) {
      const ex = choice(particleExercise(item({ also: ["へ", "と"] }), rng));
      expect(ex.options).toHaveLength(4);
      expect(ex.options.filter((o) => o.correct).map((o) => o.label)).toEqual(["に"]);
      expect(ex.options.map((o) => o.label)).not.toContain("へ");
      expect(ex.options.map((o) => o.label)).not.toContain("と");
      expect(new Set(ex.options.map((o) => o.label)).size).toBe(4);
    }
  });

  it("shows the English as the hint and the blank in the question", () => {
    const ex = choice(particleExercise(item(), seeded(1)));
    expect(ex.prompt).toBe("学校＿＿行きます。");
    expect(ex.promptSub).toBe("I'm going to school.");
    expect(ex.answer).toBe("に");
    expect(ex.promptRuby).toContainEqual("＿＿");
  });

  it("picks the wrong choices from the same family first", () => {
    const ex = choice(particleExercise(item({ p: "を", ja: ["本", "を読みます。"], at: 1, also: [] }), seeded(9)));
    const labels = ex.options.map((o) => o.label);
    expect(labels).toContain("を");
    expect(labels.filter((l) => l !== "を")).toHaveLength(3);
  });

  it("builds drills from the N5 items before the N4 items, without repeats", () => {
    const n5 = [item({ en: "one" }), item({ en: "two", ja: ["友達", "と会います。"], at: 2, p: "と", also: [] })];
    const n4 = [item({ en: "three", ja: ["大学", "に行きます。"], level: "n4" })];
    const drill = particleDrill([...n5, ...n4, n5[0]], 3, seeded(4));
    expect(drill).toHaveLength(3);
    const order = drill.map((ex) => choice(ex).promptSub);
    expect(order.slice(0, 2).sort()).toEqual(["one", "two"]);
    expect(order[2]).toBe("three");
  });

  it("filters a drill to one particle family", () => {
    const items = [item(), item({ p: "を", at: 1, also: [], ja: ["本", "を読みます。"] }), item({ p: "から", also: [], ja: ["駅", "から来ました。"], at: 1 })];
    expect(familyItems(items, "wo").map((i) => i.p)).toEqual(["を"]);
    expect(familyItems(items, "kara-made").map((i) => i.p)).toEqual(["から"]);
    expect(familyItems(items, undefined)).toHaveLength(3);
  });

  it("turns each particle tile of a hand-written sentence into a drill item, the offline fallback", () => {
    const items = particleItemsFromGrammar([{ tiles: ["わたし", "は", "学生", "です"], kana: "わたしはがくせいです", en: "I am a student." }], "n5");
    expect(items).toEqual([expect.objectContaining({ p: "は", at: 3, en: "I am a student.", level: "n5" })]);
    // は's fits by another particle, so が and も are never wrong choices for it.
    expect(items[0].also).toEqual(expect.arrayContaining(["が", "も"]));
  });

  it("uses the grammar sentences in the course, so the fallback always has items", () => {
    const sentences = [...GRAMMAR, ...GRAMMAR_N4].flatMap((g) => g.sentences);
    const items = particleItemsFromGrammar(sentences, "n5");
    expect(items.length).toBeGreaterThan(100);
    for (const i of items) expect(i.ja.join("")).toMatch(/[ぁ-んァ-ン一-龯]/);
  });
});

describe("phrase questions", () => {
  const topic = TOPICS.find((t) => t.id === "shopping")!;
  const phrase: TopicPhrase = topic.phrases[0];
  const others = topic.phrases.slice(1);

  it("plays the phrase, and offers its meaning among three others", () => {
    const ex = choice(phraseListenExercise(phrase, others, seeded(2)));
    expect(ex.audio).toBe(phrase.kana);
    expect(ex.audioOnly).toBe(true);
    expect(ex.options).toHaveLength(4);
    expect(ex.options.filter((o) => o.correct)).toEqual([expect.objectContaining({ label: phrase.en })]);
    expect(new Set(ex.options.map((o) => o.label)).size).toBe(4);
  });

  it("builds the phrase from its tiles, with spare tiles from other phrases", () => {
    const ex = phraseBuildExercise(phrase, others, seeded(5));
    if (ex.type !== "build") throw new Error("expected a build exercise");
    expect(ex.answer.join("")).toBe(phrase.jp.replace(/[。、！？]/g, ""));
    expect(ex.tiles.length).toBeGreaterThanOrEqual(ex.answer.length);
    expect(ex.tiles.length).toBeLessThanOrEqual(ex.answer.length + 2);
    // Every tile of the answer is among the choices, once each.
    for (const tile of ex.answer) {
      const inAnswer = ex.answer.filter((t) => t === tile).length;
      const inTiles = ex.tiles.filter((t) => t === tile).length;
      expect(inTiles).toBeGreaterThanOrEqual(inAnswer);
    }
  });
});
