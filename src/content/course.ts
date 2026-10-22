import counts from "./generated/counts.json";
import { GRAMMAR } from "./grammar";
import { KANA_ROWS } from "./kana";
import { LEVELS, type Level, type LessonRef, type Section, type Unit } from "@/lib/types";

export const VOCAB_PER_LESSON = 6;
export const KANJI_PER_LESSON = 4;
const KANA_PER_LESSON = 6;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Splits a row into evenly sized lessons of at most `size` items. */
function evenChunks<T>(arr: T[], size: number): T[][] {
  const n = Math.ceil(arr.length / size);
  const per = Math.ceil(arr.length / n);
  return chunk(arr, per);
}

function kanaSection(): Section {
  const units: Unit[] = [];
  for (const script of ["hiragana", "katakana"] as const) {
    const rows = KANA_ROWS[script];
    const label = script === "hiragana" ? "Hiragana" : "Katakana";
    const groups: { title: string; description: string; rows: number[] }[] = [
      { title: `${label} I`, description: "Vowels, K, S, T and N rows", rows: [0, 1, 2, 3, 4] },
      { title: `${label} II`, description: "H, M, Y, W, N and R rows", rows: [5, 6, 7, 8] },
      { title: `${label} III`, description: "Voiced sounds (゛ ゜)", rows: [9, 10] },
      { title: `${label} IV`, description: "Combination sounds (ゃ ゅ ょ)", rows: [11, 12, 13] },
    ];
    groups.forEach((g, gi) => {
      const lessons: LessonRef[] = [];
      for (const ri of g.rows) {
        const row = rows[ri];
        evenChunks(row.items, KANA_PER_LESSON).forEach((items, ci, all) => {
          lessons.push({
            id: `kana-${script[0]}-${ri}-${ci}`,
            title: all.length > 1 ? `${row.title} ${ci + 1}` : row.title,
            kind: "kana",
            itemIds: items.map((i) => i.id),
          });
        });
      }
      units.push({ id: `kana-${script}-${gi}`, title: g.title, description: g.description, lessons });
    });
  }
  return { id: "kana", title: "Kana", subtitle: "Learn to read hiragana and katakana", units };
}

const LEVEL_INFO: Record<Level, { subtitle: string; vocabPerUnit: number }> = {
  n5: { subtitle: "Basic words, first kanji and core grammar", vocabPerUnit: 5 },
  n4: { subtitle: "Everyday conversations and more kanji", vocabPerUnit: 5 },
  n3: { subtitle: "Bridge to intermediate Japanese", vocabPerUnit: 8 },
  n2: { subtitle: "News, work and general topics", vocabPerUnit: 8 },
  n1: { subtitle: "Advanced vocabulary and kanji", vocabPerUnit: 8 },
};

function levelSection(level: Level): Section {
  const c = (counts as Record<Level, { vocab: number; kanji: number }>)[level];
  const L = level.toUpperCase();
  const vocabLessons: LessonRef[] = [];
  for (let i = 0, n = 1; i < c.vocab; i += VOCAB_PER_LESSON, n++) {
    vocabLessons.push({
      id: `${level}-v-${n}`,
      title: `Words ${n}`,
      kind: "vocab",
      level,
      range: [i, Math.min(i + VOCAB_PER_LESSON, c.vocab)],
    });
  }
  const kanjiLessons: LessonRef[] = [];
  for (let i = 0, n = 1; i < c.kanji; i += KANJI_PER_LESSON, n++) {
    kanjiLessons.push({
      id: `${level}-k-${n}`,
      title: `Kanji ${n}`,
      kind: "kanji",
      level,
      range: [i, Math.min(i + KANJI_PER_LESSON, c.kanji)],
    });
  }
  const grammarLessons: LessonRef[] =
    level === "n5"
      ? GRAMMAR.map((g) => ({ id: `n5-${g.id}`, title: g.title, kind: "grammar", level, grammarId: g.id }))
      : [];

  const vocabUnits = chunk(vocabLessons, LEVEL_INFO[level].vocabPerUnit);
  const kanjiPerUnit = Math.ceil(kanjiLessons.length / vocabUnits.length);
  const units: Unit[] = vocabUnits.map((vocab, ui) => {
    const kanji = kanjiLessons.slice(ui * kanjiPerUnit, (ui + 1) * kanjiPerUnit);
    const grammar = grammarLessons[ui] ? [grammarLessons[ui]] : [];
    const half = Math.ceil(vocab.length / 2);
    return {
      id: `${level}-u${ui + 1}`,
      title: `${L} · Unit ${ui + 1}`,
      description: grammar.length ? `Words, kanji and grammar: ${grammar[0].title}` : kanji.length ? "Words and kanji" : "Words",
      lessons: [...vocab.slice(0, half), ...kanji, ...vocab.slice(half), ...grammar],
    };
  });
  return { id: level, title: `JLPT ${L}`, subtitle: LEVEL_INFO[level].subtitle, units };
}

export const COURSE: Section[] = [kanaSection(), ...LEVELS.map(levelSection)];

export const ALL_LESSONS: LessonRef[] = COURSE.flatMap((s) => s.units.flatMap((u) => u.lessons));
export const LESSON_BY_ID = new Map(ALL_LESSONS.map((l) => [l.id, l]));
export const LESSON_INDEX = new Map(ALL_LESSONS.map((l, i) => [l.id, i]));

export function locateLesson(id: string): { section: Section; unit: Unit } | undefined {
  for (const section of COURSE)
    for (const unit of section.units) if (unit.lessons.some((l) => l.id === id)) return { section, unit };
  return undefined;
}
