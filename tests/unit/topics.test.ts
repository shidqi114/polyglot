import { beforeAll, describe, expect, it } from "vitest";
import vocabN5 from "@/content/generated/vocab-n5.json";
import vocabN4 from "@/content/generated/vocab-n4.json";
import wordTypes from "@/content/generated/word-types.json";
import { ALL_LESSONS } from "@/content/course";
import { GRAMMAR } from "@/content/grammar";
import { GRAMMAR_N4 } from "@/content/grammar-n4";
import { STORY_BY_ID } from "@/content/stories";
import { TOPICS, TOPIC_IDS } from "@/content/topics";
import { GENERAL_WORD_IDS, TOPIC_WORDS } from "@/content/topic-words";
import { canonicalReading, loadTokenizer, readingOf, type Tokenizer } from "./support/kuromoji";

interface Vocab {
  id: string;
  w: string;
  m: string[];
}

const VOCAB = [...(vocabN5 as Vocab[]), ...(vocabN4 as Vocab[])];
const VOCAB_IDS = new Set(VOCAB.map((v) => v.id));
const PLACED_TYPES = new Set(["noun", "verb", "i-adjective", "na-adjective", "adverb"]);
const TYPES = wordTypes as Record<string, string>;
const PUNCTUATION = /[。、！？?!.,]/g;

/** Phrases where kuromoji reads a word differently from the written kana. Each was checked by hand, as in stories.test.ts. */
const REVIEWED: Record<string, string> = {
  "兄が一人います。": "一人 is ひとり; kuromoji reads each character",
  "子供が二人います。": "二人 is ふたり; kuromoji reads each character",
  "辛いものは苦手です。": "辛い as spicy is からい; kuromoji gives ツライ",
  "銀行は交差点の角です。": "角 is かど here; kuromoji gives カク",
  "木の下で休みましょう。": "木 is き before の; kuromoji gives コ",
  "空港まで何分かかりますか。": "何分 is なんぷん; kuromoji gives ナニブン",
};

/** なに and なん are both correct for 何, so they are read the same way before comparing. */
function sameReading(written: string, read: string): boolean {
  // wanakana marks ん before a vowel with an apostrophe (nan'yoo); the apostrophe carries no sound, so it goes too.
  const normal = (text: string) => canonicalReading(text).replace(/'/g, "").replace(/nani/g, "nan");
  return normal(written) === normal(read);
}

describe("topics", () => {
  it("has one entry per id, with a title, a one-line blurb and a group", () => {
    expect(TOPICS.map((t) => t.id)).toEqual([...TOPIC_IDS]);
    expect(new Set(TOPIC_IDS).size).toBe(TOPIC_IDS.length);
    for (const t of TOPICS) {
      expect(t.title.trim(), t.id).not.toBe("");
      expect(t.blurb.trim(), t.id).not.toBe("");
      expect(t.blurb, t.id).not.toMatch(/\n/);
    }
  });

  it("gives each lesson id a valid, unique form that cannot clash with the path", () => {
    const pathIds = new Set(ALL_LESSONS.map((l) => l.id));
    for (const id of TOPIC_IDS) {
      const lessonId = `t-${id}`;
      expect(lessonId, lessonId).toMatch(/^[a-z0-9][a-z0-9-]{0,39}$/);
      expect(pathIds.has(lessonId), lessonId).toBe(false);
    }
  });
});

describe("topic word lists", () => {
  it("only uses words that exist in the N5 and N4 vocabulary", () => {
    for (const id of TOPIC_IDS) {
      for (const wordId of TOPIC_WORDS[id]) expect(VOCAB_IDS.has(wordId), `${id}: ${wordId}`).toBe(true);
    }
  });

  it("has no repeated word inside one topic", () => {
    for (const id of TOPIC_IDS) expect(new Set(TOPIC_WORDS[id]).size, id).toBe(TOPIC_WORDS[id].length);
  });

  it("places every N5 and N4 noun, verb, adjective and adverb in a topic or in everyday basics", () => {
    const placed = new Set(TOPIC_IDS.flatMap((id) => TOPIC_WORDS[id]));
    const unplaced = VOCAB.filter((v) => PLACED_TYPES.has(TYPES[v.id]) && !placed.has(v.id)).map((v) => v.w);
    expect(unplaced).toEqual([]);
  });

  it("keeps every word in at most two topics", () => {
    const count = new Map<string, number>();
    for (const id of TOPIC_IDS) for (const wordId of TOPIC_WORDS[id]) count.set(wordId, (count.get(wordId) ?? 0) + 1);
    const crowded = [...count].filter(([, n]) => n > 2).map(([wordId]) => wordId);
    expect(crowded).toEqual([]);
  });

  it("keeps everyday basics to 15% of the N5 and N4 words, and never repeats a word from a topic", () => {
    const total = VOCAB.length;
    expect(GENERAL_WORD_IDS.length / total).toBeLessThanOrEqual(0.15);
    const topical = new Set(TOPIC_IDS.filter((id) => id !== "everyday-basics").flatMap((id) => TOPIC_WORDS[id]));
    expect(GENERAL_WORD_IDS.filter((wordId) => topical.has(wordId))).toEqual([]);
  });

  it("gives every topic at least ten words", () => {
    for (const id of TOPIC_IDS) expect(TOPIC_WORDS[id].length, id).toBeGreaterThanOrEqual(10);
  });

  it("keeps the N5 words of each topic before its N4 words", () => {
    const n5 = new Set((vocabN5 as Vocab[]).map((v) => v.id));
    for (const id of TOPIC_IDS) {
      const flags = TOPIC_WORDS[id].map((wordId) => n5.has(wordId));
      const firstN4 = flags.indexOf(false);
      if (firstN4 >= 0) expect(flags.slice(firstN4).includes(true), id).toBe(false);
    }
  });
});

describe("topic phrases", () => {
  let tokenizer: Tokenizer;
  beforeAll(async () => {
    tokenizer = await loadTokenizer();
  });

  it("has six to ten phrases per topic", () => {
    for (const t of TOPICS) {
      expect(t.phrases.length, t.id).toBeGreaterThanOrEqual(6);
      expect(t.phrases.length, t.id).toBeLessThanOrEqual(10);
    }
  });

  it("splits each phrase into tiles that join back to the Japanese, and gives it kana and English", () => {
    for (const t of TOPICS) {
      for (const phrase of t.phrases) {
        const where = `${t.id}: ${phrase.jp}`;
        expect(phrase.tiles.join(""), where).toBe(phrase.jp.replace(PUNCTUATION, ""));
        expect(phrase.tiles.every((tile) => tile.trim() === tile && tile !== ""), where).toBe(true);
        expect(phrase.kana, where).toMatch(/^[ぁ-ゖァ-ヺー]+$/);
        expect(phrase.en.trim(), where).not.toBe("");
      }
    }
  });

  it("gives every phrase kana that matches how kuromoji reads its Japanese", () => {
    const mismatches: string[] = [];
    for (const t of TOPICS) {
      for (const phrase of t.phrases) {
        if (REVIEWED[phrase.jp]) continue;
        const read = readingOf(tokenizer, [phrase.jp]);
        if (sameReading(phrase.kana, read)) continue;
        mismatches.push(`${t.id}: ${phrase.jp} → kuromoji ${read}`);
      }
    }
    expect(mismatches).toEqual([]);
    // A reviewed entry that now reads correctly is stale and must be removed.
    const phrases = TOPICS.flatMap((t) => t.phrases);
    const stale = Object.keys(REVIEWED).filter((jp) => {
      const phrase = phrases.find((x) => x.jp === jp);
      return !phrase || sameReading(phrase.kana, readingOf(tokenizer, [jp]));
    });
    expect(stale).toEqual([]);
  });

  it("only links grammar points and stories that exist", () => {
    const grammarIds = new Set([...GRAMMAR, ...GRAMMAR_N4].map((g) => g.id));
    for (const t of TOPICS) {
      for (const id of t.grammar) expect(grammarIds.has(id), `${t.id}: ${id}`).toBe(true);
      for (const id of t.stories) expect(STORY_BY_ID.has(id), `${t.id}: ${id}`).toBe(true);
    }
  });
});
