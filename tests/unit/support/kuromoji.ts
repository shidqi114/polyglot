import { createRequire } from "node:module";
import path from "node:path";
import kuromoji from "kuromoji";
import { toRomaji } from "wanakana";

export type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

/** kuromoji with the IPADIC dictionary, the same one the build uses for furigana. */
export function loadTokenizer(): Promise<Tokenizer> {
  const dicPath = path.join(path.dirname(createRequire(import.meta.url).resolve("kuromoji/package.json")), "dict");
  return new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath }).build((err, t) => (err ? reject(err) : resolve(t))),
  );
}

/** The reading kuromoji gives for Japanese, with each piece tokenised on its own. */
export function readingOf(tokenizer: Tokenizer, pieces: string[]): string {
  return pieces
    .flatMap((piece) => tokenizer.tokenize(piece))
    .map((t) => t.reading ?? t.surface_form)
    .join("");
}

/**
 * A form of Japanese that compares readings but not long-vowel spelling: dictionaries write ハンバーグ as
 * ハンバアグ and ノート as ノウト, and both are fine. Kanji are kept, so a word the tokenizer cannot read still fails.
 */
export function canonicalReading(text: string): string {
  // The long-vowel mark is dropped first: wanakana romanises it inconsistently, and collapsing vowels covers it anyway.
  const kana = text.replace(/[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu, "");
  return toRomaji(kana).replace(/ou/g, "oo").replace(/([aeiou])\1/g, "$1");
}
