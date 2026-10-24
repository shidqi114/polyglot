export type Level = "n5" | "n4" | "n3" | "n2" | "n1";
export const LEVELS: Level[] = ["n5", "n4", "n3", "n2", "n1"];

export type ItemKind = "kana" | "vocab" | "kanji";

/** Japanese with furigana: plain text, or [kanji, reading] for a word that has a reading written above it. */
export type RubySegment = string | [string, string];

/** A single learnable thing, normalised across kana, vocabulary and kanji. */
export interface StudyItem {
  id: string;
  kind: ItemKind;
  /** What is shown in Japanese (kana character, word, or kanji). */
  front: string;
  /** Reading in kana (kana: the kana itself, kanji: primary reading). */
  reading: string;
  /** Answers in English (vocab/kanji) or romaji (kana). First is primary. */
  meanings: string[];
  script?: "hiragana" | "katakana";
  on?: string[];
  kun?: string[];
  strokes?: number;
  level?: Level;
}

export interface GrammarSentence {
  /** Japanese split into tiles (words/particles). */
  tiles: string[];
  /** Full reading in hiragana, shown as a hint and used for audio. */
  kana: string;
  en: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  /** Short explanation shown before the exercises. Lines starting with "• " render as bullets. */
  notes: string[];
  examples: { jp: string; en: string }[];
  sentences: GrammarSentence[];
}

export type LessonKind = "kana" | "vocab" | "kanji" | "grammar";

export interface LessonRef {
  id: string;
  title: string;
  kind: LessonKind;
  level?: Level;
  /** kana item ids for kana lessons */
  itemIds?: string[];
  /** [start, end) into the level's ordered vocab/kanji list */
  range?: [number, number];
  grammarId?: string;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: LessonRef[];
}

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  units: Unit[];
}

export interface ChoiceOption {
  label: string;
  sub?: string;
  correct: boolean;
}

export type Exercise =
  | { type: "intro"; key: string; item: StudyItem }
  | { type: "note"; key: string; lesson: GrammarLesson }
  | {
      type: "choice";
      key: string;
      itemId?: string;
      question: string;
      prompt?: string;
      /** The prompt with furigana, when the question is Japanese text with readings. */
      promptRuby?: RubySegment[];
      promptSub?: string;
      /** Japanese text to speak; when audioOnly the prompt text is hidden. */
      audio?: string;
      audioOnly?: boolean;
      optionsJapanese: boolean;
      options: ChoiceOption[];
      answer: string;
    }
  | {
      type: "input";
      key: string;
      itemId?: string;
      question: string;
      prompt: string;
      promptSub?: string;
      audio?: string;
      /** kana: user types romaji converted to kana; romaji: user types romaji; english: free text */
      mode: "kana" | "romaji" | "english";
      answers: string[];
      answer: string;
    }
  | { type: "match"; key: string; pairs: { id: string; left: string; right: string }[] }
  | {
      type: "build";
      key: string;
      en: string;
      kana: string;
      answer: string[];
      tiles: string[];
    };

export type GradedExercise = Exclude<Exercise, { type: "intro" } | { type: "note" }>;
