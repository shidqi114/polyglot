"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CompleteScreen } from "@/components/lesson/complete";
import { LessonPlayer, type PlayerResult } from "@/components/lesson/player";
import { Button } from "@/components/ui";
import { MODE_INFO, PRACTICE_BY_ID } from "@/content/practice-sets";
import { buildPracticeExercise, shuffle, type PracticeMode } from "@/lib/lesson-engine";
import { clozeExercise, conjugationExercise } from "@/lib/pack-exercises";
import { loadWords } from "@/content/packs";
import type { Level } from "@/lib/types";
import type { Exercise } from "@/lib/types";
import { useProgress } from "@/store/progress";

const SESSION_SIZE = 15;

function PracticeRun() {
  const params = useSearchParams();
  const setId = params.get("set") ?? "";
  const mode = (params.get("mode") ?? "pick") as PracticeMode;
  const learnedOnly = params.get("learned") === "1";
  const router = useRouter();
  const addXp = useProgress((s) => s.addXp);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<(PlayerResult & { xp: number }) | null>(null);
  const [round, setRound] = useState(0);
  const set = PRACTICE_BY_ID.get(setId);
  const validMode = set?.modes.includes(mode);

  useEffect(() => {
    if (!set || !validMode) return;
    let cancelled = false;
    (async () => {
      const all = await set.load();
      const cards = useProgress.getState().cards;
      const candidates = learnedOnly ? all.filter((i) => cards[i.id]) : all;
      if (candidates.length < 4) {
        if (!cancelled) setMessage("Learn a few more items in lessons first, or turn off “Only items I’ve learned”.");
        return;
      }
      const picked = shuffle(candidates).slice(0, SESSION_SIZE);
      if (mode === "sentence" || mode === "conjugation") {
        // Pack-based drills: only for vocabulary sets, where the level is known.
        const level = set.id.startsWith("vocab-") ? (set.id.slice(6) as Level) : undefined;
        const words = level ? await loadWords(level) : undefined;
        if (!words) {
          if (!cancelled) setMessage("These drills need the study content. Download it from Profile, then try again.");
          return;
        }
        const others = [...words.values()].filter((w) => w.forms);
        const built = picked
          .map((it) => {
            const word = words.get(it.id);
            if (!word) return null;
            return mode === "sentence" ? clozeExercise(it, word, all) : conjugationExercise(it, word, others);
          })
          .filter((ex): ex is NonNullable<typeof ex> => ex !== null);
        if (!cancelled) {
          if (built.length < 4) setMessage("Not enough examples for this set yet. Try another mode or set.");
          else setExercises(built);
        }
        return;
      }
      if (!cancelled) setExercises(picked.map((it) => buildPracticeExercise(it, all, mode)));
    })().catch(() => !cancelled && setMessage("Couldn’t load practice items. Are you offline?"));
    return () => {
      cancelled = true;
    };
  }, [set, validMode, mode, learnedOnly, round]);

  if (!set || !validMode || message)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm text-lg font-bold">{message ?? "Practice set not found."}</p>
        <Button onClick={() => router.push("/practice")}>Back</Button>
      </div>
    );

  if (result)
    return (
      <CompleteScreen
        title="Practice complete!"
        subtitle={`${set.title} · ${MODE_INFO[mode].title}`}
        xp={result.xp}
        accuracy={result.graded ? result.correctFirstTry / result.graded : 1}
        durationMs={result.durationMs}
        primaryLabel="Practice again"
        onPrimary={() => {
          setResult(null);
          setExercises(null);
          setRound((r) => r + 1);
        }}
        secondaryLabel="Done"
        onSecondary={() => router.push("/practice")}
      />
    );

  if (!exercises)
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="jp animate-pulse text-5xl font-bold text-primary">練</span>
      </div>
    );

  return (
    <LessonPlayer
      key={round}
      exercises={exercises}
      repeatMistakes={false}
      onExit={() => router.push("/practice")}
      onFinish={(r) => {
        const xp = Math.floor(r.correctFirstTry / 2);
        addXp(xp);
        setResult({ ...r, xp });
      }}
    />
  );
}

export default function PracticeRunPage() {
  return (
    <Suspense>
      <PracticeRun />
    </Suspense>
  );
}
