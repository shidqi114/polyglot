import { toHiragana, toKana } from "wanakana";
import type { Exercise } from "./types";

const STRIP = /[\s。、．，,.!?！？「」・〜~'"]/g;

/** Converts kana/romaji to plain hiragana for comparison. */
export function normalizeKana(s: string): string {
  return toHiragana(toKana(s.trim().toLowerCase()).replace(STRIP, ""), { convertLongVowelMark: false });
}

/** Strips okurigana markers like ひと(つ) → ["ひと", "ひとつ"]. */
export function readingVariants(reading: string): string[] {
  const m = reading.match(/^(.*)\((.*)\)$/);
  return m ? [m[1], m[1] + m[2]] : [reading];
}

export function checkKana(input: string, answers: string[]): boolean {
  const v = normalizeKana(input);
  if (!v) return false;
  return answers.some((a) => readingVariants(a).some((r) => normalizeKana(r) === v));
}

/** Romaji answer for a kana prompt: accepts any spelling that maps to the same kana (shi/si, tsu/tu, …). */
export function checkRomaji(input: string, kanaAnswers: string[], romaji: string[] = []): boolean {
  const v = input.trim().toLowerCase().replace(STRIP, "");
  if (!v) return false;
  if (romaji.some((r) => r.toLowerCase() === v)) return true;
  return kanaAnswers.some((k) => normalizeKana(k) === toHiragana(v));
}

export function normalizeEnglish(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/^(to|a|an|the)\s+/, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

export function checkEnglish(input: string, answers: string[]): boolean {
  const v = normalizeEnglish(input);
  if (!v) return false;
  return answers.some((a) => {
    const n = normalizeEnglish(a);
    return n === v || (n.length > 4 && editDistance(n, v) <= 1);
  });
}

export function checkInput(ex: Extract<Exercise, { type: "input" }>, value: string): boolean {
  switch (ex.mode) {
    case "kana":
      return checkKana(value, ex.answers);
    case "romaji":
      return checkRomaji(value, ex.answers, [ex.answer]);
    case "english":
      return checkEnglish(value, ex.answers);
  }
}

export function checkBuild(answer: string[], chosen: string[]): boolean {
  return answer.join("") === chosen.join("");
}
