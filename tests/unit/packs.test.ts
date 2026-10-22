import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { morae } from "@/lib/mora";
import type { Level } from "@/lib/types";

// Integrity checks on the generated knowledge packs (npm run packs). They read the files on disk.
const ROOT = path.join(process.cwd(), "public/packs/v1");
const LEVELS: Level[] = ["n5", "n4", "n3", "n2", "n1"];
const read = <T>(file: string): T => JSON.parse(readFileSync(path.join(ROOT, file), "utf8")) as T;

const manifest = read<{ version: number; levels: Record<string, { words: number }>; licenses: unknown[] }>("manifest.json");
const vocabIds = (level: Level) =>
  new Map((read<{ id: string; r: string }[]>(`../../../src/content/generated/vocab-${level}.json`) ?? []).map((v) => [v.id, v.r]));

describe("knowledge packs", () => {
  it("ships a manifest for every level with licences", () => {
    expect(manifest.version).toBe(1);
    expect(Object.keys(manifest.levels).sort()).toEqual([...LEVELS].sort());
    expect(manifest.licenses.length).toBeGreaterThanOrEqual(4);
  });

  for (const level of LEVELS) {
    describe(level, () => {
      const words = read<{ id: string; pitch?: number[]; verb?: string; forms?: Record<string, string>; ex?: { ja: unknown[]; en: string }[] }[]>(
        `${level}/words.json`,
      );
      const readings = vocabIds(level);

      it("has one record per bundled word, with the same ids", () => {
        expect(words.length).toBe(manifest.levels[level].words);
        for (const w of words) expect(readings.has(w.id), w.id).toBe(true);
      });

      it("keeps pitch accents within the word's mora count", () => {
        for (const w of words.filter((x) => x.pitch)) {
          const count = morae(readings.get(w.id) ?? "").length;
          for (const accent of w.pitch!) expect(Number.isInteger(accent) && accent >= 0 && accent <= count, `${w.id} ${accent}/${count}`).toBe(true);
        }
      });

      it("contains only text in examples (no markup) and well-formed segments", () => {
        for (const w of words.filter((x) => x.ex)) {
          for (const ex of w.ex!) {
            expect(ex.en.length).toBeGreaterThan(0);
            expect(/[<>]/.test(ex.en), w.id).toBe(false);
            for (const seg of ex.ja as unknown[]) {
              if (typeof seg === "string") {
                expect(seg.length, w.id).toBeGreaterThan(0);
                expect(/[<>]/.test(seg), w.id).toBe(false);
              } else {
                expect(Array.isArray(seg) && seg.length === 2 && seg.every((p) => typeof p === "string" && p.length > 0), w.id).toBe(true);
              }
            }
          }
        }
      });

      it("keeps verb forms as plain strings", () => {
        for (const w of words.filter((x) => x.forms)) {
          for (const value of Object.values(w.forms!)) expect(typeof value === "string" && value.length > 0 && !/[<>]/.test(value)).toBe(true);
        }
      });

      it("has valid stroke paths for every kanji that has them", () => {
        const strokes = read<Record<string, string[]>>(`${level}/strokes.json`);
        for (const [id, paths] of Object.entries(strokes)) {
          expect(id.startsWith("j:")).toBe(true);
          for (const d of paths) expect(/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/.test(d), id).toBe(true);
        }
      });
    });
  }

  it("ships proverbs and idioms, without markup", () => {
    const extras = read<{ kind: string; text: string; reading: string; meaning: string }[]>("extras.json");
    expect(extras.some((e) => e.kind === "proverb")).toBe(true);
    expect(extras.some((e) => e.kind === "idiom")).toBe(true);
    for (const e of extras) {
      expect(["proverb", "idiom"]).toContain(e.kind);
      expect(e.text.length && e.meaning.length && !/[<>]/.test(e.meaning)).toBeTruthy();
    }
  });

  it("is committed next to the code that reads it", () => {
    expect(existsSync(path.join(ROOT, "extras.json"))).toBe(true);
  });
});
