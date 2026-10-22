// Builds the offline knowledge packs in public/packs/v1 from open datasets.
//
// Sources, fetched once into .cache/packs (git ignores it):
//  - Kanjium (mifunetoshiro/kanjium, CC BY-SA 4.0): annotated sentences with furigana, conjugation tables,
//    kanji components and look-alikes, synonyms, proverbs, four-character idioms, pitch accents, radical names.
//  - Tatoeba sentence pairs as shipped in Kanjium's particles.txt (CC BY 2.0 FR).
//  - KanjiVG (CC BY-SA 3.0): stroke-order paths for the JLPT kanji.
//  - kuromoji with IPADIC: furigana for sentences that have none.
//
// Run: npm run packs. Behind an HTTP proxy, prefix with NODE_USE_ENV_PROXY=1.
import { DatabaseSync } from "node:sqlite";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import kuromoji from "kuromoji";

type Segment = string | [string, string];
type Level = "n5" | "n4" | "n3" | "n2" | "n1";

const LEVELS: Level[] = ["n5", "n4", "n3", "n2", "n1"];
const LEVEL_NUMBER: Record<Level, number> = { n5: 5, n4: 4, n3: 3, n2: 2, n1: 1 };
const ROOT = process.cwd();
const CACHE = path.join(ROOT, ".cache/packs");
const OUT = path.join(ROOT, "public/packs/v1");
const KANJIUM = "https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/";
const KANJIVG = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
const EXAMPLES_PER_WORD = 3;
const MAX_SENTENCE_CHARS = 80;

async function fetchCached(url: string, file: string): Promise<Buffer> {
  try {
    return await readFile(file);
  } catch {
    // not cached yet
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  return buf;
}

const stripTags = (s: string) => s.replace(/<[^>]*>/g, "");

function pushText(out: Segment[], text: string) {
  if (!text) return;
  const last = out[out.length - 1];
  if (typeof last === "string") out[out.length - 1] = last + text;
  else out.push(text);
}

const RUBY = /<ruby><rb>(.*?)<\/rb><rp>\(<\/rp><rt>(.*?)<\/rt><rp>\)<\/ruby>/g;

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
function sliceSegments(pieces: { text: string; ruby?: string }[], from: number, to: number): Segment[] {
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

const plainOf = (segments: Segment[]) => segments.map((s) => (typeof s === "string" ? s : s[0])).join("");

const KANJI = /[㐀-鿿豈-﫿々]/;
const katakanaToHiragana = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

function kuromojiSegments(tokenizer: { tokenize(text: string): { surface_form: string; reading?: string }[] }, text: string): Segment[] {
  const out: Segment[] = [];
  for (const token of tokenizer.tokenize(text)) {
    const reading = token.reading ? katakanaToHiragana(token.reading) : undefined;
    if (reading && KANJI.test(token.surface_form) && reading !== token.surface_form) out.push([token.surface_form, reading]);
    else pushText(out, token.surface_form);
  }
  return out;
}

function buildTokenizer(): Promise<{ tokenize(text: string): { surface_form: string; reading?: string }[] }> {
  const dicPath = path.join(path.dirname(require.resolve("kuromoji/package.json")), "dict");
  return new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath }).build((err, tokenizer) => (err ? reject(err) : resolve(tokenizer))),
  );
}

interface VocabEntry {
  id: string;
  w: string;
  r: string;
  m: string[];
}
interface KanjiEntry {
  id: string;
  c: string;
  m: string[];
}
interface PoolSentence {
  plain: string;
  en: string;
  ruby?: Segment[];
  annotated: boolean;
}

const readJson = async <T>(file: string): Promise<T> => JSON.parse(await readFile(file, "utf8")) as T;

async function main() {
  // 1. Sources
  const dbFile = await fetchCached(KANJIUM + "kanjidb.sqlite", path.join(CACHE, "kanjidb.sqlite"));
  const accentsText = (await fetchCached(KANJIUM + "source_files/raw/accents.txt", path.join(CACHE, "accents.txt"))).toString("utf8");
  const particlesText = (await fetchCached(KANJIUM + "source_files/raw/particles.txt", path.join(CACHE, "particles.txt"))).toString("utf8");

  const db = new DatabaseSync(path.join(CACHE, "kanjidb.sqlite"));
  void dbFile; // the file is read from the cache path above
  const sqlAll = <T>(sql: string) => db.prepare(sql).all() as T[];

  // 2. Our word and kanji lists (ids must match the bundled course data)
  const vocab: Record<Level, VocabEntry[]> = {} as Record<Level, VocabEntry[]>;
  const kanji: Record<Level, KanjiEntry[]> = {} as Record<Level, KanjiEntry[]>;
  for (const level of LEVELS) {
    vocab[level] = await readJson<VocabEntry[]>(path.join(ROOT, `src/content/generated/vocab-${level}.json`));
    kanji[level] = await readJson<KanjiEntry[]>(path.join(ROOT, `src/content/generated/kanji-${level}.json`));
  }
  const kanjiLevel = new Map<string, number>();
  for (const level of LEVELS) for (const k of kanji[level]) kanjiLevel.set(k.c, LEVEL_NUMBER[level]);

  // 3. Lookup tables from Kanjium
  const pitch = new Map<string, number[]>();
  for (const line of accentsText.split("\n")) {
    const [word, reading, positions] = line.split("\t");
    // Positions can carry part-of-speech labels, e.g. "(副)1,(形動)0". Keep the accent numbers only.
    const accents = [...new Set((positions ?? "").replace(/\([^)]*\)/g, "").split(",").map((x) => x.trim()).filter((x) => /^\d+$/.test(x)).map(Number))];
    if (word && reading && accents.length) pitch.set(`${word}\t${reading}`, accents);
  }
  const conjugations = new Map<string, Record<string, unknown>>();
  for (const row of sqlAll<Record<string, unknown>>("select * from conjugations")) {
    if (typeof row.plain === "string") conjugations.set(row.plain, row);
  }
  const kanjiRows = new Map<string, Record<string, unknown>>();
  for (const row of sqlAll<Record<string, unknown>>("select kanji, radical, phonetic from kanjidict")) {
    if (typeof row.kanji === "string") kanjiRows.set(row.kanji, row);
  }
  const elementRows = new Map<string, Record<string, unknown>>();
  for (const row of sqlAll<Record<string, unknown>>("select kanji, kanji_parts from elements")) {
    if (typeof row.kanji === "string") elementRows.set(row.kanji, row);
  }
  const lookalikes = new Map<string, string>();
  for (const row of sqlAll<{ kanji: string; similar: string }>("select kanji, similar from lookalikes")) lookalikes.set(row.kanji, row.similar);
  const synonyms = new Map<string, string>();
  for (const row of sqlAll<{ kanji: string; synonyms: string }>("select kanji, synonyms from synonyms")) synonyms.set(row.kanji, row.synonyms);
  const antonyms = new Map<string, string>();
  for (const row of sqlAll<{ kanji: string; antonyms: string }>("select kanji, antonyms from antonyms")) antonyms.set(row.kanji, row.antonyms);
  const radicalNames = new Map<string, { names: string; meaning: string }>();
  for (const row of sqlAll<{ radical: string; names: string; meaning: string }>("select radical, names, meaning from radicals")) {
    radicalNames.set(row.radical, { names: row.names, meaning: row.meaning });
  }

  // 4. Sentence pool: Kanjium (annotated, with furigana) and Tatoeba pairs (plain)
  const pool: PoolSentence[] = [];
  for (const row of sqlAll<{ japanese: string; english: string }>("select japanese, english from sentences")) {
    const ruby = row.japanese.includes("<ruby>") ? rubyToSegments(row.japanese) : undefined;
    const plain = ruby ? plainOf(ruby) : stripTags(row.japanese);
    const en = stripTags(row.english).trim();
    if (plain && en) pool.push({ plain, en, ruby, annotated: true });
  }
  for (const line of particlesText.split("\n")) {
    const cols = line.split("\t");
    const plain = (cols[1] ?? "").trim();
    const en = (cols[2] ?? "").trim();
    if (plain && en) pool.push({ plain, en, annotated: false });
  }
  const bigrams = new Map<string, number[]>();
  pool.forEach((s, i) => {
    const seen = new Set<string>();
    for (let j = 0; j + 1 < s.plain.length; j++) {
      const gram = s.plain.slice(j, j + 2);
      if (seen.has(gram)) continue;
      seen.add(gram);
      let list = bigrams.get(gram);
      if (!list) bigrams.set(gram, (list = []));
      list.push(i);
    }
  });
  console.log(`sentence pool: ${pool.length} (${pool.filter((s) => s.annotated).length} annotated)`);

  let tokenizer: Awaited<ReturnType<typeof buildTokenizer>> | undefined;
  const furigana = async (s: PoolSentence): Promise<Segment[]> => {
    if (s.ruby) return s.ruby;
    tokenizer ??= await buildTokenizer();
    return kuromojiSegments(tokenizer, s.plain);
  };

  /** Chooses the examples for one word: short, sentences that use only words the learner should know by now. */
  const examplesFor = (word: string, level: number): PoolSentence[] => {
    const candidates = word.length >= 2 ? bigrams.get(word.slice(0, 2)) ?? [] : pool.map((_, i) => i);
    const scored: { s: PoolSentence; score: number }[] = [];
    const seen = new Set<string>();
    for (const i of candidates) {
      const s = pool[i];
      if (s.plain.length > MAX_SENTENCE_CHARS || seen.has(s.plain) || standaloneIndex(s.plain, word) < 0) continue;
      seen.add(s.plain);
      let hard = 0;
      for (const ch of s.plain) {
        if (!KANJI.test(ch)) continue;
        const lvl = kanjiLevel.get(ch);
        if (lvl === undefined || lvl < level) hard++; // unknown, or harder than this word's level
      }
      const length = s.plain.length <= 25 ? 2 : s.plain.length <= 40 ? 1 : 0;
      const score = (s.annotated ? 2 : 0) + length - 0.5 * hard - (hard > 3 ? 2 : 0);
      if (score >= -1) scored.push({ s, score });
    }
    scored.sort((a, b) => b.score - a.score || a.s.plain.length - b.s.plain.length);
    return scored.slice(0, EXAMPLES_PER_WORD).map((x) => x.s);
  };

  // 5. Stroke data (KanjiVG) for every JLPT kanji
  const allKanji = LEVELS.flatMap((level) => kanji[level].map((k) => k.c));
  const strokes = new Map<string, string[]>();
  const hexOf = (c: string) => c.codePointAt(0)!.toString(16).padStart(5, "0");
  let cursor = 0;
  const workers = Array.from({ length: 8 }, async () => {
    while (cursor < allKanji.length) {
      const c = allKanji[cursor++];
      try {
        const svg = (await fetchCached(`${KANJIVG}${hexOf(c)}.svg`, path.join(CACHE, "kanjivg", `${hexOf(c)}.svg`))).toString("utf8");
        const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1].replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1)));
        if (paths.length) strokes.set(c, paths);
      } catch {
        // no stroke data for this character
      }
    }
  });
  await Promise.all(workers);
  console.log(`stroke data: ${strokes.size} of ${allKanji.length} kanji`);

  // 6. Write the levels
  await mkdir(OUT, { recursive: true });
  const manifest: Record<string, unknown> = { version: 1, generatedAt: new Date().toISOString(), levels: {} };
  for (const level of LEVELS) {
    const words: unknown[] = [];
    let withExamples = 0;
    let withPitch = 0;
    let withConjugation = 0;
    for (const v of vocab[level]) {
      const pitchValue = pitch.get(`${v.w}\t${v.r}`) ?? pitch.get(`${v.r}\t${v.r}`);
      const conj = conjugations.get(v.w) ?? conjugations.get(v.r);
      const examples = [];
      for (const s of examplesFor(v.w, LEVEL_NUMBER[level])) {
        examples.push({ ja: withTargetReading(await furigana(s), v.w, v.r), en: s.en });
      }
      if (examples.length) withExamples++;
      if (pitchValue) withPitch++;
      if (conj) withConjugation++;
      const record: Record<string, unknown> = { id: v.id };
      if (pitchValue) record.pitch = pitchValue;
      if (conj) {
        record.verb = conj.type;
        record.forms = Object.fromEntries(
          Object.entries({
            dict: conj.plain,
            polite: conj.plain_polite,
            neg: conj.plain_neg,
            past: conj.past,
            te: conj.te_form,
            potential: conj.potential,
            passive: conj.passive,
            causative: conj.causative,
            volitional: conj.volitional,
            conditional: conj.conditional,
            imperative: conj.imperative,
          }).filter(([, value]) => typeof value === "string" && value.length > 0),
        );
      }
      if (examples.length) record.ex = examples;
      words.push(record);
    }

    const kanjiRecords: unknown[] = [];
    const strokeRecords: Record<string, string[]> = {};
    for (const k of kanji[level]) {
      const row = kanjiRows.get(k.c);
      const radical = typeof row?.radical === "string" ? row.radical : undefined;
      const phonetic = typeof row?.phonetic === "string" && row.phonetic !== k.c ? row.phonetic : undefined;
      const parts = typeof elementRows.get(k.c)?.kanji_parts === "string" ? String(elementRows.get(k.c)!.kanji_parts).split(",").filter(Boolean) : [];
      const record: Record<string, unknown> = { id: k.id };
      if (radical) {
        record.radical = radical;
        const names = radicalNames.get(radical);
        if (names) {
          record.radicalReading = names.names.split("・")[0];
          record.radicalMeaning = names.meaning;
        }
      }
      if (parts.length) record.parts = parts;
      if (phonetic) record.phonetic = phonetic;
      if (lookalikes.has(k.c)) record.lookalikes = lookalikes.get(k.c)!.split(",").filter(Boolean);
      if (synonyms.has(k.c)) record.syn = synonyms.get(k.c)!.split(",").filter(Boolean);
      if (antonyms.has(k.c)) record.ant = antonyms.get(k.c)!.split(",").filter(Boolean);
      kanjiRecords.push(record);
      if (strokes.has(k.c)) strokeRecords[k.id] = strokes.get(k.c)!;
    }

    await mkdir(path.join(OUT, level), { recursive: true });
    await writeFile(path.join(OUT, level, "words.json"), JSON.stringify(words));
    await writeFile(path.join(OUT, level, "kanji.json"), JSON.stringify(kanjiRecords));
    await writeFile(path.join(OUT, level, "strokes.json"), JSON.stringify(strokeRecords));
    manifest.levels = { ...(manifest.levels as object), [level]: { words: words.length, withExamples, withPitch, withConjugation, kanji: kanjiRecords.length, withStrokes: Object.keys(strokeRecords).length } };
    console.log(`${level}: ${words.length} words (${withExamples} with examples, ${withPitch} pitch, ${withConjugation} conjugation), ${kanjiRecords.length} kanji`);
  }

  // 7. Proverbs and idioms whose kanji are all JLPT kanji
  const jlptKanji = new Set(allKanji);
  const onlyJlpt = (text: string) => [...text].every((ch) => !KANJI.test(ch) || jlptKanji.has(ch));
  const extras: { kind: string; text: string; reading: string; meaning: string }[] = [];
  for (const row of sqlAll<{ kotowaza: string; reading: string; meaning: string }>("select kotowaza, reading, meaning from kotowaza")) {
    if (row.kotowaza.length <= 30 && onlyJlpt(row.kotowaza)) extras.push({ kind: "proverb", text: row.kotowaza, reading: row.reading, meaning: row.meaning });
  }
  for (const row of sqlAll<{ jukugo: string; reading: string; meaning: string }>("select jukugo, reading, meaning from yojijukugo")) {
    if (onlyJlpt(row.jukugo)) extras.push({ kind: "idiom", text: row.jukugo, reading: row.reading, meaning: row.meaning });
  }
  await writeFile(path.join(OUT, "extras.json"), JSON.stringify(extras));
  manifest.extras = { proverbs: extras.filter((e) => e.kind === "proverb").length, idioms: extras.filter((e) => e.kind === "idiom").length };

  // 8. Manifest with sizes and licences
  manifest.licenses = [
    { name: "Kanjium (examples, conjugations, kanji details, pitch accents, idioms)", licence: "CC BY-SA 4.0", url: "https://github.com/mifunetoshiro/kanjium" },
    { name: "Tatoeba sentence pairs (via Kanjium particles.txt)", licence: "CC BY 2.0 FR", url: "https://tatoeba.org" },
    { name: "KanjiVG stroke order", licence: "CC BY-SA 3.0", url: "https://kanjivg.tagaini.net" },
    { name: "kuromoji with IPADIC (furigana)", licence: "Apache-2.0 / IPADIC licence", url: "https://github.com/takuyaa/kuromoji.js" },
  ];
  const files = [];
  for (const level of LEVELS) for (const f of ["words.json", "kanji.json", "strokes.json"]) files.push(path.join(OUT, level, f));
  files.push(path.join(OUT, "extras.json"));
  let bytes = 0;
  for (const f of files) bytes += (await stat(f)).size;
  manifest.bytes = bytes;
  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`packs written to public/packs/v1: ${(bytes / 1024 / 1024).toFixed(1)} MB raw`);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
