/**
 * Particles for the particle drills (Practice → Study by topic → Particles). The pack build and the app both use this file.
 */

export const PARTICLES = ["は", "が", "を", "に", "で", "へ", "と", "も", "の", "から", "まで"] as const;
export type Particle = (typeof PARTICLES)[number];

export const PARTICLE_FAMILIES: { id: string; title: string; particles: Particle[] }[] = [
  { id: "wa-ga", title: "は・が", particles: ["は", "が"] },
  { id: "wo", title: "を", particles: ["を"] },
  { id: "ni-de-e", title: "に・で・へ", particles: ["に", "で", "へ"] },
  { id: "to-mo", title: "と・も", particles: ["と", "も"] },
  { id: "no", title: "の", particles: ["の"] },
  { id: "kara-made", title: "から・まで", particles: ["から", "まで"] },
];

/** Particles that can also fill a blank, whatever the verb. The English sentence usually decides between them. */
const ALWAYS_ALSO: Partial<Record<Particle, Particle[]>> = {
  は: ["が", "も"],
  が: ["は"],
  も: ["は", "が"],
  に: ["へ"],
  へ: ["に"],
};

/** The particles that mark a verb's object or destination; only these can swap for one another by verb. */
const CASE_PARTICLES = new Set<Particle>(["が", "を", "に", "で", "へ", "と"]);

/**
 * Verbs and adjectives whose object is marked with が (or は), never を. A blank before one of these must not
 * offer は or が as a wrong choice.
 */
const SUBJECT_MARKING = new Set(["好き", "嫌い", "分かる", "できる", "上手", "下手", "ほしい"]);

/**
 * The particles that also fit a blank: the always-also pairs, the が/は pair for subject-marking verbs, and any
 * particle the corpus uses with the same verb often enough (`pairs`, keyed "verb|particle", counts of sentences).
 */
export function alsoCorrect(answer: Particle, verb?: string, pairs?: Map<string, number>): Particle[] {
  if (verb && SUBJECT_MARKING.has(verb) && (answer === "は" || answer === "が")) return answer === "は" ? ["が"] : ["は"];
  const also = new Set<Particle>(ALWAYS_ALSO[answer] ?? []);
  // Only the case particles take a verb's object or destination, so only they can swap for one another by verb.
  if (verb && pairs && CASE_PARTICLES.has(answer)) {
    const own = pairs.get(`${verb}|${answer}`) ?? 0;
    for (const other of CASE_PARTICLES) {
      if (other === answer) continue;
      const count = pairs.get(`${verb}|${other}`) ?? 0;
      if (count >= 3 && count * 4 >= own) also.add(other);
    }
  }
  return [...also];
}
