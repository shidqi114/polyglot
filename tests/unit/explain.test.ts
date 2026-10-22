import { describe, expect, it } from "vitest";
import { confusablePairs, explainChoice, explainKana } from "@/lib/explain";

describe("explainChoice", () => {
  it("explains the correct particle, and the one picked instead", () => {
    const notes = explainChoice("は", "が");
    expect(notes.some((n) => n.includes("topic"))).toBe(true);
    expect(notes.some((n) => n.startsWith("You picked が"))).toBe(true);
  });

  it("points out an easily confused kana pair, in either order", () => {
    expect(explainChoice("ソ", "ン").join(" ")).toContain("so");
    expect(explainChoice("ン", "ソ").join(" ")).toContain("so");
  });

  it("gives nothing for unrelated words", () => {
    expect(explainChoice("水", "火")).toEqual([]);
  });
});

describe("explainKana", () => {
  it("explains a missing small tsu", () => {
    expect(explainKana("か", "っか").join(" ")).toContain("small tsu");
  });

  it("explains a missing voiced mark and names the sound", () => {
    const notes = explainKana("か", "が").join(" ");
    expect(notes).toContain("が");
    expect(notes).toContain("voiced mark");
  });

  it("explains a missing semi-voiced mark", () => {
    expect(explainKana("は", "ぱ").join(" ")).toContain("semi-voiced");
  });

  it("explains a long vowel and a small ya", () => {
    expect(explainKana("こひ", "こーひー").join(" ")).toContain("long");
    expect(explainKana("きや", "きゃ").join(" ")).toContain("small");
  });

  it("explains the particle は read as wa", () => {
    expect(explainKana("わ", "は").join(" ")).toContain("particle");
  });

  it("notes the same sound in a different script", () => {
    expect(explainKana("コーヒー", "こーひー").join(" ")).toContain("different script");
  });

  it("returns nothing for a correct answer, and always something for a wrong one", () => {
    expect(explainKana("か", "か")).toEqual([]);
    expect(explainKana("x", "か").length).toBeGreaterThan(0);
  });

  it("lists the confusable pairs", () => {
    expect(confusablePairs().length).toBeGreaterThanOrEqual(8);
  });
});
