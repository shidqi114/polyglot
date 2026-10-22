/**
 * Downloads open JLPT vocabulary + kanji datasets and converts them into the
 * compact JSON files under src/content/generated. The output is committed so
 * that deploys never depend on these upstream URLs being reachable.
 *
 * Sources
 * - Vocabulary: jamsinclair/open-anki-jlpt-decks (MIT), based on Jonathan
 *   Waller's JLPT lists (tanos.co.uk) with JMdict meanings.
 * - Kanji: davidluzgouveia/kanji-data (MIT scripts; KANJIDIC data is
 *   CC BY-SA 4.0 by the EDRDG). WaniKani fields are intentionally dropped.
 *
 * Run with: npm run content
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const LEVELS = ["n5", "n4", "n3", "n2", "n1"] as const;
type Level = (typeof LEVELS)[number];

const VOCAB_URL = (level: Level) =>
  `https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/${level}.csv`;
const KANJI_URL = "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json";

const OUT_DIR = path.join(process.cwd(), "src/content/generated");

interface RawKanji {
  strokes: number;
  freq: number | null;
  jlpt_new: number | null;
  meanings: string[];
  readings_on: string[];
  readings_kun: string[];
}

export interface VocabEntry {
  id: string;
  w: string; // written form
  r: string; // reading (kana)
  m: string[]; // English meanings
}

export interface KanjiEntry {
  id: string;
  c: string; // character
  m: string[];
  on: string[];
  kun: string[];
  s: number; // strokes
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((f) => f.length)) rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Splits "to meet, to see; to encounter (a person)" into separate meanings,
 * without breaking on commas inside parentheses. */
export function splitMeanings(raw: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of raw) {
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if ((ch === "," || ch === ";") && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  const seen = new Set<string>();
  return out
    .map((m) => m.trim())
    .filter((m) => m && !seen.has(m.toLowerCase()) && seen.add(m.toLowerCase()))
    .slice(0, 5);
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

function vocabOrderScore(tags: string, word: string, kanjiFreq: Map<string, number>): number {
  const genki = tags.match(/Genki_Ln\.(\d+)/);
  if (genki) return Number(genki[1]);
  const ij = tags.match(/Intermediate_Japanese_Ln\.(\d+)/);
  if (ij) return 25 + Number(ij[1]);
  // Otherwise order by how common the word's kanji are (kana-only words in the middle).
  const freqs = [...word].map((c) => kanjiFreq.get(c)).filter((f): f is number => f != null);
  const avg = freqs.length ? freqs.reduce((a, b) => a + b, 0) / freqs.length : 600;
  return 50 + avg / 10;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const kanjiRaw = JSON.parse(await fetchText(KANJI_URL)) as Record<string, RawKanji>;
  const kanjiFreq = new Map<string, number>();
  for (const [c, k] of Object.entries(kanjiRaw)) kanjiFreq.set(c, k.freq ?? 3000);

  const seen = new Set<string>();
  const counts: Record<string, { vocab: number; kanji: number }> = {};

  for (const level of LEVELS) {
    const rows = parseCsv(await fetchText(VOCAB_URL(level)));
    const header = rows.shift()!;
    const col = (name: string) => header.indexOf(name);
    const [iw, ir, im, it] = ["expression", "reading", "meaning", "tags"].map(col);

    const scored: { e: VocabEntry; score: number; idx: number }[] = [];
    rows.forEach((row, idx) => {
      const w = row[iw]?.trim();
      const r = row[ir]?.trim() || w;
      const m = splitMeanings(row[im] ?? "");
      if (!w || !m.length) return;
      const key = `${w}|${r}`;
      if (seen.has(key)) return;
      seen.add(key);
      const id = `v:${w}:${r}`.replace(/\//g, "／");
      scored.push({ e: { id, w, r, m }, score: vocabOrderScore(row[it] ?? "", w, kanjiFreq), idx });
    });
    scored.sort((a, b) => a.score - b.score || a.idx - b.idx);
    const vocab = scored.map((s) => s.e);

    const levelNum = Number(level[1]);
    const kanji: KanjiEntry[] = Object.entries(kanjiRaw)
      .filter(([, k]) => k.jlpt_new === levelNum)
      .sort(([, a], [, b]) => (a.freq ?? 3000) - (b.freq ?? 3000))
      .map(([c, k]) => ({
        id: `j:${c}`,
        c,
        m: k.meanings.filter((m) => !/radical \(no\./i.test(m)).slice(0, 4),
        on: k.readings_on.slice(0, 4),
        kun: k.readings_kun
          .map((r) => r.replace(/-/g, "").replace(/\.(.+)$/, "($1)"))
          .filter((r, i, a) => r && a.indexOf(r) === i)
          .slice(0, 4),
        s: k.strokes,
      }))
      .filter((k) => k.m.length);

    await writeFile(path.join(OUT_DIR, `vocab-${level}.json`), JSON.stringify(vocab));
    await writeFile(path.join(OUT_DIR, `kanji-${level}.json`), JSON.stringify(kanji));
    counts[level] = { vocab: vocab.length, kanji: kanji.length };
    console.log(`${level}: ${vocab.length} words, ${kanji.length} kanji`);
  }

  await writeFile(path.join(OUT_DIR, "counts.json"), JSON.stringify(counts, null, 2) + "\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
