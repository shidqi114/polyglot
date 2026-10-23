// Reviewed corrections to the automatic word types. Each entry says why IPADIC's answer is wrong.
// tests/unit/word-types.test.ts fails if an entry no longer changes the automatic answer, so the list cannot go stale.
import type { WordType } from "./word-types";

export const WORD_TYPE_OVERRIDES: Record<string, { type: WordType; reason: string }> = {
  "v:はく:はく": { type: "verb", reason: "IPADIC tags the stem as a noun; はく (to put on) is a verb" },
  "v:楽む:たのしむ": { type: "verb", reason: "non-standard spelling of 楽しむ; the verb stem ends in む" },
  "v:落る:おちる": { type: "verb", reason: "non-standard spelling of 落ちる; IPADIC splits off る" },
  "v:十分:じゅうぶん": { type: "na-adjective", reason: "形容動詞 (十分な, 十分だ); IPADIC reads 分 as a counter" },
  "v:大分:だいぶ": { type: "adverb", reason: "adverb (fairly well); IPADIC reads it as a place name" },
  "v:大体:だいたい": { type: "adverb", reason: "adverb (approximately); IPADIC tags it as a noun that can act as an adverb" },
  "v:一杯:いっぱい": { type: "noun", reason: "noun (full, or a cup of); IPADIC reads 杯 as a counter" },
  "v:そう; そうです:そう; そうです": { type: "set-phrase", reason: "response meaning yes, not an adverb" },
  "v:あ:あ": { type: "set-phrase", reason: "interjection (Ah!)" },
  "v:中々:なかなか": { type: "adverb", reason: "adverb (rather, not easily); IPADIC reads it as a pattern" },
  "v:万:まん": { type: "number", reason: "number (ten thousand); IPADIC tags it as an adverb" },
};
