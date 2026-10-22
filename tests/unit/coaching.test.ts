import { describe, expect, it } from "vitest";
import { CULTURE } from "@/content/culture";
import { TIPS } from "@/content/tips";
import { activeTriggers, dailyIndex, tipFor, TRIGGER_ORDER, type CoachingState } from "@/lib/coaching";

const calm: CoachingState = {
  lessonsDone: 10,
  due: 0,
  leeches: 0,
  confusedItems: 0,
  streak: 3,
  bestStreak: 3,
  daysIdle: 0,
  accuracy: 0.9,
  kanaLearned: 208,
  kanaTotal: 208,
};

describe("tips", () => {
  it("has at least four tips for every trigger, with unique ids and text", () => {
    const ids = TIPS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const trigger of TRIGGER_ORDER) {
      expect(TIPS.filter((t) => t.trigger === trigger).length, trigger).toBeGreaterThanOrEqual(4);
    }
    for (const t of TIPS) expect(t.text.trim(), t.id).not.toBe("");
  });

  it("lists the new-learner and general triggers for a brand new account", () => {
    const fresh = { ...calm, lessonsDone: 0, streak: 0, bestStreak: 0, daysIdle: null, accuracy: null, kanaLearned: 0 };
    const active = activeTriggers(fresh);
    expect(active).toEqual(expect.arrayContaining(["new", "kana", "general"]));
    expect(active).not.toContain("streak-broken");
    expect(active[active.length - 1]).toBe("general");
  });

  it("puts a large backlog first, ahead of other triggers", () => {
    const active = activeTriggers({ ...calm, due: 40, leeches: 2 });
    expect(active[0]).toBe("due-backlog");
    expect(active[1]).toBe("leeches");
  });

  it("flags a broken streak and idle time", () => {
    const active = activeTriggers({ ...calm, streak: 0, bestStreak: 5, daysIdle: 4 });
    expect(active).toEqual(expect.arrayContaining(["streak-broken", "idle"]));
  });

  it("picks the tip of the most urgent active trigger, and changes from day to day", () => {
    const tip = tipFor(["leeches", "general"], "2026-10-22");
    expect(tip?.trigger).toBe("leeches");
    const seen = new Set(
      Array.from({ length: 12 }, (_, d) => tipFor(["leeches"], `2026-10-${String(d + 10).padStart(2, "0")}`)?.id),
    );
    expect(seen.size).toBeGreaterThan(1);
    expect(tipFor(["leeches"], "2026-10-22")).toEqual(tipFor(["leeches"], "2026-10-22"));
  });

  it("keeps the daily index inside the list", () => {
    for (const key of ["2026-01-01", "2026-10-22", "2030-12-31"]) {
      const i = dailyIndex(key, 7);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(7);
    }
    expect(dailyIndex("2026-10-22", 0)).toBe(0);
  });
});

describe("culture notes", () => {
  it("has at least 40 notes with unique ids and text", () => {
    expect(CULTURE.length).toBeGreaterThanOrEqual(40);
    expect(new Set(CULTURE.map((c) => c.id)).size).toBe(CULTURE.length);
    for (const c of CULTURE) {
      expect(c.title.trim(), c.id).not.toBe("");
      expect(c.text.trim(), c.id).not.toBe("");
    }
  });
});
