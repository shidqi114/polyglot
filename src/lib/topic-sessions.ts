// Sessions behind the topic pages: Learn, Practise, Key phrases, Real-life sentences and Particles. Each builds the
// exercises for one run in /practice/run. A Learn run also says which lesson to record when it ends.
import wordTypes from "@/content/generated/word-types.json";
import { GRAMMAR } from "@/content/grammar";
import { GRAMMAR_N4 } from "@/content/grammar-n4";
import { loadIndex } from "@/content/loader";
import { loadSentences, type PackSentence } from "@/content/packs";
import { TOPIC_BY_ID, type Topic } from "@/content/topics";
import { TOPIC_WORDS } from "@/content/topic-words";
import { hiddenSentences } from "./hidden-sentences";
import { buildItemLesson, buildReviewExercise, distractors, shuffle } from "./lesson-engine";
import {
  blankSpan,
  blankSpanRuby,
  familyItems,
  fromPackSentence,
  particleDrill,
  particleItemsFromGrammar,
  phraseBuildExercise,
  phraseListenExercise,
  plainOf,
  type ParticleItem,
} from "./topic-exercises";
import type { Exercise, StudyItem } from "./types";
import { useProgress } from "@/store/progress";

/** The words a Learn run takes at once, as in a path lesson. */
export const VOCAB_PER_LESSON = 6;
/** Questions in a Practise or Particles run. */
export const SESSION_SIZE = 15;
/** Fill-in questions in a Real-life sentences run. */
const REAL_SIZE = 12;

export interface SessionPlan {
  exercises: Exercise[];
  /** For a Learn run: the lesson to record when it ends, and the words it covers. */
  lesson?: { id: string; items: StudyItem[] };
  /** Shown instead of the exercises when there is nothing to study yet. */
  message?: string;
}

/** A group of words studied together: a topic, or a word type. */
export interface StudySet {
  /** Used in URLs and as the lesson id (`t-<id>`). Never rename one: progress is stored under it. */
  id: string;
  title: string;
  kind: "topic" | "type";
  topic?: Topic;
  /** Word types that make up this set (only for kind "type"). */
  types?: string[];
}

/** Word types grouped as the Study by topic page shows them. Counts are N5 and N4 words. */
export const WORD_TYPE_SETS: { id: string; title: string; types: string[] }[] = [
  { id: "type-noun", title: "Nouns", types: ["noun"] },
  { id: "type-verb", title: "Verbs", types: ["verb"] },
  { id: "type-i-adjective", title: "い-adjectives", types: ["i-adjective"] },
  { id: "type-na-adjective", title: "な-adjectives", types: ["na-adjective"] },
  { id: "type-adverb", title: "Adverbs and linking words", types: ["adverb", "set-phrase"] },
  { id: "type-pronoun", title: "Question and pointing words", types: ["pronoun"] },
  { id: "type-number", title: "Numbers and counters", types: ["number", "counter"] },
];

const TYPES = wordTypes as Record<string, string>;

export const topicStudySet = (topic: Topic): StudySet => ({ id: topic.id, title: topic.title, kind: "topic", topic });

export function typeStudySet(id: string): StudySet | undefined {
  const group = WORD_TYPE_SETS.find((g) => g.id === id);
  return group ? { id: group.id, title: group.title, kind: "type", types: group.types } : undefined;
}

/** The vocabulary items of a set, in course order (N5 first). */
export async function setItems(set: StudySet): Promise<StudyItem[]> {
  const index = await loadIndex();
  if (set.kind === "topic") {
    return TOPIC_WORDS[set.id as keyof typeof TOPIC_WORDS].map((id) => index.get(id)).filter((i): i is StudyItem => !!i);
  }
  const types = new Set(set.types);
  return [...index.values()].filter((i) => i.kind === "vocab" && types.has(TYPES[i.id]));
}

const learnedIn = (items: StudyItem[]) => {
  const cards = useProgress.getState().cards;
  return items.filter((i) => !!cards[i.id]);
};

/** Learn: the next words the learner has not met, as a path lesson, which records a lesson `t-<id>` when it ends. */
export async function learnPlan(set: StudySet): Promise<SessionPlan> {
  const items = await setItems(set);
  const learned = new Set(learnedIn(items).map((i) => i.id));
  const batch = items.filter((i) => !learned.has(i.id)).slice(0, VOCAB_PER_LESSON);
  if (!batch.length) return { exercises: [], message: "You have met every word in this set. Practise them instead." };
  return { exercises: buildItemLesson(batch, items), lesson: { id: `t-${set.id}`, items: batch } };
}

/** Practise: fifteen mixed questions on the words the learner has met. */
export async function practisePlan(set: StudySet): Promise<SessionPlan> {
  const items = await setItems(set);
  const learned = learnedIn(items);
  if (learned.length < 4) return { exercises: [], message: "Learn a few words in this set first, then come back to practise them." };
  return { exercises: shuffle(learned).slice(0, SESSION_SIZE).map((i) => buildReviewExercise(i, items)) };
}

/** Key phrases: each phrase is heard and its meaning picked, then built from its tiles. */
export function phrasesPlan(topic: Topic): SessionPlan {
  const exercises = shuffle(topic.phrases).flatMap((phrase) => {
    const others = topic.phrases.filter((p) => p !== phrase);
    return [phraseListenExercise(phrase, others), phraseBuildExercise(phrase, others)];
  });
  return { exercises };
}

/** The study-pack sentences for both levels, or null when they are not saved and cannot be loaded. */
async function packSentences(): Promise<{ level: "n5" | "n4"; s: PackSentence }[] | null> {
  try {
    const [n5, n4] = await Promise.all([loadSentences("n5"), loadSentences("n4")]);
    return [...n5.map((s) => ({ level: "n5" as const, s })), ...n4.map((s) => ({ level: "n4" as const, s }))];
  } catch {
    return null;
  }
}

/**
 * Real-life sentences: pack sentences that use the topic's words, with the word blanked. The English is the hint,
 * and the other options are words from the same topic.
 */
export async function realPlan(topic: Topic): Promise<SessionPlan> {
  const sentences = await packSentences();
  if (!sentences) return { exercises: [], message: "These sentences come from the study content. Save it for offline on this page, or go online, then try again." };
  const items = await setItems(topicStudySet(topic));
  const byId = new Map(items.map((i) => [i.id, i]));
  const hidden = hiddenSentences();
  const exercises: Exercise[] = [];
  for (const { s } of shuffle(sentences)) {
    const plain = plainOf(s.ja);
    if (hidden.has(plain)) continue;
    const word = s.w.map((id) => byId.get(id)).find((i): i is StudyItem => !!i && plain.includes(i.front));
    if (!word) continue;
    const at = plain.indexOf(word.front);
    const options = shuffle([word, ...distractors(word, items, 3, Math.random)]);
    exercises.push({
      type: "choice",
      key: `real-${exercises.length}-${at}`,
      itemId: word.id,
      question: "Fill in the blank",
      prompt: blankSpan(s.ja, at, word.front.length),
      promptRuby: blankSpanRuby(s.ja, at, word.front.length),
      promptSub: s.en,
      hideKey: plain,
      optionsJapanese: true,
      options: options.map((i) => ({ label: i.front, sub: i.reading !== i.front ? i.reading : undefined, correct: i === word })),
      answer: word.front,
    });
    if (exercises.length === REAL_SIZE) break;
  }
  if (!exercises.length) return { exercises: [], message: "No sentences use these words yet." };
  return { exercises };
}

/** Particles: fill in the particle. From the packs when they are saved, otherwise the hand-written grammar sentences. */
export async function particlesPlan(family?: string): Promise<SessionPlan> {
  const sentences = await packSentences();
  const items: ParticleItem[] = sentences
    ? sentences.map(({ level, s }) => fromPackSentence(s, level))
    : [
        ...particleItemsFromGrammar(GRAMMAR.flatMap((g) => g.sentences), "n5"),
        ...particleItemsFromGrammar(GRAMMAR_N4.flatMap((g) => g.sentences), "n4"),
      ];
  const hidden = hiddenSentences();
  const pool = familyItems(items, family).filter((i) => !hidden.has(plainOf(i.ja)));
  if (pool.length < 4) return { exercises: [], message: "No sentences for this particle yet. Try another, or all particles." };
  return { exercises: particleDrill(pool, SESSION_SIZE) };
}

/** The plan for a set and mode. */
export async function planFor(set: StudySet, mode: string): Promise<SessionPlan> {
  if (mode === "learn") return learnPlan(set);
  if (mode === "practise") return practisePlan(set);
  if (mode === "phrases" && set.topic) return phrasesPlan(set.topic);
  if (mode === "real" && set.topic) return realPlan(set.topic);
  return { exercises: [], message: "This study mode is not available here." };
}

export const TOPIC_BY_STUDY_ID = (id: string) => TOPIC_BY_ID[id as keyof typeof TOPIC_BY_ID];
