// Exercises built from the study packs: sentence cloze and verb-form drills. Pure functions, so they can be tested.
import type { PackExample, PackWord, VerbForm } from "@/content/packs";
import { distractors, shuffle } from "./lesson-engine";
import type { Exercise, StudyItem } from "./types";

type Rng = () => number;
let seq = 0;
const key = (p: string) => `${p}-pack-${++seq}`;

const FORM_LABELS: Record<VerbForm, string> = {
  dict: "dictionary",
  polite: "polite",
  neg: "negative",
  past: "past",
  te: "て-form",
  potential: "potential",
  passive: "passive",
  causative: "causative",
  volitional: "volitional",
  conditional: "conditional",
  imperative: "imperative",
};

const plain = (example: PackExample) => example.ja.map((s) => (typeof s === "string" ? s : s[0])).join("");

/** The first example sentence in which the word stands alone, with the word blanked out. */
export function clozeFor(item: StudyItem, word: PackWord): { prompt: string; en: string } | null {
  for (const example of word.ex ?? []) {
    const text = plain(example);
    const at = text.indexOf(item.front);
    if (at < 0) continue;
    // Skip matches glued to a longer word, e.g. 今 inside 今日.
    const after = text[at + item.front.length] ?? "";
    if (/[㐀-鿿]/.test(after) && /[㐀-鿿]/.test(item.front.at(-1) ?? "")) continue;
    return { prompt: `${text.slice(0, at)}＿＿${text.slice(at + item.front.length)}`, en: example.en };
  }
  return null;
}

/** "Fill in the blank": choose the word that fits the example sentence. */
export function clozeExercise(item: StudyItem, word: PackWord, pool: StudyItem[], rng: Rng = Math.random): Exercise | null {
  const cloze = clozeFor(item, word);
  if (!cloze) return null;
  const others = distractors(item, pool, 3, rng);
  const options = shuffle(
    [item, ...others].map((i) => ({
      label: i.front,
      sub: i.kind === "vocab" && i.reading !== i.front ? i.reading : undefined,
      correct: i === item,
    })),
    rng,
  );
  return {
    type: "choice",
    key: key("cloze"),
    itemId: item.id,
    question: "Fill in the blank",
    prompt: cloze.prompt,
    promptSub: cloze.en,
    optionsJapanese: true,
    options,
    answer: item.front,
  };
}

/** Choose the right form of a verb. Distractors are the same form of other verbs. */
export function conjugationExercise(item: StudyItem, word: PackWord, others: PackWord[], rng: Rng = Math.random): Exercise | null {
  const forms = (Object.keys(word.forms ?? {}) as VerbForm[]).filter((f) => f !== "dict" && word.forms?.[f]);
  if (forms.length === 0) return null;
  const form = forms[Math.floor(rng() * forms.length)];
  const answer = word.forms![form]!;
  const wrong = [...new Set(others.map((o) => o.forms?.[form]).filter((x): x is string => !!x && x !== answer))];
  const picks = shuffle(wrong, rng).slice(0, 3);
  if (picks.length < 2) return null;
  return {
    type: "choice",
    key: key("conj"),
    itemId: item.id,
    question: `Choose the ${FORM_LABELS[form]} form`,
    prompt: item.front,
    promptSub: item.meanings[0],
    optionsJapanese: true,
    options: shuffle([answer, ...picks].map((label) => ({ label, correct: label === answer })), rng),
    answer,
  };
}

/** Adds up to `count` cloze exercises to a lesson, for the words that have example sentences. */
export function addClozeExercises(
  exercises: Exercise[],
  items: StudyItem[],
  words: Map<string, PackWord>,
  pool: StudyItem[],
  count = 2,
  rng: Rng = Math.random,
): Exercise[] {
  const extra: Exercise[] = [];
  for (const item of shuffle(items, rng)) {
    const word = words.get(item.id);
    if (!word?.ex) continue;
    const ex = clozeExercise(item, word, pool, rng);
    if (ex) extra.push(ex);
    if (extra.length === count) break;
  }
  return [...exercises, ...extra];
}
