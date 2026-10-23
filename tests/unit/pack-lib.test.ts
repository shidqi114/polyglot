import { describe, expect, it } from "vitest";
import { rubyToSegments, withTargetReading, plainOf } from "../../scripts/content/lib";

// A real Kanjium `furigana` value (the ruby lives in that column, not in `japanese`).
const KANJIUM = "<ruby><rb>私</rb><rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>がご<ruby><rb>馳走</rb><rp>(</rp><rt>ちそう</rt><rp>)</rp></ruby>します。";

describe("pack ruby parsing", () => {
  it("reads Kanjium ruby into furigana segments", () => {
    expect(rubyToSegments(KANJIUM)).toEqual([["私", "わたし"], "がご", ["馳走", "ちそう"], "します。"]);
  });

  it("gives back the plain sentence, so ruby never changes the text", () => {
    expect(plainOf(rubyToSegments(KANJIUM))).toBe("私がご馳走します。");
  });

  it("does not leak markup into the text", () => {
    const segments = rubyToSegments("<ruby><rb>今</rb><rp>(</rp><rt>いま</rt><rp>)</rp></ruby>です");
    expect(JSON.stringify(segments)).not.toMatch(/[<>]/);
  });

  it("reads ruby whose closing tag is missing its `<` in Kanjium's data", () => {
    expect(rubyToSegments("<ruby><rb>花嫁/rb><rp>(</rp><rt>はなよめ</rt><rp>)</rp></ruby>と")).toEqual([["花嫁", "はなよめ"], "と"]);
  });

  it("uses the dictionary reading for the target word", () => {
    const out = withTargetReading(rubyToSegments(KANJIUM), "私", "わたし");
    expect(plainOf(out)).toBe("私がご馳走します。");
  });
});
