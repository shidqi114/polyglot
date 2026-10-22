import { ALL_KANA, KANA_BY_ID } from "./kana";
import { LEVELS, type LessonRef, type Level, type StudyItem } from "@/lib/types";

interface RawVocab {
  id: string;
  w: string;
  r: string;
  m: string[];
}
interface RawKanji {
  id: string;
  c: string;
  m: string[];
  on: string[];
  kun: string[];
  s: number;
}

export interface LevelData {
  vocab: StudyItem[];
  kanji: StudyItem[];
}

const cache = new Map<Level, Promise<LevelData>>();

function vocabItem(v: RawVocab, level: Level): StudyItem {
  return { id: v.id, kind: "vocab", front: v.w, reading: v.r, meanings: v.m, level };
}

function kanjiItem(k: RawKanji, level: Level): StudyItem {
  return {
    id: k.id,
    kind: "kanji",
    front: k.c,
    reading: k.kun[0]?.replace(/\(.*\)/, "") || k.on[0] || "",
    meanings: k.m.map((m) => m.toLowerCase()),
    on: k.on,
    kun: k.kun,
    strokes: k.s,
    level,
  };
}

export function loadLevel(level: Level): Promise<LevelData> {
  let p = cache.get(level);
  if (!p) {
    p = Promise.all([
      import(`./generated/vocab-${level}.json`).then((m) => m.default as RawVocab[]),
      import(`./generated/kanji-${level}.json`).then((m) => m.default as RawKanji[]),
    ]).then(([v, k]) => ({ vocab: v.map((x) => vocabItem(x, level)), kanji: k.map((x) => kanjiItem(x, level)) }));
    p.catch(() => cache.delete(level));
    cache.set(level, p);
  }
  return p;
}

let indexPromise: Promise<Map<string, StudyItem>> | null = null;

/** Loads every level and returns an id → item index (kana included). */
export function loadIndex(): Promise<Map<string, StudyItem>> {
  if (!indexPromise) {
    indexPromise = Promise.all(LEVELS.map(loadLevel)).then((levels) => {
      const map = new Map<string, StudyItem>(KANA_BY_ID);
      for (const l of levels) for (const it of [...l.vocab, ...l.kanji]) map.set(it.id, it);
      return map;
    });
    indexPromise.catch(() => (indexPromise = null));
  }
  return indexPromise;
}

export async function getItems(ids: string[]): Promise<StudyItem[]> {
  if (ids.every((id) => KANA_BY_ID.has(id))) return ids.map((id) => KANA_BY_ID.get(id)!);
  const index = await loadIndex();
  return ids.map((id) => index.get(id)).filter((x): x is StudyItem => !!x);
}

/** The lesson's new items plus a pool of same-kind items for distractors. */
export async function getLessonItems(lesson: LessonRef): Promise<{ items: StudyItem[]; pool: StudyItem[] }> {
  if (lesson.kind === "kana") {
    const items = lesson.itemIds!.map((id) => KANA_BY_ID.get(id)!);
    const script = items[0].script;
    // Distractors only from characters taught so far, so early lessons stay approachable.
    const last = Math.max(...items.map((i) => ALL_KANA.indexOf(i)));
    return { items, pool: ALL_KANA.slice(0, last + 1).filter((k) => k.script === script) };
  }
  if (lesson.kind === "grammar") return { items: [], pool: [] };
  const data = await loadLevel(lesson.level!);
  const list = lesson.kind === "vocab" ? data.vocab : data.kanji;
  const [start, end] = lesson.range!;
  // Distractors come from nearby items so they're plausible but not too obscure.
  const poolStart = Math.max(0, start - 60);
  return { items: list.slice(start, end), pool: list.slice(poolStart, Math.min(list.length, end + 60)) };
}
