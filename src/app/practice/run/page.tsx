"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CompleteScreen } from "@/components/lesson/complete";
import { LessonPlayer, type PlayerResult } from "@/components/lesson/player";
import { Button } from "@/components/ui";
import { MODE_INFO, setFor, type SetMode } from "@/content/practice-sets";
import { buildPracticeExercise, shuffle, type PracticeMode } from "@/lib/lesson-engine";
import { clozeExercise, conjugationExercise } from "@/lib/pack-exercises";
import { loadWords } from "@/content/packs";
import type { Exercise, Level, StudyItem } from "@/lib/types";
import type { SessionPlan } from "@/lib/topic-sessions";
import { useProgress } from "@/store/progress";

const SESSION_SIZE = 15;
const BASE_XP = 10;
const PERFECT_BONUS = 5;

function PracticeRun() {
  const params = useSearchParams();
  const setId = params.get("set") ?? "";
  const mode = (params.get("mode") ?? "pick") as SetMode;
  const learnedOnly = params.get("learned") === "1";
  const router = useRouter();
  const addXp = useProgress((s) => s.addXp);
  const completeLesson = useProgress((s) => s.completeLesson);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<(PlayerResult & { xp: number }) | null>(null);
  const [round, setRound] = useState(0);
  // Memoised: the effect below depends on the set, and a new object each render would start the session again forever.
  const set = useMemo(() => setFor(setId), [setId]);
  const validMode = set?.modes.includes(mode);
  const back = set?.backHref ?? "/practice";

  useEffect(() => {
    if (!set || !validMode) return;
    let cancelled = false;
    (async () => {
      if (set.session) {
        const next = await set.session(mode);
        if (cancelled) return;
        setPlan(next);
        if (next.exercises.length) setExercises(next.exercises);
        else setMessage(next.message ?? "Nothing to study here yet.");
        return;
      }
      const pick = mode as PracticeMode;
      const all = await set.load();
      const cards = useProgress.getState().cards;
      const candidates = learnedOnly ? all.filter((i) => cards[i.id]) : all;
      if (candidates.length < 4) {
        if (!cancelled) setMessage("Learn a few more items in lessons first, or turn off “Only items I’ve learned”.");
        return;
      }
      const picked = shuffle(candidates).slice(0, SESSION_SIZE);
      if (pick === "sentence" || pick === "conjugation") {
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
            return pick === "sentence" ? clozeExercise(it, word, all) : conjugationExercise(it, word, others);
          })
          .filter((ex): ex is NonNullable<typeof ex> => ex !== null);
        if (!cancelled) {
          if (built.length < 4) setMessage("Not enough examples for this set yet. Try another mode or set.");
          else setExercises(built);
        }
        return;
      }
      if (!cancelled) setExercises(picked.map((it: StudyItem) => buildPracticeExercise(it, all, pick)));
    })().catch(() => !cancelled && setMessage("Couldn’t load practice items. Are you offline?"));
    return () => {
      cancelled = true;
    };
  }, [set, validMode, mode, learnedOnly, round]);

  if (!set || !validMode || message)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-sm text-lg font-bold">{message ?? "Practice set not found."}</p>
        <Button onClick={() => router.push(back)}>Back</Button>
      </div>
    );

  const isLearn = mode === "learn" && !!plan?.lesson;

  if (result)
    return (
      <CompleteScreen
        title={isLearn ? "Lesson complete!" : "Practice complete!"}
        subtitle={`${set.title} · ${MODE_INFO[mode].title}`}
        xp={result.xp}
        accuracy={result.graded ? result.correctFirstTry / result.graded : 1}
        durationMs={result.durationMs}
        primaryLabel={isLearn ? "Continue" : "Practice again"}
        onPrimary={isLearn ? () => router.push(back) : () => {
          setResult(null);
          setExercises(null);
          setRound((r) => r + 1);
        }}
        secondaryLabel="Done"
        onSecondary={() => router.push(back)}
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
      onExit={() => router.push(back)}
      onFinish={(r) => {
        const accuracy = r.graded ? r.correctFirstTry / r.graded : 1;
        if (plan?.lesson) {
          // A Learn run is a lesson: its words become review cards, and the lesson is recorded on the progress.
          const xp = BASE_XP + (accuracy === 1 ? PERFECT_BONUS : 0);
          completeLesson(plan.lesson.id, accuracy, xp, [...r.items].map(([itemId, correct]) => ({ itemId, correct })));
          setResult({ ...r, xp });
          return;
        }
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
