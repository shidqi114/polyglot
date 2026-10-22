import { describe, expect, it } from "vitest";
import { BackupError, parseBackup } from "@/lib/backup";

const card = { due: 1_800_000_000_000, s: 1, d: 5, sd: 1, ls: 0, reps: 1, lapses: 0, st: 2, lr: 1_800_000_000_000, up: 1_800_000_000_000 };
const exported = {
  app: "polyglot",
  version: 1,
  exportedAt: "2026-10-22T00:00:00.000Z",
  lessons: { "kana-h-0-0": { done: 1_800_000_000_000, best: 0.9, times: 1, up: 1_800_000_000_000 } },
  cards: { "k:あ": card },
  days: { "2026-10-22": { xp: 10, lessons: 1, reviews: 0 } },
  settings: { dailyGoal: 20, theme: "dark" },
};

describe("parseBackup", () => {
  it("accepts an export made by the app", () => {
    const backup = parseBackup(JSON.stringify(exported));
    expect(backup.cards["k:あ"].reps).toBe(1);
    expect(backup.settings?.theme).toBe("dark");
  });

  it("rejects other files and malformed JSON", () => {
    expect(() => parseBackup(JSON.stringify({ ...exported, app: "other" }))).toThrow(BackupError);
    expect(() => parseBackup("{not json")).toThrow("not valid JSON");
  });

  it("rejects keys that are not study items or dates (prototype pollution)", () => {
    const polluted = '{"app":"polyglot","version":1,"lessons":{},"days":{},"cards":{"__proto__":' + JSON.stringify(card) + "}}";
    expect(() => parseBackup(polluted)).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ ...exported, days: { constructor: { xp: 1, lessons: 0, reviews: 0 } } }))).toThrow(BackupError);
  });

  it("rejects unexpected fields and out-of-range values", () => {
    expect(() => parseBackup(JSON.stringify({ ...exported, cards: { "k:あ": { ...card, extra: 1 } } }))).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ ...exported, cards: { "k:あ": { ...card, d: 99 } } }))).toThrow(BackupError);
    expect(() => parseBackup(JSON.stringify({ ...exported, settings: { theme: "neon" } }))).toThrow(BackupError);
  });

  it("refuses files over 5 MB", () => {
    const huge = JSON.stringify({ ...exported, exportedAt: "x".repeat(6 * 1024 * 1024) });
    expect(() => parseBackup(huge)).toThrow("larger than 5 MB");
  });
});
