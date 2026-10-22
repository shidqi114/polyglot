// Plain-language explanations for wrong answers. These are rules over the typed answer and the correct one.
// Nothing here calls a model or a server.

const PARTICLE_HINTS: Record<string, string> = {
  は: "は marks the topic of the sentence. It is written は but read \"wa\" when it is a particle.",
  が: "が marks the subject: the thing that does or is something.",
  を: "を marks the object of an action, and is read \"o\".",
  に: "に marks a point in time, a destination, or where something exists.",
  で: "で marks the place where an action happens, or the means used.",
  へ: "へ marks direction, like に for going somewhere. It is read \"e\".",
  と: "と means \"and\" between nouns, or \"with\" a person.",
  も: "も means \"also\" or \"too\", and replaces は, が or を.",
  の: "の links two nouns: AのB means \"A's B\" or \"B of A\".",
};

// Kana that are easy to mix up. The pair is order-free.
const KANA_PAIRS: [string, string, string][] = [
  ["シ", "ツ", "シ is shi and ツ is tsu."],
  ["ソ", "ン", "ソ is so and ン is n."],
  ["ヌ", "メ", "ヌ is nu and メ is me."],
  ["ぬ", "め", "ぬ is nu and め is me."],
  ["ぬ", "ね", "ぬ is nu and ね is ne."],
  ["わ", "れ", "わ is wa and れ is re."],
  ["ね", "れ", "ね is ne and れ is re."],
  ["は", "ほ", "は is ha and ほ is ho."],
  ["き", "さ", "き is ki and さ is sa."],
  ["ろ", "る", "ろ is ro and る is ru."],
];

const isParticle = (s: string) => Object.prototype.hasOwnProperty.call(PARTICLE_HINTS, s);

/** Notes for a wrong choice: what the correct answer means, what was picked, and any easily confused pair. */
export function explainChoice(answer: string, picked: string | undefined): string[] {
  const notes: string[] = [];
  if (isParticle(answer)) notes.push(PARTICLE_HINTS[answer]);
  if (picked && picked !== answer && isParticle(picked)) notes.push(`You picked ${picked}. ${PARTICLE_HINTS[picked]}`);
  const pair = KANA_PAIRS.find(([a, b]) => (a === answer && b === picked) || (b === answer && a === picked));
  if (pair) notes.push(pair[2]);
  return notes;
}

const toHiragana = (s: string) => s.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
const SMALL_YOO = /[ゃゅょャュョ]/;
const YOO_FULL = /[やゆよヤユヨ]/;

/** Notes for a wrong kana answer, compared with the correct kana. */
export function explainKana(typed: string, correct: string): string[] {
  const t = typed.trim();
  const c = correct.trim();
  if (!t || t === c) return [];
  const notes: string[] = [];

  if (c.includes("っ") && !t.includes("っ")) {
    notes.push("っ is a small tsu: it pauses and doubles the next consonant (romaji kka = っか, tte = って).");
  }
  if (SMALL_YOO.test(c) && !SMALL_YOO.test(t) && YOO_FULL.test(t)) {
    notes.push("ゃ, ゅ and ょ are small. きゃ (kya) is one sound; きや is two.");
  }
  if (c.includes("ー") && !t.includes("ー")) {
    notes.push("ー stretches the vowel before it. In コーヒー the o is long.");
  }

  // Voiced (゛) and semi-voiced (゜) marks: compare the decomposed forms.
  const cn = c.normalize("NFD");
  const tn = t.normalize("NFD");
  for (const mark of ["゙", "゚"]) {
    if (cn.includes(mark) && !tn.includes(mark) && cn.replace(new RegExp(mark, "g"), "") === tn.replace(/゙|゚/g, "")) {
      const i = cn.indexOf(mark);
      const base = cn[i - 1];
      const marked = (base + mark).normalize("NFC");
      const name = mark === "゙" ? "voiced mark (゛)" : "semi-voiced mark (゜)";
      notes.push(`${marked} needs the ${name}. ${base} alone is a different sound.`);
      break;
    }
  }

  if (c.includes("ん") && !t.includes("ん")) notes.push("ん is a sound of its own (n) and is written as one character.");
  if (c === "は" && t === "わ") notes.push("As a particle this is は: it is written は but read \"wa\".");
  if (toHiragana(t) === toHiragana(c)) {
    notes.push("Same sound, different script: hiragana and katakana read the same way. Katakana is mostly used for loanwords and emphasis.");
  }
  if (notes.length === 0) notes.push(`You typed ${t}. The answer is ${c}.`);
  return notes;
}

/** Kana pairs that are easy to confuse, for the review queue and tests. */
export const confusablePairs = () => KANA_PAIRS.map(([a, b]) => [a, b] as const);
