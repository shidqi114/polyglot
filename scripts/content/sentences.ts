// Particle sentences for the study packs (see build-packs.ts). Pure: kuromoji's tokens are passed in, so tests can use
// hand-made tokens. A sentence is kept when it is short and every content word is N5 or N4 vocabulary.
import { alsoCorrect, PARTICLES, type Particle } from "../../src/content/particles";
import type { Segment } from "./lib";

/** The kuromoji (IPADIC) fields that the rules read. */
export interface Token {
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  basic_form?: string;
  reading?: string;
}

export interface VocabEntry {
  id: string;
  w: string;
  r: string;
  m: string[];
}

export const MAX_PARTICLE_CHARS = 30;
const PARTICLE_SET = new Set<string>(PARTICLES);
const CONTENT_POS = new Set(["名詞", "動詞", "形容詞", "副詞", "連体詞", "感動詞", "接続詞"]);
const FREE_NOUN_SUBTYPES = new Set(["代名詞", "数", "接尾", "非自立"]);
const PREDICATE_POS = new Set(["動詞", "形容詞"]);
const COMPOUND_BEFORE = new Set(["これ", "それ", "あれ", "今", "いつ", "どこ", "ここ", "そこ", "あそこ", "今後", "以前", "最近", "ずっと", "何"]);

export const hiragana = (text: string) => text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/** Every spelling that identifies a vocabulary entry: the headword, the reading, and each part of a "; " variant. */
export function vocabForms(entries: VocabEntry[]): Map<string, string> {
  const forms = new Map<string, string>();
  const add = (form: string, id: string) => {
    const clean = form.trim();
    if (clean && !forms.has(clean)) forms.set(clean, id);
  };
  for (const entry of entries) {
    for (const text of [entry.w, entry.r]) {
      add(text, entry.id);
      add(text.replace(/\s*\(.*?\)\s*$/, ""), entry.id);
      for (const part of text.split(/\s*[;、]\s*/)) add(part, entry.id);
    }
  }
  return forms;
}

/** The vocabulary id a token matches, by its dictionary form, its surface or its reading. */
function idOf(token: Token, forms: Map<string, string>): string | undefined {
  for (const form of [token.basic_form, token.surface_form, token.reading && hiragana(token.reading)]) {
    const id = form ? forms.get(form) : undefined;
    if (id) return id;
  }
  return undefined;
}

/** Content tokens need a vocabulary entry. Particles, auxiliaries, punctuation, pronouns and numbers do not. */
function needsVocabulary(token: Token): boolean {
  if (!CONTENT_POS.has(token.pos)) return false;
  return !(token.pos === "名詞" && FREE_NOUN_SUBTYPES.has(token.pos_detail_1));
}

export interface Analysis {
  /** Character offset of the blank (the particle) in the plain sentence. */
  at: number;
  p: Particle;
  /** Dictionary form of the first verb or adjective after the blank, if there is one. */
  verb?: string;
  /** Vocabulary ids of the content words, in order. */
  ids: string[];
  level: "n5" | "n4";
}

/**
 * Finds the first particle as the blank. Returns null when a content word is not in the vocabulary (the level's
 * entries, N5 or N4), when there is no particle to blank, or when the sentence has fewer than two known words.
 */
export function analyse(tokens: Token[], forms: Map<string, string>, n5Ids: Set<string>): Analysis | null {
  let offset = 0;
  let blank: { at: number; index: number; p: Particle } | undefined;
  const ids: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (needsVocabulary(token)) {
      const id = idOf(token, forms);
      if (!id) return null;
      if (!ids.includes(id)) ids.push(id);
    }
    if (!blank && token.pos === "助詞" && PARTICLE_SET.has(token.surface_form)) {
      blank = { at: offset, index: i, p: token.surface_form as Particle };
    }
    offset += token.surface_form.length;
  }
  if (!blank || ids.length < 2) return null;
  // まで and から often follow a word that is one dictionary word with them (これまで, 今から); a blank there is misleading.
  const before = tokens[blank.index - 1]?.surface_form;
  if ((blank.p === "まで" || blank.p === "から") && before && COMPOUND_BEFORE.has(before)) return null;
  const after = tokens.slice(blank.index + 1).find((t) => PREDICATE_POS.has(t.pos) || (t.pos === "名詞" && t.pos_detail_1 === "形容動詞語幹"));
  return {
    at: blank.at,
    p: blank.p,
    verb: after ? after.basic_form ?? after.surface_form : undefined,
    ids,
    level: ids.every((id) => n5Ids.has(id)) ? "n5" : "n4",
  };
}

/** Whether the blank falls on plain text. Furigana is written over kanji only, so a particle is never inside a ruby base. */
export function blankIsPlain(ja: Segment[], at: number): boolean {
  let offset = 0;
  for (const segment of ja) {
    const text = typeof segment === "string" ? segment : segment[0];
    if (at >= offset && at < offset + text.length) return typeof segment === "string";
    offset += text.length;
  }
  return false;
}

/** Whether the English sentence contains one of the entry's meanings, so the word is really in the sentence. */
export function meaningIn(en: string, meanings: string[]): boolean {
  const lower = en.toLowerCase();
  return meanings.some((m) => {
    const core = m.replace(/\(.*?\)/g, "").replace(/^to /, "").trim().toLowerCase();
    if (core.length < 3) return false;
    return new RegExp(`\\b${core.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower);
  });
}

export interface PackSentence {
  ja: Segment[];
  at: number;
  p: Particle;
  en: string;
  also: Particle[];
  w: string[];
}

/** Counts how often each verb takes each particle, over every analysed sentence. Keys are "verb|particle". */
export function verbPairCounts(analyses: Analysis[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const a of analyses) {
    if (!a.verb) continue;
    const key = `${a.verb}|${a.p}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** The record for one analysed sentence. `w` keeps only the words whose meaning the English actually contains. */
export function sentenceRecord(
  analysis: Analysis,
  ja: Segment[],
  en: string,
  meanings: Map<string, string[]>,
  pairs: Map<string, number>,
): PackSentence {
  return {
    ja,
    at: analysis.at,
    p: analysis.p,
    en,
    also: alsoCorrect(analysis.p, analysis.verb, pairs),
    w: analysis.ids.filter((id) => meaningIn(en, meanings.get(id) ?? [])),
  };
}
