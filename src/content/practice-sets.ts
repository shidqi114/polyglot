import { ALL_KANA } from "./kana";
import { loadLevel } from "./loader";
import type { PracticeMode } from "@/lib/lesson-engine";
import { LEVELS, type Level, type StudyItem } from "@/lib/types";

export interface PracticeSet {
  id: string;
  title: string;
  subtitle: string;
  glyph: string;
  modes: PracticeMode[];
  load: () => Promise<StudyItem[]>;
}

export const MODE_INFO: Record<PracticeMode, { title: string; description: string }> = {
  pick: { title: "Pick", description: "See Japanese, choose the meaning" },
  "reverse-pick": { title: "Reverse pick", description: "See the meaning, choose the Japanese" },
  input: { title: "Input", description: "See Japanese, type the reading" },
  "reverse-input": { title: "Reverse input", description: "See the meaning, type it in Japanese" },
  sentence: { title: "Sentences", description: "Fill in the blank in an example sentence" },
  conjugation: { title: "Verb forms", description: "Choose the right form of a verb" },
};

const kanaSet = (script: "hiragana" | "katakana", glyph: string): PracticeSet => ({
  id: script,
  title: script === "hiragana" ? "Hiragana" : "Katakana",
  subtitle: "All 104 characters",
  glyph,
  modes: ["pick", "reverse-pick", "input"],
  load: async () => ALL_KANA.filter((k) => k.script === script),
});

const vocabSet = (level: Level): PracticeSet => ({
  id: `vocab-${level}`,
  title: `${level.toUpperCase()} vocabulary`,
  subtitle: "JLPT word list",
  glyph: "語",
  modes: ["pick", "reverse-pick", "input", "reverse-input", "sentence", "conjugation"],
  load: async () => (await loadLevel(level)).vocab,
});

const kanjiSet = (level: Level): PracticeSet => ({
  id: `kanji-${level}`,
  title: `${level.toUpperCase()} kanji`,
  subtitle: "Meanings and readings",
  glyph: "漢",
  modes: ["pick", "reverse-pick", "input"],
  load: async () => (await loadLevel(level)).kanji,
});

export const PRACTICE_SETS: PracticeSet[] = [
  kanaSet("hiragana", "あ"),
  kanaSet("katakana", "ア"),
  ...LEVELS.map(vocabSet),
  ...LEVELS.map(kanjiSet),
];

export const PRACTICE_BY_ID = new Map(PRACTICE_SETS.map((s) => [s.id, s]));
