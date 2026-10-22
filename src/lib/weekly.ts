import { KANA_ROWS } from "@/content/kana";
import { addDays, computeStreak, dayKey } from "@/lib/dates";
import type { CoachingState } from "@/lib/coaching";
import type { SrsCard } from "@/lib/srs";
import type { DayStats, ProgressData } from "@/store/progress";

export type Cards = Record<string, SrsCard>;

/** Items reviewed this many times or more with lapses at this count are leeches. */
export const LEECH_LAPSES = 4;

export interface WeekDay {
  key: string;
  xp: number;
  lessons: number;
  reviews: number;
}

/** The last seven days, oldest first, ending on `today`. */
export function lastSevenDays(days: Record<string, DayStats>, today: string): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const key = addDays(today, i - 6);
    return { key, xp: days[key]?.xp ?? 0, lessons: days[key]?.lessons ?? 0, reviews: days[key]?.reviews ?? 0 };
  });
}

/** Reviews that were not lapses, out of all reviews. Null for an item that has never been reviewed. */
export function cardAccuracy(card: SrsCard): number | null {
  return card.reps > 0 ? Math.max(0, card.reps - card.lapses) / card.reps : null;
}

export interface GroupAccuracy {
  group: string;
  reviews: number;
  accuracy: number;
}

/** Accuracy per group (such as "N5 words"), weakest first. Groups with fewer than five reviews are left out. */
export function accuracyByGroup(cards: Cards, groupOf: (id: string) => string | undefined): GroupAccuracy[] {
  const totals = new Map<string, { reviews: number; right: number }>();
  for (const [id, card] of Object.entries(cards)) {
    const group = groupOf(id);
    if (!group || card.reps === 0) continue;
    const t = totals.get(group) ?? { reviews: 0, right: 0 };
    t.reviews += card.reps;
    t.right += Math.max(0, card.reps - card.lapses);
    totals.set(group, t);
  }
  return [...totals]
    .map(([group, t]) => ({ group, reviews: t.reviews, accuracy: t.right / t.reviews }))
    .filter((g) => g.reviews >= 5)
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Items that keep slipping, most lapses first. */
export function leeches(cards: Cards): { id: string; lapses: number }[] {
  return Object.entries(cards)
    .filter(([, c]) => c.lapses >= LEECH_LAPSES)
    .map(([id, c]) => ({ id, lapses: c.lapses }))
    .sort((a, b) => b.lapses - a.lapses);
}

/** Items the learner picked a wrong answer for, most confusions first. */
export function confusions(cards: Cards): { id: string; wrong: string[] }[] {
  return Object.entries(cards)
    .filter(([, c]) => (c.cf?.length ?? 0) > 0)
    .map(([id, c]) => ({ id, wrong: c.cf ?? [] }))
    .sort((a, b) => b.wrong.length - a.wrong.length);
}

export interface RowAccuracy {
  title: string;
  reviews: number;
  accuracy: number;
}

/** Kana rows with reviews, weakest first. */
export function weakestKanaRows(cards: Cards): RowAccuracy[] {
  const rows = [...KANA_ROWS.hiragana, ...KANA_ROWS.katakana];
  return rows
    .map((row) => {
      let reviews = 0;
      let right = 0;
      for (const item of row.items) {
        const card = cards[item.id];
        if (!card || card.reps === 0) continue;
        reviews += card.reps;
        right += Math.max(0, card.reps - card.lapses);
      }
      return { title: row.title, reviews, accuracy: reviews ? right / reviews : 0 };
    })
    .filter((r) => r.reviews >= 3)
    .sort((a, b) => a.accuracy - b.accuracy);
}

export interface NextStepInput {
  lessonsDone: number;
  due: number;
  leeches: number;
  confusedItems: number;
  streak: number;
  bestStreak: number;
  weakRow?: RowAccuracy;
}

/** Up to three plain-language suggestions, most important first. */
export function nextSteps(s: NextStepInput): string[] {
  const steps: string[] = [];
  if (s.lessonsDone === 0) steps.push("Start the path with the first kana lesson. It takes about five minutes.");
  if (s.streak === 0 && s.bestStreak >= 3) steps.push("Your streak has ended. One review or one short lesson today starts a new one.");
  if (s.due >= 20) steps.push(`Clear the ${s.due} reviews that are due before you start new lessons.`);
  if (s.leeches > 0) steps.push(`Fix ${s.leeches} leech${s.leeches === 1 ? "" : "es"}: they keep coming back wrong.`);
  if (s.confusedItems > 0) steps.push("Compare the items you mix up, then practise them together.");
  if (s.weakRow) steps.push(`Practise the ${s.weakRow.title} row. You are right ${Math.round(s.weakRow.accuracy * 100)}% of the time there.`);
  if (steps.length === 0) steps.push("Keep going: one lesson or review a day is enough.");
  return steps.slice(0, 3);
}

type Progress = Pick<ProgressData, "lessons" | "cards" | "days">;

/** Everything the coaching rules and the weekly page need, derived from progress alone. */
export function coachingState(p: Progress, today = dayKey(), now = Date.now()): CoachingState {
  const cards = Object.values(p.cards);
  const studied = Object.entries(p.days)
    .filter(([, d]) => d.xp > 0 || d.lessons > 0 || d.reviews > 0)
    .map(([key]) => key)
    .sort();
  const last = studied[studied.length - 1];
  const streak = computeStreak(new Set(studied), today);
  const reps = cards.reduce((n, c) => n + c.reps, 0);
  const right = cards.reduce((n, c) => n + Math.max(0, c.reps - c.lapses), 0);
  const kana = [...KANA_ROWS.hiragana, ...KANA_ROWS.katakana].flatMap((r) => r.items);
  return {
    lessonsDone: Object.keys(p.lessons).length,
    due: cards.filter((c) => c.due <= now).length,
    leeches: leeches(p.cards).length,
    confusedItems: confusions(p.cards).length,
    streak: streak.current,
    bestStreak: streak.best,
    daysIdle: last ? Math.round((Date.parse(today) - Date.parse(last)) / 86_400_000) : null,
    accuracy: reps >= 30 ? right / reps : null,
    kanaLearned: kana.filter((i) => p.cards[i.id]).length,
    kanaTotal: kana.length,
  };
}
