"use client";

import { useEffect, useState } from "react";
import { loadKanji, loadStrokes, loadWords, type PackKanji, type PackWord } from "./packs";
import type { Level } from "@/lib/types";

export interface PackState {
  words?: Map<string, PackWord>;
  kanji?: Map<string, PackKanji>;
  strokes?: Record<string, string[]>;
  error?: string;
}

/** Loads one level's study packs the first time they are needed. Nothing is fetched for kana. */
export function usePack(level: Level | undefined): PackState {
  const [state, setState] = useState<PackState>({});

  useEffect(() => {
    if (!level) return;
    let live = true;
    Promise.all([loadWords(level), loadKanji(level), loadStrokes(level)])
      .then(([words, kanji, strokes]) => live && setState({ words, kanji, strokes }))
      .catch((err: unknown) => live && setState({ error: err instanceof Error ? err.message : "Study content is unavailable." }));
    return () => {
      live = false;
    };
  }, [level]);

  return state;
}
