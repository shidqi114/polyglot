// Builds the offline knowledge packs in public/packs/v2 from open datasets.
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

type Level = "n5" | "n4" | "n3" | "n2" | "n1";

const LEVELS: Level[] = ["n5", "n4", "n3", "n2", "n1"];
const LEVEL_NUMBER: Record<Level, number> = { n5: 5, n4: 4, n3: 3, n2: 2, n1: 1 };
const ROOT = process.cwd();
const CACHE = path.join(ROOT, ".cache/packs");
const OUT = path.join(ROOT, "public/packs/v2");
const KANJIUM = "https://raw.githubusercontent.com/mifunetoshiro/kanjium/master/data/";
const KANJIVG = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
const EXAMPLES_PER_WORD = 3;
const SENTENCES_PER_PARTICLE = 300;
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

import { KANJI, kuromojiSegments, plainOf, rubyToSegments, standaloneIndex, stripTags, withTargetReading, type Segment } from "./lib";
import { EXCLUDED_SENTENCES } from "./sentence-exclusions";
import { analyse, blankIsPlain, MAX_PARTICLE_CHARS, sentenceRecord, verbPairCounts, vocabForms, type Analysis, type PackSentence, type Token } from "./sentences";
function buildTokenizer(): Promise<{ tokenize(text: string): Token[] }> {
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
  // Kanjium keeps the ruby in `furigana`; `japanese` is the same sentence without it.
  let rubyMismatch = 0;
  for (const row of sqlAll<{ japanese: string; furigana: string | null; english: string }>("select japanese, furigana, english from sentences")) {
    const ruby = row.furigana?.includes("<ruby>") ? rubyToSegments(row.furigana) : undefined;
    const plain = ruby ? plainOf(ruby) : stripTags(row.japanese);
    if (ruby && plain !== stripTags(row.japanese)) rubyMismatch++;
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
  console.log(`sentence pool: ${pool.length} (${pool.filter((s) => s.annotated).length} annotated, ${rubyMismatch} ruby texts differ from the plain sentence)`);

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

  // 4b. Particle sentences for the drills (N5 and N4): short, every content word known, one particle blanked
  const n5Ids = new Set(vocab.n5.map((v) => v.id));
  const allVocab = [...vocab.n5, ...vocab.n4];
  const forms = vocabForms(allVocab);
  const meanings = new Map(allVocab.map((v) => [v.id, v.m]));
  const tok = (tokenizer ??= await buildTokenizer());
  const analysed: { s: PoolSentence; analysis: Analysis }[] = [];
  for (const s of pool) {
    if (s.plain.length > MAX_PARTICLE_CHARS || s.en.length > 100 || EXCLUDED_SENTENCES.has(s.plain)) continue;
    const tokens = tok.tokenize(s.plain);
    if (tokens.map((t) => t.surface_form).join("") !== s.plain) continue;
    const analysis = analyse(tokens, forms, n5Ids);
    if (analysis) analysed.push({ s, analysis });
  }
  const pairs = verbPairCounts(analysed.map((x) => x.analysis));
  const sentenceFiles: Partial<Record<Level, PackSentence[]>> = {};
  const seenSentences = new Set<string>();
  const candidates: { record: PackSentence; level: Level; score: number }[] = [];
  for (const { s, analysis } of analysed) {
    if (seenSentences.has(s.plain)) continue;
    const ja = s.ruby ?? (await kuromojiSegments(tok, s.plain));
    if (plainOf(ja) !== s.plain || !blankIsPlain(ja, analysis.at)) continue;
    seenSentences.add(s.plain);
    const record = sentenceRecord(analysis, ja, s.en, meanings, pairs);
    const score = (s.annotated ? 2 : 0) + (record.w.length >= 2 ? 1 : 0) + (s.en.length <= 60 ? 1 : 0) - record.also.length;
    candidates.push({ record, level: analysis.level, score });
  }
  for (const level of ["n5", "n4"] as const) {
    const ofLevel = candidates.filter((c) => c.level === level).sort((a, b) => b.score - a.score || a.record.ja.length - b.record.ja.length);
    const perParticle = new Map<string, number>();
    const kept: PackSentence[] = [];
    for (const { record } of ofLevel) {
      const n = perParticle.get(record.p) ?? 0;
      if (n >= SENTENCES_PER_PARTICLE) continue;
      perParticle.set(record.p, n + 1);
      kept.push(record);
    }
    sentenceFiles[level] = kept;
    console.log(`${level} sentences: ${kept.length} (${[...perParticle].map(([p, n]) => `${p} ${n}`).join(", ")})`);
  }

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
    const sentences = sentenceFiles[level];
    if (sentences) await writeFile(path.join(OUT, level, "sentences.json"), JSON.stringify(sentences));
    manifest.levels = { ...(manifest.levels as object), [level]: { words: words.length, withExamples, withPitch, withConjugation, kanji: kanjiRecords.length, withStrokes: Object.keys(strokeRecords).length, sentences: sentences?.length ?? 0 } };
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
  for (const level of LEVELS) if (sentenceFiles[level]) files.push(path.join(OUT, level, "sentences.json"));
  files.push(path.join(OUT, "extras.json"));
  let bytes = 0;
  for (const f of files) bytes += (await stat(f)).size;
  manifest.bytes = bytes;
  await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`packs written to public/packs/v2: ${(bytes / 1024 / 1024).toFixed(1)} MB raw`);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
