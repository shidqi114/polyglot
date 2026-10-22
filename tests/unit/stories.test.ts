import { beforeAll, describe, expect, it } from "vitest";
import { STORIES, STORY_BY_ID, type StoryReply } from "@/content/stories";
import { canonicalReading, loadTokenizer, readingOf, type Tokenizer } from "./support/kuromoji";

const KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/;

/**
 * Lines where kuromoji reads a word differently from the written kana. Each was checked by hand: the kana is the
 * usual reading, and kuromoji's reading is the one that differs. A stale entry fails the test.
 */
const REVIEWED: Record<string, string> = {
  ごうけいはろっぴゃくごじゅうえんです: "六百 is ろっぴゃく; kuromoji gives ろくひゃく",
  いらっしゃいませなんめいさまですか: "何名 is なんめい; kuromoji gives ナニ",
  ふたりです: "二人 is ふたり; kuromoji reads each character",
  えきはなんですか: "何 is なん before です; kuromoji gives なに",
  ふたつめのかどをみぎにまがってください: "角 is かど here; kuromoji gives かく",
  しちゃくしてもいいですか: "試着 is not in kuromoji's dictionary, so 試 is left unread",
  しちゃくがすきです: "試着 is not in kuromoji's dictionary, so 試 is left unread",
  しちゃくしました: "試着 is not in kuromoji's dictionary, so 試 is left unread",
  さんばんせんですでんしゃはじゅっぷんごにきます: "十分 is じゅっぷん; kuromoji gives じゅうふん",
  なにいろのさいふですか: "何色 is なにいろ; kuromoji gives ナニショク",
  たのしみにしていますねしちじからだからおくれないでね: "七時 is しちじ; kuromoji gives ななじ",
};

const replies = (story: (typeof STORIES)[number]) => story.steps.filter((s): s is StoryReply => s.type === "reply");

describe("stories", () => {
  it("has twelve stories, six for N5 and six for N4, with unique ids", () => {
    expect(STORIES).toHaveLength(12);
    expect(STORIES.filter((s) => s.level === "n5")).toHaveLength(6);
    expect(STORIES.filter((s) => s.level === "n4")).toHaveLength(6);
    expect(new Set(STORIES.map((s) => s.id)).size).toBe(STORIES.length);
    for (const s of STORIES) expect(STORY_BY_ID.get(s.id)).toBe(s);
  });

  it("gives every story a few lines, at least one reply and at least two questions", () => {
    for (const s of STORIES) {
      expect(s.steps.length, s.id).toBeGreaterThanOrEqual(4);
      expect(replies(s).length, s.id).toBeGreaterThanOrEqual(1);
      expect(s.questions.length, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("has exactly one correct reply option, and every option explains itself", () => {
    for (const s of STORIES) {
      for (const r of replies(s)) {
        expect(r.prompt.trim(), s.id).not.toBe("");
        expect(r.options.length, s.id).toBeGreaterThanOrEqual(3);
        expect(r.options.filter((o) => o.correct), s.id).toHaveLength(1);
        for (const o of r.options) {
          expect(o.feedback.trim(), `${s.id}: ${o.jp}`).not.toBe("");
          expect(o.kana, `${s.id}: ${o.jp}`).toMatch(KANA_ONLY);
          expect(o.en.trim(), `${s.id}: ${o.jp}`).not.toBe("");
        }
      }
    }
  });

  it("gives every spoken line a reading and a translation", () => {
    for (const s of STORIES) {
      for (const step of s.steps) {
        if (step.type !== "line") continue;
        expect(step.speaker.trim(), s.id).not.toBe("");
        expect(step.jp.trim(), s.id).not.toBe("");
        expect(step.kana, `${s.id}: ${step.jp}`).toMatch(KANA_ONLY);
        expect(step.en.trim(), `${s.id}: ${step.jp}`).not.toBe("");
      }
    }
  });

  it("points every question at one of its options", () => {
    for (const s of STORIES) {
      for (const q of s.questions) {
        expect(q.question.trim(), s.id).not.toBe("");
        expect(new Set(q.options).size, s.id).toBe(q.options.length);
        expect(q.answer, s.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, s.id).toBeLessThan(q.options.length);
      }
    }
  });
});

describe("story readings", () => {
  let tokenizer: Tokenizer;

  beforeAll(async () => {
    tokenizer = await loadTokenizer();
  }, 120_000);

  it("matches the written kana, apart from the reviewed readings", () => {
    const mismatches: string[] = [];
    const reviewed = new Set<string>();
    const check = (jp: string, kana: string) => {
      if (canonicalReading(readingOf(tokenizer, [jp])) === canonicalReading(kana)) return;
      if (kana in REVIEWED) reviewed.add(kana);
      else mismatches.push(`${jp} (${kana}) read as ${readingOf(tokenizer, [jp])}`);
    };
    for (const s of STORIES) {
      for (const step of s.steps) {
        if (step.type === "line") check(step.jp, step.kana);
        else for (const o of step.options) check(o.jp, o.kana);
      }
    }
    expect(mismatches).toEqual([]);
    expect(Object.keys(REVIEWED).filter((k) => !reviewed.has(k))).toEqual([]);
  });
});
