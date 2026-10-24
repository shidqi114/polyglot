import { ALL_KANA } from "./kana";
import { loadIndex, loadLevel } from "./loader";
import { PARTICLE_FAMILIES } from "./particles";
import { TOPIC_BY_ID, type TopicId } from "./topics";
import type { PracticeMode } from "@/lib/lesson-engine";
import { particlesPlan, planFor, setItems, topicStudySet, typeStudySet, type SessionPlan, type StudySet } from "@/lib/topic-sessions";
import { LEECH_LAPSES } from "@/lib/weekly";
import type { SrsCard } from "@/lib/srs";
import { LEVELS, type Level, type StudyItem } from "@/lib/types";
import { useProgress } from "@/store/progress";

/** Modes of the study-by-topic sessions. They run in /practice/run like the dojo modes. */
export type TopicMode = "learn" | "practise" | "phrases" | "real" | "particles";
export type SetMode = PracticeMode | TopicMode;

export interface PracticeSet {
  id: string;
  title: string;
  subtitle: string;
  glyph: string;
  modes: SetMode[];
  load: () => Promise<StudyItem[]>;
  /** Builds the exercises for a session that is not a plain practice run (topics and particles). */
  session?: (mode: SetMode) => Promise<SessionPlan>;
  /** Where the session's Quit and Done buttons go. Defaults to the dojo. */
  backHref?: string;
}

export const MODE_INFO: Record<SetMode, { title: string; description: string }> = {
  learn: { title: "Learn", description: "Six new words at a time, with their first questions" },
  practise: { title: "Practise", description: "Fifteen questions on words you have met" },
  phrases: { title: "Key phrases", description: "Hear a phrase and pick its meaning, or build it" },
  real: { title: "Real-life sentences", description: "Fill the gap in a real example sentence" },
  particles: { title: "Particles", description: "Fill in the particle, with the English as a hint" },
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

/** Built from the learner's own cards. Opened from the weekly review, so they are not in the dojo grid. */
const focusSet = (id: string, title: string, subtitle: string, pick: (card: SrsCard) => boolean): PracticeSet => ({
  id,
  title,
  subtitle,
  glyph: "!",
  modes: ["pick", "reverse-pick", "input", "reverse-input"],
  load: async () => {
    const index = await loadIndex();
    const cards = useProgress.getState().cards;
    return [...index.values()].filter((item) => {
      const card = cards[item.id];
      return !!card && pick(card);
    });
  },
});

export const FOCUS_SETS: PracticeSet[] = [
  focusSet("leeches", "Leeches", "Items that keep coming back wrong", (c) => c.lapses >= LEECH_LAPSES),
  focusSet("confusions", "Mix-ups", "Items you picked the wrong answer for", (c) => (c.cf?.length ?? 0) > 0),
];

export const PRACTICE_BY_ID = new Map([...PRACTICE_SETS, ...FOCUS_SETS].map((s) => [s.id, s]));

const STUDY_MODES: SetMode[] = ["learn", "practise", "phrases", "real"];

/** A topic or word-type set, as a practice set. Its words come from the topic lists, not the dojo grid. */
const studySetFor = (set: StudySet): PracticeSet => ({
  id: set.id,
  title: set.title,
  subtitle: set.kind === "topic" ? "Topic" : "Word type",
  glyph: set.kind === "topic" ? "題" : "語",
  modes: set.kind === "topic" ? STUDY_MODES : ["learn", "practise"],
  load: () => setItems(set),
  session: (mode) => planFor(set, mode),
  backHref: `/practice/topics?id=${set.id}`,
});

const particleSet = (family: string): PracticeSet => {
  const title = PARTICLE_FAMILIES.find((f) => f.id === family)?.title ?? "All particles";
  return {
    id: family === "all" ? "particles" : `particles-${family}`,
    title,
    subtitle: "Particles",
    glyph: "は",
    modes: ["particles"],
    load: async () => [],
    session: () => particlesPlan(family === "all" ? undefined : family),
    backHref: "/practice/topics?id=particles",
  };
};

/** The practice set for an id from a URL: the dojo sets, a topic, a word type, or a particle family. */
export function setFor(id: string): PracticeSet | undefined {
  const dojo = PRACTICE_BY_ID.get(id);
  if (dojo) return dojo;
  if (id === "particles") return particleSet("all");
  if (id.startsWith("particles-")) {
    const family = id.slice("particles-".length);
    return PARTICLE_FAMILIES.some((f) => f.id === family) ? particleSet(family) : undefined;
  }
  const topic = TOPIC_BY_ID[id as TopicId];
  if (topic) return studySetFor(topicStudySet(topic));
  const type = typeStudySet(id);
  return type ? studySetFor(type) : undefined;
}

