// Loads the offline knowledge packs written by scripts/content/build-packs.ts (public/packs/v2).
// Files are cached by the service worker, so a downloaded level keeps working offline.
import type { Level } from "@/lib/types";
import type { Particle } from "./particles";

export const PACK_VERSION = "v2";
export const PACK_CACHE = `knowledge-packs-${PACK_VERSION}`;

export type Segment = string | [string, string];
export interface PackExample {
  ja: Segment[];
  en: string;
}
/** A sentence with one particle blanked (sentences.json, N5 and N4 only). `at` is the particle's offset in the plain text. */
export interface PackSentence {
  ja: Segment[];
  at: number;
  p: Particle;
  en: string;
  /** Particles that also fit the blank. Never offered as wrong choices. */
  also: Particle[];
  /** Vocabulary ids whose meaning appears in the English. Used to pick sentences for a topic. */
  w: string[];
}
export type VerbForm = "dict" | "polite" | "neg" | "past" | "te" | "potential" | "passive" | "causative" | "volitional" | "conditional" | "imperative";
export interface PackWord {
  id: string;
  pitch?: number[];
  verb?: string;
  forms?: Partial<Record<VerbForm, string>>;
  ex?: PackExample[];
}
export interface PackKanji {
  id: string;
  radical?: string;
  radicalReading?: string;
  radicalMeaning?: string;
  parts?: string[];
  phonetic?: string;
  lookalikes?: string[];
  syn?: string[];
  ant?: string[];
}
export interface PackExtra {
  kind: "proverb" | "idiom";
  text: string;
  reading: string;
  meaning: string;
}
export interface PackManifest {
  version: number;
  generatedAt: string;
  bytes: number;
  levels: Record<Level, { words: number; withExamples: number; withPitch: number; withConjugation: number; kanji: number; withStrokes: number }>;
  extras: { proverbs: number; idioms: number };
  licenses: { name: string; licence: string; url: string }[];
}

const base = (...parts: string[]) => `/packs/${PACK_VERSION}/${parts.join("/")}`;

/** URLs of the files that make up one level, for offline download. */
export const levelFiles = (level: Level) => [
  base(level, "words.json"),
  base(level, "kanji.json"),
  base(level, "strokes.json"),
  ...(level === "n5" || level === "n4" ? [base(level, "sentences.json")] : []),
];
export const sharedFiles = () => [base("manifest.json"), base("extras.json")];

const cache = new Map<string, Promise<unknown>>();

function getJson<T>(url: string): Promise<T> {
  let pending = cache.get(url) as Promise<T> | undefined;
  if (!pending) {
    pending = fetch(url).then(async (res) => {
      if (!res.ok) throw new Error(`Could not load study content (${res.status}).`);
      return (await res.json()) as T;
    });
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}

export const loadManifest = () => getJson<PackManifest>(base("manifest.json"));
export const loadExtras = () => getJson<PackExtra[]>(base("extras.json"));
export const loadStrokes = (level: Level) => getJson<Record<string, string[]>>(base(level, "strokes.json"));
/** Particle sentences for the drills; only N5 and N4 have them. */
export const loadSentences = (level: Level) => getJson<PackSentence[]>(base(level, "sentences.json"));

export async function loadWords(level: Level): Promise<Map<string, PackWord>> {
  const list = await getJson<PackWord[]>(base(level, "words.json"));
  return new Map(list.map((w) => [w.id, w]));
}

export async function loadKanji(level: Level): Promise<Map<string, PackKanji>> {
  const list = await getJson<PackKanji[]>(base(level, "kanji.json"));
  return new Map(list.map((k) => [k.id, k]));
}

/** Plain text of a segment list (furigana removed). */
export const segmentsText = (segments: Segment[]) => segments.map((s) => (typeof s === "string" ? s : s[0])).join("");
