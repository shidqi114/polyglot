import { beforeAll, describe, expect, it } from "vitest";
import { GRAMMAR, GRAMMAR_BY_ID } from "@/content/grammar";
import { GRAMMAR_N4 } from "@/content/grammar-n4";
import { buildGrammarLesson } from "@/lib/lesson-engine";
import { canonicalReading, loadTokenizer, readingOf, type Tokenizer } from "./support/kuromoji";

const ALL = [...GRAMMAR, ...GRAMMAR_N4];
const KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/;

/**
 * Sentences where kuromoji reads a word differently from the written kana. Each was checked by hand: the kana
 * is the usual reading (or another valid one), and kuromoji's reading is the one that differs. A stale entry
 * fails the test, so the list cannot hide a later content change.
 */
const REVIEWED: Record<string, string> = {
  わたしはにほんじんじゃないです: "日本人 also read にほんじん; kuromoji gives にっぽんじん",
  らいねんにほんへいきます: "日本 also read にほん; kuromoji gives にっぽん",
  しちじにおきます: "七時 is usually しちじ; kuromoji gives ななじ",
  くじからごじまではたらきます: "九時 is usually くじ; kuromoji gives きゅうじ",
  なんじにねますか: "何時 is なんじ here; kuromoji reads it いつ on its own",
  にほんへいきたいです: "日本 also read にほん; kuromoji gives にっぽん",
  ともだちがふたりきます: "二人 is ふたり; kuromoji reads each character",
  ほんをいっさつよみました: "一冊 is いっさつ (sokuon); kuromoji gives いちさつ",
  ねこがさんびきいます: "三匹 is さんびき (rendaku); kuromoji gives さんひき",
  これはなんですか: "何 is なん before です; kuromoji gives なに",
  にほんにきてからにねんです: "日本 also read にほん; kuromoji gives にっぽん",
  ひとりでいけますか: "一人 is ひとり; kuromoji reads each character",
  にほんよりちゅうごくのほうがおおきいです: "日本 also read にほん; kuromoji gives にっぽん",
  らいねんにほんへいくつもりです: "日本 also read にほん; kuromoji gives にっぽん",
};

describe("grammar points", () => {
  it("has unique ids, each reachable through GRAMMAR_BY_ID", () => {
    const ids = ALL.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(GRAMMAR_BY_ID.get(id)).toBeDefined();
  });

  it("gives every point a title, notes, examples and at least three sentences", () => {
    for (const g of ALL) {
      expect(g.title, g.id).not.toBe("");
      expect(g.notes.length, g.id).toBeGreaterThan(0);
      expect(g.examples.length, g.id).toBeGreaterThan(0);
      expect(g.sentences.length, g.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("writes every sentence as tiles, with a kana reading and a translation", () => {
    for (const g of ALL) {
      for (const s of g.sentences) {
        expect(s.tiles.every((t) => t.length > 0 && !/\s/.test(t)), g.id).toBe(true);
        expect(s.kana, g.id).toMatch(KANA_ONLY);
        expect(s.en.trim(), g.id).not.toBe("");
      }
    }
  });

  it("builds lesson exercises with exactly one correct, distinct option per question", () => {
    for (const g of ALL) {
      for (const ex of buildGrammarLesson(g, () => 0.5)) {
        if (ex.type !== "choice") continue;
        expect(ex.options.filter((o) => o.correct), g.id).toHaveLength(1);
        expect(ex.options.find((o) => o.correct)?.label, g.id).toBe(ex.answer);
        expect(new Set(ex.options.map((o) => o.label)).size, g.id).toBe(ex.options.length);
      }
    }
  });
});

describe("grammar sentence readings", () => {
  let tokenizer: Tokenizer;

  beforeAll(async () => {
    tokenizer = await loadTokenizer();
  }, 120_000);

  it("matches the written kana, apart from the reviewed readings", () => {
    const mismatches: string[] = [];
    const reviewed = new Set<string>();
    for (const g of ALL) {
      for (const s of g.sentences) {
        // Tokenise each tile on its own: the tiles are already word-sized, and joining them can merge words.
        const read = canonicalReading(readingOf(tokenizer, s.tiles));
        if (read === canonicalReading(s.kana)) continue;
        if (s.kana in REVIEWED) reviewed.add(s.kana);
        else mismatches.push(`${g.id}: ${s.kana} (kuromoji: ${read})`);
      }
    }
    expect(mismatches).toEqual([]);
    expect(Object.keys(REVIEWED).filter((k) => !reviewed.has(k))).toEqual([]);
  });
});
