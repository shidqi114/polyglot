// Morae (sound units) and pitch patterns for Japanese words. A small kana such as ゃ or ぁ joins the mora before it.
// Accent: 0 = flat (heiban); n = the pitch falls after mora n.

const SMALL = /[ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]/;

export function morae(reading: string): string[] {
  const out: string[] = [];
  for (const ch of reading) {
    if (SMALL.test(ch) && out.length) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}

/** High/low pattern of a word with `count` morae in isolation. */
export function pitchPattern(count: number, accent: number): ("H" | "L")[] {
  return Array.from({ length: count }, (_, i) => {
    const mora = i + 1;
    if (accent === 0) return mora === 1 ? "L" : "H";
    if (mora === 1) return accent === 1 ? "H" : "L";
    return mora <= accent ? "H" : "L";
  });
}
