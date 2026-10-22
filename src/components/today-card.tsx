"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AudioButton } from "@/components/lesson/exercises";
import { Card, ProgressBar } from "@/components/ui";
import { CULTURE } from "@/content/culture";
import { loadLevel } from "@/content/loader";
import { loadExtras, type PackExtra } from "@/content/packs";
import { dailyIndex } from "@/lib/coaching";
import { dayKey } from "@/lib/dates";
import type { StudyItem } from "@/lib/types";
import { useProgress } from "@/store/progress";

function Pick({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted">{label}</div>
      {children}
    </div>
  );
}

/** The home screen's daily plan: goal progress, the next lesson, and one word, kanji, proverb and culture note. */
export function TodayCard({ nextId }: { nextId?: string }) {
  const today = dayKey();
  const xp = useProgress((s) => s.days[today]?.xp ?? 0);
  const goal = useProgress((s) => s.settings.dailyGoal);
  const due = useProgress((s) => Object.values(s.cards).filter((c) => c.due <= Date.now()).length);

  const [words, setWords] = useState<StudyItem[]>([]);
  const [kanji, setKanji] = useState<StudyItem[]>([]);
  const [proverbs, setProverbs] = useState<PackExtra[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadLevel("n5")
      .then(({ vocab, kanji: k }) => {
        if (cancelled) return;
        setWords(vocab);
        setKanji(k);
      })
      .catch(() => undefined);
    // Proverbs come from the study packs, so they are simply left out when the packs are not available.
    loadExtras()
      .then((list) => !cancelled && setProverbs(list.filter((e) => e.kind === "proverb")))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const word = words[dailyIndex(today, words.length)];
  const character = kanji[dailyIndex(`${today}k`, kanji.length)];
  const proverb = proverbs[dailyIndex(today, proverbs.length)];
  const culture = CULTURE[dailyIndex(today, CULTURE.length)];
  const date = new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

  return (
    <Card className="mb-6 flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-extrabold">Today</div>
        <div className="text-sm text-muted">{date}</div>
      </div>

      <div>
        <div className="flex justify-between text-sm">
          <span className="font-bold">Daily goal</span>
          <span className="text-muted">
            {xp} / {goal} XP
          </span>
        </div>
        <ProgressBar value={Math.min(1, xp / goal)} className="mt-2 h-3" />
      </div>

      <div className="flex flex-wrap gap-2">
        {nextId && (
          <Link
            href={`/lesson?id=${nextId}`}
            className="btn-3d inline-flex min-h-11 items-center rounded-2xl bg-primary px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white"
          >
            Next lesson
          </Link>
        )}
        <Link
          href="/review"
          className="inline-flex min-h-11 items-center rounded-2xl border-2 border-border bg-surface px-4 py-2 text-sm font-extrabold uppercase tracking-wide"
        >
          {due} due
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {word && (
          <Pick label="Word of the day">
            <div className="flex items-center gap-3">
              <AudioButton text={word.reading} size="sm" />
              <div className="min-w-0">
                <div className="jp text-2xl font-bold">{word.front}</div>
                {word.reading !== word.front && <div className="jp text-sm text-muted">{word.reading}</div>}
                <div className="truncate text-sm">{word.meanings.slice(0, 3).join(", ")}</div>
              </div>
            </div>
          </Pick>
        )}
        {character && (
          <Pick label="Kanji of the day">
            <div className="flex items-center gap-3">
              <span className="jp text-4xl font-bold">{character.front}</span>
              <div className="min-w-0 text-sm">
                <div className="font-bold">{character.meanings.slice(0, 3).join(", ")}</div>
                <div className="jp text-muted">{[...(character.on ?? []), ...(character.kun ?? [])].slice(0, 3).join("、")}</div>
              </div>
            </div>
          </Pick>
        )}
        {proverb && (
          <Pick label="Proverb">
            <div className="jp text-lg font-bold">{proverb.text}</div>
            <div className="jp text-sm text-muted">{proverb.reading}</div>
            <div className="text-sm">{proverb.meaning}</div>
          </Pick>
        )}
        <Pick label={`Culture · ${culture.title}`}>
          <p className="text-sm">{culture.text}</p>
        </Pick>
      </div>
    </Card>
  );
}
