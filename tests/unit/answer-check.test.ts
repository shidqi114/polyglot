import { describe, expect, it } from "vitest";
import { checkEnglish, checkKana, checkRomaji, normalizeKana, readingVariants } from "@/lib/answer-check";

describe("checkRomaji", () => {
  it("accepts Hepburn and Kunrei spellings for the same kana", () => {
    expect(checkRomaji("shi", ["し"], ["shi"])).toBe(true);
    expect(checkRomaji("si", ["し"], ["shi"])).toBe(true);
    expect(checkRomaji("tu", ["つ"], ["tsu"])).toBe(true);
    expect(checkRomaji("hu", ["ふ"], ["fu"])).toBe(true);
    expect(checkRomaji(" KA ", ["か"], ["ka"])).toBe(true);
  });

  it("works for katakana and combos", () => {
    expect(checkRomaji("kya", ["キャ"], ["kya"])).toBe(true);
    expect(checkRomaji("sha", ["シャ"], ["sha"])).toBe(true);
    expect(checkRomaji("n", ["ん"], ["n"])).toBe(true);
  });

  it("rejects wrong answers", () => {
    expect(checkRomaji("ka", ["き"], ["ki"])).toBe(false);
    expect(checkRomaji("", ["か"], ["ka"])).toBe(false);
  });
});

describe("checkKana", () => {
  it("accepts romaji, hiragana or katakana for a reading", () => {
    expect(checkKana("taberu", ["たべる"])).toBe(true);
    expect(checkKana("たべる", ["たべる"])).toBe(true);
    expect(checkKana("タベル", ["たべる"])).toBe(true);
  });

  it("handles long vowel marks in katakana words", () => {
    expect(checkKana("コーヒー", ["コーヒー"])).toBe(true);
    expect(checkKana("ko-hi-", ["コーヒー"])).toBe(true);
  });

  it("accepts okurigana variants for kanji kun readings", () => {
    expect(readingVariants("ひと(つ)")).toEqual(["ひと", "ひとつ"]);
    expect(checkKana("hitotsu", ["いち", "ひと(つ)"])).toBe(true);
    expect(checkKana("hito", ["いち", "ひと(つ)"])).toBe(true);
  });

  it("ignores punctuation and spaces", () => {
    expect(normalizeKana("た べ る。")).toBe("たべる");
  });

  it("rejects wrong readings", () => {
    expect(checkKana("nomu", ["たべる"])).toBe(false);
  });
});

describe("checkEnglish", () => {
  it("is lenient with articles, 'to' and small typos", () => {
    expect(checkEnglish("eat", ["to eat"])).toBe(true);
    expect(checkEnglish("The Book", ["book"])).toBe(true);
    expect(checkEnglish("teacher", ["teacher (honorific)"])).toBe(true);
    expect(checkEnglish("techer", ["teacher"])).toBe(true);
    expect(checkEnglish("dog", ["cat"])).toBe(false);
  });
});
