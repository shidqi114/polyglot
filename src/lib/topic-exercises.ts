// Exercises for topics: phrase quizzes (hear it and pick the meaning, or build it from tiles) and particle drills.
// Pure: the random source is passed in, so the tests can fix it.
import { PARTICLE_FAMILIES, alsoCorrect, PARTICLES, type Particle } from "@/content/particles";
import type { PackSentence } from "@/content/packs";
import type { GrammarSentence } from "./types";
import type { TopicPhrase } from "@/content/topics";
import { shuffle } from "./lesson-engine";
import type { Exercise, RubySegment } from "./types";

type Rng = () => number;
let seq = 0;
const key = (p: string) => `${p}-topic-${++seq}`;

const PUNCTUATION = /^[。、！？!?]$/;

/** A sentence with one particle blanked, as the drills use it. `at` is the particle's offset in the plain text. */
export interface ParticleItem {
  ja: RubySegment[];
  at: number;
  p: Particle;
  en: string;
  also: Particle[];
  level: "n5" | "n4";
}

export const fromPackSentence = (s: PackSentence, level: "n5" | "n4"): ParticleItem => ({
  ja: s.ja,
  at: s.at,
  p: s.p,
  en: s.en,
  also: s.also,
  level,
});

/**
 * The particle drill items for lessons written by hand (offline fallback when the packs are not saved). Each tile that
 * is a particle becomes one item; the sentence's own tiles give the offset.
 */
export function particleItemsFromGrammar(sentences: GrammarSentence[], level: "n5" | "n4"): ParticleItem[] {
  const items: ParticleItem[] = [];
  for (const sentence of sentences) {
    let at = 0;
    sentence.tiles.forEach((tile) => {
      if ((PARTICLES as readonly string[]).includes(tile)) {
        const p = tile as Particle;
        const plain = sentence.tiles.join("");
        items.push({ ja: [plain], at, p, en: sentence.en, also: alsoCorrect(p), level });
      }
      at += tile.length;
    });
  }
  return items;
}

/** Plain text of a ruby sentence with the blank written as ＿＿. */
export function blankedText(item: ParticleItem): string {
  const plain = item.ja.map((s) => (typeof s === "string" ? s : s[0])).join("");
  return `${plain.slice(0, item.at)}＿＿${plain.slice(item.at + item.p.length)}`;
}

/** The sentence's segments with the particle replaced by a blank, keeping the furigana of the other words. */
export function blankedRuby(item: ParticleItem): RubySegment[] {
  const out: RubySegment[] = [];
  let offset = 0;
  let placed = false;
  for (const segment of item.ja) {
    const text = typeof segment === "string" ? segment : segment[0];
    const start = offset;
    offset += text.length;
    if (!placed && item.at >= start && item.at < offset && typeof segment === "string") {
      const before = segment.slice(0, item.at - start);
      const after = segment.slice(item.at - start + item.p.length);
      if (before) out.push(before);
      out.push("＿＿");
      if (after) out.push(after);
      placed = true;
    } else {
      out.push(segment);
    }
  }
  return out;
}

/** Three wrong particles for a blank: from the same family first, then from the rest, never one that also fits. */
function distractorsFor(item: ParticleItem, rng: Rng): Particle[] {
  const banned = new Set<Particle>([item.p, ...item.also]);
  const family = PARTICLE_FAMILIES.find((f) => f.particles.includes(item.p));
  const sameFamily = shuffle((family?.particles ?? []).filter((p) => !banned.has(p)), rng);
  const others = shuffle(PARTICLES.filter((p) => !banned.has(p) && !sameFamily.includes(p)), rng);
  return [...sameFamily, ...others].slice(0, 3);
}

/** "Which particle goes in the blank?" The English sentence under the blank says what it means. */
export function particleExercise(item: ParticleItem, rng: Rng = Math.random): Exercise {
  const options = shuffle(
    [item.p, ...distractorsFor(item, rng)].map((label) => ({ label, correct: label === item.p })),
    rng,
  );
  return {
    type: "choice",
    key: key("particle"),
    question: "Which particle goes in the blank?",
    prompt: blankedText(item),
    promptRuby: blankedRuby(item),
    promptSub: item.en,
    optionsJapanese: true,
    options,
    answer: item.p,
  };
}

/**
 * A drill of `count` particle questions. `items` should already be in course order (N5 first); the picks are shuffled
 * within each level so the N5 sentences come up first, and no sentence appears twice.
 */
export function particleDrill(items: ParticleItem[], count: number, rng: Rng = Math.random): Exercise[] {
  const picked: ParticleItem[] = [];
  const seen = new Set<string>();
  for (const block of [items.filter((i) => i.level === "n5"), items.filter((i) => i.level === "n4")]) {
    for (const item of shuffle(block, rng)) {
      const text = item.ja.map((s) => (typeof s === "string" ? s : s[0])).join("");
      if (seen.has(text)) continue;
      seen.add(text);
      picked.push(item);
      if (picked.length === count) return picked.map((i) => particleExercise(i, rng));
    }
  }
  return picked.map((i) => particleExercise(i, rng));
}

/** Items from one particle family only, for the "one family at a time" drill. */
export function familyItems(items: ParticleItem[], familyId: string | undefined): ParticleItem[] {
  if (!familyId) return items;
  const family = PARTICLE_FAMILIES.find((f) => f.id === familyId);
  return family ? items.filter((i) => family.particles.includes(i.p)) : items;
}

/** Phrase quiz 1: hear the phrase and pick its meaning from four English choices. */
export function phraseListenExercise(phrase: TopicPhrase, others: TopicPhrase[], rng: Rng = Math.random): Exercise {
  const wrong = shuffle(
    others.filter((o) => o.en !== phrase.en).map((o) => o.en),
    rng,
  ).filter((en, i, all) => all.indexOf(en) === i).slice(0, 3);
  return {
    type: "choice",
    key: key("phrase-listen"),
    question: "What did you hear?",
    audio: phrase.kana,
    audioOnly: true,
    optionsJapanese: false,
    options: shuffle([phrase.en, ...wrong].map((label) => ({ label, correct: label === phrase.en })), rng),
    answer: phrase.en,
  };
}

/** Phrase quiz 2: build the English-meaning phrase from tiles, with two tiles from other phrases to pick out. */
export function phraseBuildExercise(phrase: TopicPhrase, others: TopicPhrase[], rng: Rng = Math.random): Exercise {
  const spare = shuffle(
    others.flatMap((o) => o.tiles).filter((t) => !phrase.tiles.includes(t) && !PUNCTUATION.test(t)),
    rng,
  ).slice(0, 2);
  return {
    type: "build",
    key: key("phrase-build"),
    en: phrase.en,
    kana: phrase.kana,
    answer: phrase.tiles,
    tiles: shuffle([...phrase.tiles, ...spare], rng),
  };
}
