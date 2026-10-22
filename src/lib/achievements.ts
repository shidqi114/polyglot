import { ALL_LESSONS } from "@/content/course";
import { KANA_ROWS } from "@/content/kana";
import { computeStreak, dayKey } from "@/lib/dates";
import { LEECH_LAPSES } from "@/lib/weekly";
import type { ProgressData } from "@/store/progress";

export type Progress = Pick<ProgressData, "lessons" | "cards" | "days" | "notes" | "settings">;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  /** How far the learner is, in the same unit as `target`. */
  value: (p: Progress) => number;
  target: number;
}

const lessonIds = (test: (id: string) => boolean) => ALL_LESSONS.filter((l) => test(l.id)).map((l) => l.id);
const LESSONS_N5 = lessonIds((id) => id.startsWith("n5-"));
const HIRAGANA = lessonIds((id) => id.startsWith("kana-h-"));
const KATAKANA = lessonIds((id) => id.startsWith("kana-k-"));
const N5_WORDS = lessonIds((id) => id.startsWith("n5-v-"));
const N5_GRAMMAR = ALL_LESSONS.filter((l) => l.kind === "grammar" && l.id.startsWith("n5-")).map((l) => l.id);
const N4_GRAMMAR = ALL_LESSONS.filter((l) => l.kind === "grammar" && l.id.startsWith("n4-")).map((l) => l.id);
const KANA_ROW_ITEMS = [...KANA_ROWS.hiragana, ...KANA_ROWS.katakana].map((r) => r.items.map((i) => i.id));

const done = (ids: string[], p: Progress) => ids.filter((id) => p.lessons[id]).length;
const cardsWhere = (p: Progress, test: (id: string) => boolean) => Object.keys(p.cards).filter(test).length;
const totalXp = (p: Progress) => Object.values(p.days).reduce((n, d) => n + d.xp, 0);
const totalReviews = (p: Progress) => Object.values(p.days).reduce((n, d) => n + d.reviews, 0);
const bestStreak = (p: Progress) => computeStreak(new Set(Object.keys(p.days)), dayKey()).best;
const goalDays = (p: Progress) => Object.values(p.days).filter((d) => d.xp >= p.settings.dailyGoal).length;
const matureCards = (p: Progress) => Object.values(p.cards).filter((c) => c.reps >= 5).length;
const leechCount = (p: Progress) => Object.values(p.cards).filter((c) => c.lapses >= LEECH_LAPSES).length;
const flawless = (p: Progress) => Object.values(p.lessons).filter((l) => l.best >= 1).length;
const rowsComplete = (p: Progress) => KANA_ROW_ITEMS.filter((ids) => ids.every((id) => p.cards[id])).length;
const confusedCards = (p: Progress) => Object.values(p.cards).filter((c) => (c.cf?.length ?? 0) > 0).length;

const xp = (id: string, title: string, target: number): Achievement => ({
  id,
  title,
  description: `Earn ${target.toLocaleString("en-US")} XP.`,
  value: totalXp,
  target,
});

export const ACHIEVEMENTS: Achievement[] = [
  // Lessons
  { id: "first-lesson", title: "First step", description: "Finish your first lesson.", value: (p) => Object.keys(p.lessons).length, target: 1 },
  { id: "lessons-10", title: "Getting going", description: "Finish 10 lessons.", value: (p) => Object.keys(p.lessons).length, target: 10 },
  { id: "lessons-50", title: "Dedicated", description: "Finish 50 lessons.", value: (p) => Object.keys(p.lessons).length, target: 50 },
  { id: "lessons-150", title: "Committed", description: "Finish 150 lessons.", value: (p) => Object.keys(p.lessons).length, target: 150 },
  { id: "hiragana", title: "Hiragana", description: "Finish every hiragana lesson.", value: (p) => done(HIRAGANA, p), target: HIRAGANA.length },
  { id: "katakana", title: "Katakana", description: "Finish every katakana lesson.", value: (p) => done(KATAKANA, p), target: KATAKANA.length },
  { id: "n5-words", title: "N5 words", description: "Finish every N5 word lesson.", value: (p) => done(N5_WORDS, p), target: N5_WORDS.length },
  { id: "n5-grammar", title: "N5 grammar", description: "Finish every N5 grammar lesson.", value: (p) => done(N5_GRAMMAR, p), target: N5_GRAMMAR.length },
  { id: "n4-grammar", title: "N4 grammar", description: "Finish every N4 grammar lesson.", value: (p) => done(N4_GRAMMAR, p), target: N4_GRAMMAR.length },
  { id: "n5-complete", title: "N5 complete", description: "Finish every N5 lesson.", value: (p) => done(LESSONS_N5, p), target: LESSONS_N5.length },
  { id: "flawless-1", title: "Flawless", description: "Finish a lesson with every answer right first time.", value: flawless, target: 1 },
  { id: "flawless-10", title: "Perfectionist", description: "Finish ten lessons with every answer right first time.", value: flawless, target: 10 },

  // XP
  xp("xp-100", "First 100 XP", 100),
  xp("xp-1000", "Thousand XP", 1000),
  xp("xp-5000", "Five thousand XP", 5000),

  // Streaks and daily goal
  { id: "streak-3", title: "Three in a row", description: "Study three days in a row.", value: bestStreak, target: 3 },
  { id: "streak-7", title: "One week", description: "Study seven days in a row.", value: bestStreak, target: 7 },
  { id: "streak-30", title: "One month", description: "Study 30 days in a row.", value: bestStreak, target: 30 },
  { id: "streak-100", title: "Hundred days", description: "Study 100 days in a row.", value: bestStreak, target: 100 },
  { id: "goal-5", title: "On target", description: "Reach your daily goal on five days.", value: goalDays, target: 5 },
  { id: "goal-30", title: "Routine", description: "Reach your daily goal on 30 days.", value: goalDays, target: 30 },

  // Reviews and items
  { id: "reviews-50", title: "Quick recall", description: "Answer 50 reviews.", value: totalReviews, target: 50 },
  { id: "reviews-500", title: "Memory keeper", description: "Answer 500 reviews.", value: totalReviews, target: 500 },
  { id: "items-50", title: "Fifty items", description: "Learn 50 items.", value: (p) => Object.keys(p.cards).length, target: 50 },
  { id: "items-500", title: "Five hundred items", description: "Learn 500 items.", value: (p) => Object.keys(p.cards).length, target: 500 },
  { id: "items-2000", title: "Two thousand items", description: "Learn 2,000 items.", value: (p) => Object.keys(p.cards).length, target: 2000 },
  { id: "words-100", title: "Word collector", description: "Learn 100 words.", value: (p) => cardsWhere(p, (id) => id.startsWith("v:")), target: 100 },
  { id: "words-1000", title: "Vocabulary builder", description: "Learn 1,000 words.", value: (p) => cardsWhere(p, (id) => id.startsWith("v:")), target: 1000 },
  { id: "kanji-50", title: "Kanji beginner", description: "Learn 50 kanji.", value: (p) => cardsWhere(p, (id) => id.startsWith("j:")), target: 50 },
  { id: "kanji-300", title: "Kanji regular", description: "Learn 300 kanji.", value: (p) => cardsWhere(p, (id) => id.startsWith("j:")), target: 300 },

  // Memory
  { id: "strong-20", title: "Solid memory", description: "Review 20 items at least five times each.", value: matureCards, target: 20 },
  { id: "strong-200", title: "Rock solid", description: "Review 200 items at least five times each.", value: matureCards, target: 200 },
  {
    id: "no-leeches",
    title: "No leeches",
    description: "Review 20 items at least five times each, with none that keep slipping.",
    value: (p) => (matureCards(p) >= 20 && leechCount(p) === 0 ? 1 : 0),
    target: 1,
  },
  { id: "rows-1", title: "A full row", description: "Learn every character in one kana row.", value: rowsComplete, target: 1 },
  { id: "rows-all", title: "Every row", description: "Learn every kana row, hiragana and katakana.", value: rowsComplete, target: KANA_ROW_ITEMS.length },

  // Notes and mistakes
  { id: "notes-1", title: "Make it yours", description: "Write your first personal note.", value: (p) => Object.keys(p.notes).length, target: 1 },
  { id: "notes-10", title: "Note taker", description: "Write ten personal notes.", value: (p) => Object.keys(p.notes).length, target: 10 },
  { id: "mistakes-10", title: "Learning from mistakes", description: "Record the wrong answers you gave for ten items.", value: confusedCards, target: 10 },
];

export interface EvaluatedAchievement extends Omit<Achievement, "value"> {
  value: number;
  unlocked: boolean;
}

/** Every achievement with the learner's current value and whether it is unlocked. */
export function evaluate(p: Progress): EvaluatedAchievement[] {
  return ACHIEVEMENTS.map((a) => {
    const value = Math.min(a.value(p), a.target);
    return { ...a, value, unlocked: value >= a.target };
  });
}
