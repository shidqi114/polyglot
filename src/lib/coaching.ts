import { TIPS, type Tip, type TipTrigger } from "@/content/tips";

/** Triggers in order of urgency. The first one that applies decides the tip. */
export const TRIGGER_ORDER: TipTrigger[] = [
  "due-backlog",
  "leeches",
  "streak-broken",
  "low-accuracy",
  "confusions",
  "idle",
  "kana",
  "steady",
  "new",
  "general",
];

export interface CoachingState {
  lessonsDone: number;
  due: number;
  leeches: number;
  confusedItems: number;
  streak: number;
  bestStreak: number;
  /** Days since anything was studied, or null before the first study day. */
  daysIdle: number | null;
  /** Share of reviews answered right, or null while there are too few reviews to judge. */
  accuracy: number | null;
  kanaLearned: number;
  kanaTotal: number;
}

/** The triggers that apply now, most urgent first. "general" always applies. */
export function activeTriggers(s: CoachingState): TipTrigger[] {
  const out: TipTrigger[] = [];
  if (s.due >= 25) out.push("due-backlog");
  if (s.leeches >= 1) out.push("leeches");
  if (s.streak === 0 && s.bestStreak >= 3) out.push("streak-broken");
  if (s.accuracy !== null && s.accuracy < 0.75) out.push("low-accuracy");
  if (s.confusedItems >= 1) out.push("confusions");
  if (s.daysIdle !== null && s.daysIdle >= 2) out.push("idle");
  if (s.kanaLearned < s.kanaTotal) out.push("kana");
  if (s.streak >= 7) out.push("steady");
  if (s.lessonsDone === 0) out.push("new");
  out.push("general");
  return out;
}

/** A stable number for a key such as a date, so the same day always picks the same item. */
export function dailyIndex(key: string, length: number): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return length > 0 ? h % length : 0;
}

/** The tip for the most urgent trigger that has tips. It changes from one day to the next. */
export function tipFor(active: TipTrigger[], key: string): Tip | undefined {
  for (const trigger of active) {
    const tips = TIPS.filter((t) => t.trigger === trigger);
    if (tips.length > 0) return tips[dailyIndex(key, tips.length)];
  }
  return undefined;
}
