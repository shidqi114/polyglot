import { describe, expect, it } from "vitest";
import { morae, pitchPattern } from "@/lib/mora";

describe("morae", () => {
  it("joins small kana to the mora before them", () => {
    expect(morae("きょう")).toEqual(["きょ", "う"]);
    expect(morae("しゃしん")).toEqual(["しゃ", "し", "ん"]);
    expect(morae("シャシン")).toEqual(["シャ", "シ", "ン"]);
  });

  it("counts sokuon, the long vowel mark and ん as morae", () => {
    expect(morae("がっこう")).toEqual(["が", "っ", "こ", "う"]);
    expect(morae("コーヒー")).toEqual(["コ", "ー", "ヒ", "ー"]);
    expect(morae("ほん")).toEqual(["ほ", "ん"]);
  });
});

describe("pitchPattern", () => {
  it("flat words start low and stay high", () => {
    expect(pitchPattern(4, 0)).toEqual(["L", "H", "H", "H"]);
  });

  it("drops after the accent mora", () => {
    expect(pitchPattern(3, 1)).toEqual(["H", "L", "L"]);
    expect(pitchPattern(4, 2)).toEqual(["L", "H", "L", "L"]);
    expect(pitchPattern(4, 4)).toEqual(["L", "H", "H", "H"]);
  });
});
