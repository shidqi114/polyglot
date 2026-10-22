import { describe, expect, it } from "vitest";
import { ALL_LESSONS, COURSE } from "@/content/course";
import { GRAMMAR, GRAMMAR_BY_ID } from "@/content/grammar";
import { ALL_KANA, KANA_BY_ID } from "@/content/kana";
import { getLessonItems, loadIndex } from "@/content/loader";

describe("course", () => {
  it("has unique lesson ids and starts with kana", () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(COURSE[0].id).toBe("kana");
    expect(COURSE.map((s) => s.id)).toEqual(["kana", "n5", "n4", "n3", "n2", "n1"]);
  });

  it("covers all 208 kana exactly once", () => {
    const kanaIds = ALL_LESSONS.filter((l) => l.kind === "kana").flatMap((l) => l.itemIds!);
    expect(kanaIds).toHaveLength(ALL_KANA.length);
    expect(new Set(kanaIds).size).toBe(ALL_KANA.length);
    for (const id of kanaIds) expect(KANA_BY_ID.has(id)).toBe(true);
  });

  it("references every grammar lesson", () => {
    const used = ALL_LESSONS.filter((l) => l.kind === "grammar").map((l) => l.grammarId);
    expect(new Set(used)).toEqual(new Set(GRAMMAR.map((g) => g.id)));
    for (const id of used) expect(GRAMMAR_BY_ID.has(id!)).toBe(true);
  });

  it("every vocab and kanji lesson resolves to items with meanings", async () => {
    for (const lesson of ALL_LESSONS.filter((l) => l.kind === "vocab" || l.kind === "kanji")) {
      const { items, pool } = await getLessonItems(lesson);
      expect(items.length).toBe(lesson.range![1] - lesson.range![0]);
      expect(items.length).toBeGreaterThan(0);
      expect(pool.length).toBeGreaterThanOrEqual(items.length);
      for (const it of items) {
        expect(it.meanings.length).toBeGreaterThan(0);
        expect(it.reading.length).toBeGreaterThan(0);
      }
    }
  });

  it("item ids are unique and safe as Firestore document ids", async () => {
    const index = await loadIndex();
    for (const id of index.keys()) {
      expect(id).not.toContain("/");
      expect(id).not.toMatch(/^__.*__$/);
    }
    expect(index.size).toBeGreaterThan(9000);
  });
});
