// Pure helpers for the knowledge-pack builder, kept free of side effects so tests can import them.
// Kanjium stores ruby (furigana) as <ruby><rb>…</rb><rp>(</rp><rt>…</rt><rp>)</rp></ruby>; the page never receives HTML.

export type Segment = string | [string, string];

export const stripTags = (s: string) => s.replace(/<[^>]*>/g, "");

export function pushText(out: Segment[], text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (typeof last === "string") out[out.length - 1] = last + text;
  else out.push(text);
}

// The closing </rb> is sometimes written without its `<` in Kanjium's data, so that character is optional.
export const RUBY = /<ruby><rb>(.*?)<?\/rb><rp>\(<\/rp><rt>(.*?)<\/rt><rp>\)<\/rp><\/ruby>/g;

/** Turns Kanjium's ruby markup into plain segments. The page never receives HTML from the dataset. */
export function rubyToSegments(html: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  for (const m of html.matchAll(RUBY)) {
    pushText(out, stripTags(html.slice(last, m.index)));
    out.push([stripTags(m[1]), stripTags(m[2])]);
    last = (m.index ?? 0) + m[0].length;
  }
  pushText(out, stripTags(html.slice(last)));
  return out;
}

/** Index of the first occurrence of `word` that is not glued to kanji on a side where the word has kanji.
 * Keeps 今 out of 今日 and 食 out of 食堂, which are different words. */
export function standaloneIndex(plain: string, word: string): number {
  const startsKanji = KANJI.test(word[0]);
  const endsKanji = KANJI.test(word[word.length - 1]);
  let i = plain.indexOf(word);
  while (i >= 0) {
    const before = plain[i - 1] ?? "";
    const after = plain[i + word.length] ?? "";
    if ((!startsKanji || !KANJI.test(before)) && (!endsKanji || !KANJI.test(after))) return i;
    i = plain.indexOf(word, i + 1);
  }
  return -1;
}

/** Segments for the character range [from, to) of a sentence. Ruby is kept only where a piece lies fully inside. */
export function sliceSegments(pieces: { text: string; ruby?: string }[], from: number, to: number): Segment[] {
  const out: Segment[] = [];
  let offset = 0;
  for (const p of pieces) {
    const start = offset;
    const end = offset + p.text.length;
    offset = end;
    const lo = Math.max(start, from);
    const hi = Math.min(end, to);
    if (lo >= hi) continue;
    const text = p.text.slice(lo - start, hi - start);
    if (p.ruby && lo === start && hi === end) out.push([text, p.ruby]);
    else pushText(out, text);
  }
  return out;
}

/** Gives the target word its dictionary reading wherever it occurs; the tokeniser can misread it in context. */
export function withTargetReading(segments: Segment[], word: string, reading: string): Segment[] {
  const pieces = segments.map((s) => (typeof s === "string" ? { text: s } : { text: s[0], ruby: s[1] }));
  const plain = pieces.map((p) => p.text).join("");
  const at = standaloneIndex(plain, word);
  if (at < 0) return segments;
  const out = sliceSegments(pieces, 0, at);
  pushText(out, "");
  out.push(word === reading ? word : [word, reading]);
  for (const seg of sliceSegments(pieces, at + word.length, plain.length)) {
    if (typeof seg === "string") pushText(out, seg);
    else out.push(seg);
  }
  return out;
}

export const plainOf = (segments: Segment[]) => segments.map((s) => (typeof s === "string" ? s : s[0])).join("");

export const KANJI = /[㐀-鿿豈-﫿々]/;
export const katakanaToHiragana = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

export function kuromojiSegments(tokenizer: { tokenize(text: string): { surface_form: string; reading?: string }[] }, text: string): Segment[] {
  const out: Segment[] = [];
  for (const token of tokenizer.tokenize(text)) {
    const reading = token.reading ? katakanaToHiragana(token.reading) : undefined;
    if (reading && KANJI.test(token.surface_form) && reading !== token.surface_form) out.push([token.surface_form, reading]);
    else pushText(out, token.surface_form);
  }
  return out;
}

