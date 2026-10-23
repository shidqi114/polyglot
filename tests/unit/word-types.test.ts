import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { WORD_TYPE_OVERRIDES } from "../../scripts/content/word-type-overrides";
import { WORD_TYPES, buildWordTypes, classify, headwordOf, type VocabEntry } from "../../scripts/content/word-types";
import { loadTokenizer, type Tokenizer } from "./support/kuromoji";

const entries: VocabEntry[] = [
  ...JSON.parse(readFileSync(path.join(process.cwd(), "src/content/generated/vocab-n5.json"), "utf8")),
  ...JSON.parse(readFileSync(path.join(process.cwd(), "src/content/generated/vocab-n4.json"), "utf8")),
];
const committed: Record<string, string> = JSON.parse(
  readFileSync(path.join(process.cwd(), "src/content/generated/word-types.json"), "utf8"),
);

describe("word types", () => {
  let tokenizer: Tokenizer;
  beforeAll(async () => {
    tokenizer = await loadTokenizer();
  }, 120_000);

  const tokenize = (text: string) => tokenizer.tokenize(text) as never;
  const typeOf = (word: string) => classify(word, tokenize(word.replace(/～/g, "")));

  it("gives the expected type to golden words", () => {
    const golden: [string, string][] = [
      ["食べる", "verb"],
      ["高い", "i-adjective"],
      ["静か", "na-adjective"],
      ["駅", "noun"],
      ["郵便局", "noun"],
      ["誕生日", "noun"],
      ["どこ", "pronoun"],
      ["この", "pronoun"],
      ["はい", "set-phrase"],
      ["大きな", "na-adjective"],
      ["一人", "counter"],
      ["十", "number"],
      ["非常に", "adverb"],
    ];
    for (const [word, type] of golden) expect(typeOf(word), word).toBe(type);
  });

  it("types every N5 and N4 word with a known type", () => {
    const types = buildWordTypes(entries, tokenize, WORD_TYPE_OVERRIDES);
    expect(Object.keys(types)).toHaveLength(entries.length);
    for (const e of entries) expect(WORD_TYPES, e.id).toContain(types[e.id]);
  });

  it("keeps the committed file in step with the rules and overrides", () => {
    const types = buildWordTypes(entries, tokenize, WORD_TYPE_OVERRIDES);
    expect(committed).toEqual(Object.fromEntries(Object.entries(types).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))));
  });

  it("only keeps overrides that change the automatic answer", () => {
    for (const [id, override] of Object.entries(WORD_TYPE_OVERRIDES)) {
      const entry = entries.find((e) => e.id === id);
      expect(entry, `${id} is not in the N5/N4 vocabulary`).toBeDefined();
      const auto = typeOf(headwordOf(entry!.w));
      expect(override.type, `${id} repeats the automatic answer`).not.toBe(auto);
      expect(override.reason.trim(), id).not.toBe("");
    }
  });
});
