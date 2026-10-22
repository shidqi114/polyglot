import { beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, computeStreak, dayKey } from "@/lib/dates";
import { isDue, reviewCard, strengthBars } from "@/lib/srs";

// Minimal localStorage so the persisted store can load under Node.
const mem = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
});

const { useProgress, streakOf, totalXp, dueCount } = await import("@/store/progress");

describe("dates & streaks", () => {
  it("adds days across month boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("counts a streak ending today or yesterday", () => {
    const today = "2026-10-22";
    const days = new Set(["2026-10-20", "2026-10-21", "2026-10-22", "2026-10-10", "2026-10-11"]);
    expect(computeStreak(days, today)).toEqual({ current: 3, best: 3 });
    days.delete("2026-10-22");
    expect(computeStreak(days, today).current).toBe(2);
    expect(computeStreak(new Set(["2026-10-01"]), today)).toEqual({ current: 0, best: 1 });
  });
});

describe("srs", () => {
  it("schedules good answers further out than misses", () => {
    const now = Date.UTC(2026, 9, 22);
    const good = reviewCard(undefined, "good", now);
    const again = reviewCard(undefined, "again", now);
    expect(good.due).toBeGreaterThan(now);
    expect(good.due).toBeGreaterThanOrEqual(again.due);
    expect(isDue(good, now)).toBe(false);
    expect(isDue(good, good.due)).toBe(true);
    const later = reviewCard(good, "good", good.due);
    expect(later.due - good.due).toBeGreaterThan(good.due - now);
    expect(strengthBars(later, good.due)).toBeGreaterThanOrEqual(1);
  });
});

describe("progress store", () => {
  beforeEach(() => useProgress.getState().reset(null));

  it("completing a lesson records xp, cards and pending sync work", () => {
    useProgress.getState().completeLesson("kana-h-0-0", 0.8, 10, [
      { itemId: "k:あ", correct: true },
      { itemId: "k:い", correct: false },
    ]);
    const s = useProgress.getState();
    expect(s.lessons["kana-h-0-0"].times).toBe(1);
    expect(totalXp(s.days)).toBe(10);
    expect(streakOf(s.days).current).toBe(1);
    expect(Object.keys(s.cards)).toEqual(["k:あ", "k:い"]);
    expect(s.pending.days[dayKey()]).toEqual({ xp: 10, lessons: 1, reviews: 0 });
    expect(s.pending.lessons["kana-h-0-0"]).toBe(1);
    expect(Object.keys(s.pending.cards)).toHaveLength(2);
    expect(dueCount(s.cards)).toBe(0);
  });

  it("clearPending keeps changes made while a flush was in flight", () => {
    const st = useProgress.getState();
    st.completeLesson("kana-h-0-0", 1, 15, [{ itemId: "k:あ", correct: true }]);
    const snapshot = useProgress.getState().pending;
    st.recordReview("k:あ", true); // happens during the write
    useProgress.getState().clearPending(snapshot);
    const p = useProgress.getState().pending;
    expect(p.days[dayKey()]).toEqual({ xp: 1, lessons: 0, reviews: 1 });
    expect(p.lessons).toEqual({});
    expect(Object.keys(p.cards)).toEqual(["k:あ"]);
  });

  it("settings updates are marked for sync", () => {
    useProgress.getState().updateSettings({ dailyGoal: 50 });
    const s = useProgress.getState();
    expect(s.settings.dailyGoal).toBe(50);
    expect(s.pending.settings).toBe(true);
  });
});
