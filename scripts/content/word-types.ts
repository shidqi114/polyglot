// Word types from kuromoji's part-of-speech tags (IPADIC). Pure: the tokenizer is passed in, so tests can use it too.
// Known misses are fixed in word-type-overrides.ts, each with a reason.

export const WORD_TYPES = [
  "noun",
  "verb",
  "i-adjective",
  "na-adjective",
  "adverb",
  "pronoun",
  "number",
  "counter",
  "set-phrase",
  "pattern",
] as const;
export type WordType = (typeof WORD_TYPES)[number];

/** The subset of kuromoji's token fields that the rules read. */
export interface Token {
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  pos_detail_2?: string;
}

export interface VocabEntry {
  id: string;
  w: string;
  m: string[];
}

/** Question and pointing words that IPADIC tags as adverbs or adjectival modifiers. */
export const QUESTION_WORDS = new Set([
  "いかが", "いくつ", "いくら", "いつ", "なぜ", "どう", "どうして", "どこ", "どちら", "どれ", "誰", "だれ", "何", "なに", "なん",
]);

/** Suffixes that count things. Only these become counters when written with a "～" entry. */
export const COUNTER_SUFFIXES = new Set([
  "～日", "～人", "～年", "～本", "～時", "～月", "～分", "～時間", "～回", "～円", "～度", "～台", "～歳", "～週間",
  "～番", "～個", "～階", "～枚", "～杯", "～冊", "～匹", "～軒", "～か月",
]);

const HELPER_POS = new Set(["助動詞", "助詞"]);
const POINTING_START = /^[こそあど]/;

/** Gives the type a word would get from its tokens alone. */
export function classify(headword: string, tokens: Token[]): WordType {
  if (QUESTION_WORDS.has(headword)) return "pronoun";
  if (tokens.some((t) => t.pos_detail_1 === "副詞化")) return "adverb";
  // A "～" entry is a grammar pattern or suffix; only the listed suffixes count things. No tokens needed.
  if (/～/.test(headword)) return COUNTER_SUFFIXES.has(headword) ? "counter" : "pattern";

  const core = tokens.filter((t) => !HELPER_POS.has(t.pos) && t.pos !== "接頭詞");
  const head = core[core.length - 1];
  if (!head) return "pattern";


  switch (head.pos) {
    case "動詞":
      return "verb";
    case "形容詞":
      return "i-adjective";
    case "副詞":
      return "adverb";
    case "代名詞":
      return "pronoun";
    case "連体詞":
      return POINTING_START.test(headword) ? "pronoun" : "na-adjective";
    case "感動詞":
    case "接続詞":
      return "set-phrase";
    case "名詞":
      // IPADIC tags これ, 私 and どこ as 名詞 with the sub-type 代名詞.
      if (head.pos_detail_1 === "代名詞") return "pronoun";
      if (head.pos_detail_1 === "形容動詞語幹") return "na-adjective";
      if (head.pos_detail_1 === "数") return "number";
      // 日 in 誕生日 is part of a compound noun; a counter follows a numeral (一日, 二人).
      if (head.pos_detail_1 === "接尾") {
        const before = core[core.length - 2];
        return head.pos_detail_2 === "助数詞" && before?.pos_detail_1 === "数" ? "counter" : "noun";
      }
      return "noun";
    default:
      return "pattern";
  }
}

/** The headword of a vocabulary entry: the first spelling, without the "～" marks. */
export function headwordOf(w: string): string {
  return w.split(/;\s*/)[0].trim();
}

/** Entries whose gloss starts with "to " are usually verbs. The list is a review aid, not a rule. */
export function verbGlossMismatches(entries: { id: string; m: string[] }[], types: Record<string, WordType>): string[] {
  return entries.filter((e) => e.m[0]?.startsWith("to ") && types[e.id] !== "verb").map((e) => e.id);
}

/** Builds id → type for the given entries. Overrides win, and each override must change the automatic answer. */
export function buildWordTypes(
  entries: VocabEntry[],
  tokenize: (text: string) => Token[],
  overrides: Record<string, { type: WordType; reason: string }>,
): Record<string, WordType> {
  const out: Record<string, WordType> = {};
  for (const e of entries) {
    const headword = headwordOf(e.w);
    const auto = classify(headword, tokenize(headword.replace(/～/g, "")));
    out[e.id] = overrides[e.id]?.type ?? auto;
  }
  return out;
}
