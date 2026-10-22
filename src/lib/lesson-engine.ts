import { PARTICLES } from "@/content/grammar";
import type { ChoiceOption, Exercise, GrammarLesson, StudyItem } from "./types";

type Rng = () => number;

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let keySeq = 0;
const key = (p: string) => `${p}-${++keySeq}`;

const lc = (s: string) => s.toLowerCase();
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Main English/romaji label for an item. */
export function answerLabel(item: StudyItem): string {
  return item.kind === "kanji" ? capitalize(item.meanings[0]) : item.meanings[0];
}

/** Items from the pool that can't be confused with `item` (no shared answer or front). */
export function distractors(item: StudyItem, pool: StudyItem[], n: number, rng: Rng): StudyItem[] {
  const meanings = new Set(item.meanings.map(lc));
  const seenLabel = new Set([lc(item.meanings[0])]);
  const seenFront = new Set([item.front, item.reading]);
  const out: StudyItem[] = [];
  for (const cand of shuffle(pool, rng)) {
    if (out.length >= n) break;
    if (cand.id === item.id || seenFront.has(cand.front) || seenFront.has(cand.reading)) continue;
    if (cand.meanings.some((m) => meanings.has(lc(m)))) continue;
    if (seenLabel.has(lc(cand.meanings[0]))) continue;
    seenLabel.add(lc(cand.meanings[0]));
    seenFront.add(cand.front);
    seenFront.add(cand.reading);
    out.push(cand);
  }
  return out;
}

function choiceFromItems(
  item: StudyItem,
  others: StudyItem[],
  label: (i: StudyItem) => string,
  sub: ((i: StudyItem) => string | undefined) | undefined,
  rng: Rng,
): ChoiceOption[] {
  return shuffle(
    [item, ...others].map((i) => ({ label: label(i), sub: sub?.(i), correct: i === item })),
    rng,
  );
}

const readingSub = (i: StudyItem) => (i.kind === "vocab" && i.reading !== i.front ? i.reading : undefined);

/** Shows Japanese, pick the meaning (or romaji for kana). */
export function recognize(item: StudyItem, pool: StudyItem[], rng: Rng = Math.random): Exercise {
  const isKana = item.kind === "kana";
  return {
    type: "choice",
    key: key("rec"),
    itemId: item.id,
    question: isKana ? "What sound does this make?" : item.kind === "kanji" ? "What does this kanji mean?" : "What does this mean?",
    prompt: item.front,
    promptSub: readingSub(item),
    audio: item.reading,
    optionsJapanese: false,
    options: choiceFromItems(item, distractors(item, pool, 3, rng), answerLabel, undefined, rng),
    answer: answerLabel(item),
  };
}

/** Shows English/romaji, pick the Japanese. */
export function reverse(item: StudyItem, pool: StudyItem[], rng: Rng = Math.random): Exercise {
  const isKana = item.kind === "kana";
  return {
    type: "choice",
    key: key("rev"),
    itemId: item.id,
    question: isKana ? `Which character is “${item.meanings[0]}”?` : `Which one means “${answerLabel(item)}”?`,
    optionsJapanese: true,
    options: choiceFromItems(item, distractors(item, pool, 3, rng), (i) => i.front, readingSub, rng),
    answer: item.front,
  };
}

/** Hear the word, pick what was said. */
export function listen(item: StudyItem, pool: StudyItem[], rng: Rng = Math.random): Exercise {
  return {
    type: "choice",
    key: key("lis"),
    itemId: item.id,
    question: "What do you hear?",
    audio: item.reading,
    audioOnly: true,
    optionsJapanese: true,
    options: choiceFromItems(item, distractors(item, pool, 3, rng), (i) => i.front, readingSub, rng),
    answer: item.front,
  };
}

/** Kanji: pick one of its readings. */
export function kanjiReading(item: StudyItem, pool: StudyItem[], rng: Rng = Math.random): Exercise {
  const own = new Set([...(item.on ?? []), ...(item.kun ?? [])]);
  const correct = shuffle([...own], rng)[0] ?? item.reading;
  const wrong: string[] = [];
  for (const cand of shuffle(pool, rng)) {
    for (const r of [...(cand.on ?? []), ...(cand.kun ?? [])]) {
      if (wrong.length < 3 && !own.has(r) && !wrong.includes(r)) wrong.push(r);
    }
    if (wrong.length >= 3) break;
  }
  return {
    type: "choice",
    key: key("kr"),
    itemId: item.id,
    question: "Which is a reading of this kanji?",
    prompt: item.front,
    promptSub: capitalize(item.meanings[0]),
    optionsJapanese: true,
    options: shuffle([correct, ...wrong].map((label) => ({ label, correct: label === correct })), rng),
    answer: correct,
  };
}

/** Type the answer: romaji for kana, kana reading for words and kanji. */
export function typeIt(item: StudyItem): Exercise {
  if (item.kind === "kana") {
    return {
      type: "input",
      key: key("in"),
      itemId: item.id,
      question: "Type this in romaji",
      prompt: item.front,
      audio: item.reading,
      mode: "romaji",
      answers: [item.front],
      answer: item.meanings[0],
    };
  }
  const answers = item.kind === "kanji" ? [...(item.on ?? []), ...(item.kun ?? [])] : [item.reading];
  return {
    type: "input",
    key: key("in"),
    itemId: item.id,
    question: item.kind === "kanji" ? "Type a reading of this kanji" : "Type the reading",
    prompt: item.front,
    promptSub: capitalize(item.meanings[0]),
    mode: "kana",
    answers,
    answer: answers.join(" / "),
  };
}

/** English meaning → type the Japanese reading. */
export function typeFromMeaning(item: StudyItem): Exercise {
  return {
    type: "input",
    key: key("inr"),
    itemId: item.id,
    question: "Type this in Japanese",
    prompt: answerLabel(item),
    promptSub: item.meanings.slice(1, 3).join(", ") || undefined,
    audio: item.reading,
    mode: "kana",
    answers: [item.reading],
    answer: item.front === item.reading ? item.reading : `${item.reading} (${item.front})`,
  };
}

export function match(items: StudyItem[], rng: Rng = Math.random): Exercise | null {
  const seenL = new Set<string>();
  const seenR = new Set<string>();
  const pairs: { id: string; left: string; right: string }[] = [];
  for (const it of shuffle(items, rng)) {
    const right = answerLabel(it);
    if (seenL.has(it.front) || seenR.has(lc(right))) continue;
    seenL.add(it.front);
    seenR.add(lc(right));
    pairs.push({ id: it.id, left: it.front, right });
    if (pairs.length === 5) break;
  }
  return pairs.length >= 3 ? { type: "match", key: key("m"), pairs } : null;
}

function harder(item: StudyItem, pool: StudyItem[], rng: Rng): Exercise {
  const options: ((i: StudyItem, p: StudyItem[], r: Rng) => Exercise)[] = [reverse, listen];
  if (item.kind === "kana") options.push((i) => typeIt(i));
  if (item.kind === "vocab" && item.front !== item.reading) options.push((i) => typeIt(i));
  if (item.kind === "kanji") return (rng() < 0.5 ? reverse : kanjiReading)(item, pool, rng);
  return options[Math.floor(rng() * options.length)](item, pool, rng);
}

/** Lesson for kana / vocab / kanji: introduce, recognise, match, then recall. */
export function buildItemLesson(items: StudyItem[], pool: StudyItem[], rng: Rng = Math.random): Exercise[] {
  const fullPool = [...pool, ...items.filter((i) => !pool.includes(i))];
  const out: Exercise[] = [];
  for (let i = 0; i < items.length; i += 2) {
    const pair = items.slice(i, i + 2);
    for (const it of pair) out.push({ type: "intro", key: key("intro"), item: it });
    for (const it of pair) out.push(recognize(it, fullPool, rng));
  }
  const m = match(items, rng);
  if (m) out.push(m);
  for (const it of shuffle(items, rng)) out.push(harder(it, fullPool, rng));
  return out;
}

/** A single exercise for spaced-repetition review. */
export function buildReviewExercise(item: StudyItem, pool: StudyItem[], rng: Rng = Math.random): Exercise {
  return rng() < 0.3 ? recognize(item, pool, rng) : harder(item, pool, rng);
}

// "sentence" and "conjugation" need the study packs; the practice page builds those with pack-exercises.ts.
export type PracticeMode = "pick" | "reverse-pick" | "input" | "reverse-input" | "sentence" | "conjugation";

export function buildPracticeExercise(
  item: StudyItem,
  pool: StudyItem[],
  mode: PracticeMode,
  rng: Rng = Math.random,
): Exercise {
  switch (mode) {
    case "pick":
      return recognize(item, pool, rng);
    case "reverse-pick":
      return reverse(item, pool, rng);
    case "input":
      return typeIt(item);
    case "reverse-input":
      return typeFromMeaning(item);
    case "sentence":
    case "conjugation":
      return recognize(item, pool, rng); // built from pack data by pack-exercises.ts
  }
}

const PARTICLE_CHOICES = ["は", "が", "を", "に", "で", "へ", "と", "も", "の"];
/** Particles that would also be grammatical in the same slot, so never offered as wrong answers. */
const AMBIGUOUS: Record<string, string[]> = {
  は: ["が", "も"],
  が: ["は", "を", "も"],
  を: ["が", "も", "は"],
  も: ["は", "が", "を"],
  に: ["へ"],
  へ: ["に"],
};

export function buildGrammarLesson(lesson: GrammarLesson, rng: Rng = Math.random): Exercise[] {
  const out: Exercise[] = [{ type: "note", key: key("note"), lesson }];
  const allTiles = [...new Set(lesson.sentences.flatMap((s) => s.tiles))];
  lesson.sentences.forEach((s, i) => {
    const jp = s.tiles.join("");
    if (i % 2 === 1) {
      const pIdx = s.tiles.findIndex((t) => PARTICLES.has(t) && PARTICLE_CHOICES.includes(t));
      if (pIdx >= 0) {
        const correct = s.tiles[pIdx];
        const banned = new Set([correct, ...(AMBIGUOUS[correct] ?? [])]);
        const wrong = shuffle(PARTICLE_CHOICES.filter((p) => !banned.has(p)), rng).slice(0, 3);
        out.push({
          type: "choice",
          key: key("fill"),
          question: "Fill in the blank",
          prompt: s.tiles.map((t, j) => (j === pIdx ? "＿" : t)).join(""),
          promptSub: s.en,
          optionsJapanese: true,
          options: shuffle([correct, ...wrong].map((label) => ({ label, correct: label === correct })), rng),
          answer: correct,
          audio: undefined,
        });
      }
    } else if (i > 0) {
      const others = shuffle(lesson.sentences.filter((o) => o !== s), rng).slice(0, 2);
      out.push({
        type: "choice",
        key: key("tr"),
        question: "What does this mean?",
        prompt: jp,
        promptSub: s.kana,
        audio: s.kana,
        optionsJapanese: false,
        options: shuffle([s, ...others].map((o) => ({ label: o.en, correct: o === s })), rng),
        answer: s.en,
      });
    }
    const extra = shuffle(allTiles.filter((t) => !s.tiles.includes(t)), rng).slice(0, 2);
    out.push({
      type: "build",
      key: key("build"),
      en: s.en,
      kana: s.kana,
      answer: s.tiles,
      tiles: shuffle([...s.tiles, ...extra], rng),
    });
  });
  return out;
}

/** Clone an exercise with a fresh key so a missed question can be asked again. */
export function retry(ex: Exercise, rng: Rng = Math.random): Exercise {
  const copy = { ...ex, key: key("retry") } as Exercise;
  if (copy.type === "choice") copy.options = shuffle(copy.options, rng);
  if (copy.type === "build") copy.tiles = shuffle(copy.tiles, rng);
  return copy;
}
