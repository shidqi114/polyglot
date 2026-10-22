import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, evaluate, type Progress } from "@/lib/achievements";
import { addDays, dayKey } from "@/lib/dates";
import { KANA_ROWS } from "@/content/kana";
import type { SrsCard } from "@/lib/srs";

const card = (over: Partial<SrsCard> = {}): SrsCard => ({
  due: 0, s: 1, d: 5, sd: 1, ls: 0, reps: 0, lapses: 0, st: 2, lr: null, up: 0, ...over,
});

const empty = (): Progress => ({
  lessons: {},
  cards: {},
  days: {},
  notes: {},
  settings: { dailyGoal: 20, theme: "system", sound: true, autoplayAudio: true, ttsRate: 0.9, showReadings: true },
});

const unlocked = (p: Progress) => evaluate(p).filter((a) => a.unlocked).map((a) => a.id);

describe("achievements", () => {
  it("has unique ids, and every achievement has a title, a description and a target", () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(35);
    for (const a of ACHIEVEMENTS) {
      expect(a.title.trim(), a.id).not.toBe("");
      expect(a.description.trim(), a.id).not.toBe("");
      expect(a.target, a.id).toBeGreaterThan(0);
    }
  });

  it("unlocks nothing for a new account", () => {
    expect(unlocked(empty())).toEqual([]);
  });

  it("unlocks the first-lesson achievement after one lesson, and not the next tier", () => {
    const p = { ...empty(), lessons: { "kana-h-0-0": { done: 1, best: 0.5, times: 1, up: 1 } } };
    expect(unlocked(p)).toContain("first-lesson");
    expect(unlocked(p)).not.toContain("lessons-10");
  });

  it("counts study days in a row for streaks, and days at the goal", () => {
    const today = dayKey();
    const days = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [addDays(today, -i), { xp: 20, lessons: 1, reviews: 0 }]),
    );
    const ids = unlocked({ ...empty(), days });
    expect(ids).toContain("streak-7");
    expect(ids).not.toContain("streak-30");
    expect(ids).toContain("goal-5");
  });

  it("does not count days below the daily goal toward goal achievements", () => {
    const today = dayKey();
    const days = Object.fromEntries(Array.from({ length: 5 }, (_, i) => [addDays(today, -i), { xp: 19, lessons: 0, reviews: 0 }]));
    expect(unlocked({ ...empty(), days })).not.toContain("goal-5");
  });

  it("completes a kana row when every character in it has a card", () => {
    const row = KANA_ROWS.hiragana[0].items.map((i) => i.id);
    const cards = Object.fromEntries(row.map((id) => [id, card({ reps: 1 })]));
    expect(unlocked({ ...empty(), cards })).toContain("rows-1");
  });

  it("gives the solid-memory achievements to well-reviewed items, and withholds no-leeches when one keeps slipping", () => {
    const cards = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [`v:w${i}:r`, card({ reps: 5 })]));
    expect(unlocked({ ...empty(), cards })).toEqual(expect.arrayContaining(["strong-20", "no-leeches"]));
    const withLeech = { ...cards, "v:leech:r": card({ reps: 6, lapses: 4 }) };
    const ids = unlocked({ ...empty(), cards: withLeech });
    expect(ids).toContain("strong-20");
    expect(ids).not.toContain("no-leeches");
  });

  it("unlocks the flawless lesson achievement from a lesson done with no mistakes", () => {
    const p = { ...empty(), lessons: { "kana-h-0-0": { done: 1, best: 1, times: 1, up: 1 } } };
    expect(unlocked(p)).toContain("flawless-1");
  });

  it("counts XP across all days", () => {
    const days = { "2026-10-20": { xp: 60, lessons: 1, reviews: 0 }, "2026-10-21": { xp: 40, lessons: 1, reviews: 0 } };
    expect(unlocked({ ...empty(), days })).toContain("xp-100");
  });
});
