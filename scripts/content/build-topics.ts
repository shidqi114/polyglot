// Writes src/content/generated/word-types.json for the N5 and N4 vocabulary (`npm run topics`).
// No network: kuromoji and IPADIC are already installed, and the output is the same on every run.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import kuromoji from "kuromoji";
import { WORD_TYPE_OVERRIDES } from "./word-type-overrides";
import { buildWordTypes, headwordOf, verbGlossMismatches, type Token, type VocabEntry } from "./word-types";

const ROOT = process.cwd();
const LEVELS = ["n5", "n4"] as const;

async function loadTokenizer(): Promise<{ tokenize(text: string): Token[] }> {
  const dicPath = path.join(path.dirname(createRequire(import.meta.url).resolve("kuromoji/package.json")), "dict");
  return new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath }).build((err, t) => (err ? reject(err) : resolve(t as never))),
  );
}

async function main() {
  const tokenizer = await loadTokenizer();
  const entries: VocabEntry[] = [];
  for (const level of LEVELS) {
    const file = path.join(ROOT, "src/content/generated", `vocab-${level}.json`);
    entries.push(...(JSON.parse(await readFile(file, "utf8")) as VocabEntry[]));
  }
  const types = buildWordTypes(entries, (t) => tokenizer.tokenize(t), WORD_TYPE_OVERRIDES);
  const sorted = Object.fromEntries(Object.entries(types).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  const outDir = path.join(ROOT, "src/content/generated");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "word-types.json"), JSON.stringify(sorted, null, 1) + "\n");

  const counts: Record<string, number> = {};
  for (const t of Object.values(types)) counts[t] = (counts[t] ?? 0) + 1;
  console.log(`word types for ${entries.length} words:`, JSON.stringify(counts));
  const review = verbGlossMismatches(entries, types);
  if (review.length) console.log(`gloss says "to …" but not verb (add an override if wrong): ${review.map(headwordOf).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
