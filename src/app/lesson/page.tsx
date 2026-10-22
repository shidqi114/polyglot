"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CompleteScreen } from "@/components/lesson/complete";
import { LessonPlayer, type PlayerResult } from "@/components/lesson/player";
import { Button } from "@/components/ui";
import { LESSON_BY_ID } from "@/content/course";
import { GRAMMAR_BY_ID } from "@/content/grammar";
import { getLessonItems } from "@/content/loader";
import { loadWords } from "@/content/packs";
import { nextLessonId } from "@/lib/course-progress";
import { buildGrammarLesson, buildItemLesson } from "@/lib/lesson-engine";
import { addClozeExercises } from "@/lib/pack-exercises";
import type { Exercise } from "@/lib/types";
import { useProgress } from "@/store/progress";

const BASE_XP = 10;
const PERFECT_BONUS = 5;

function LessonRoute() {
  const lessonId = useSearchParams().get("id") ?? "";
  // Keyed so that "Next lesson" starts from a clean state.
  return <Lesson key={lessonId} lessonId={lessonId} />;
}

export default function LessonPage() {
  return (
    <Suspense>
      <LessonRoute />
    </Suspense>
  );
}

function Lesson({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const lesson = LESSON_BY_ID.get(lessonId);
  const completeLesson = useProgress((s) => s.completeLesson);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<(PlayerResult & { xp: number }) | null>(null);

  useEffect(() => {
    if (!lesson) return;
    let cancelled = false;
    setExercises(null);
    (async () => {
      try {
        if (lesson.kind === "grammar") {
          const g = GRAMMAR_BY_ID.get(lesson.grammarId!);
          if (!g) throw new Error("missing grammar");
          if (!cancelled) setExercises(buildGrammarLesson(g));
        } else {
          const { items, pool } = await getLessonItems(lesson);
          const built = buildItemLesson(items, pool);
          // Vocabulary lessons add sentence cloze questions when the study pack is available offline or online.
          const words = lesson.kind === "vocab" ? await loadWords(lesson.level!).catch(() => undefined) : undefined;
          if (!cancelled) setExercises(words ? addClozeExercises(built, items, words, pool) : built);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson]);

  if (!lesson || error)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-lg font-bold">{lesson ? "Couldn’t load this lesson. Are you offline?" : "Lesson not found."}</p>
        <Button onClick={() => router.push("/")}>Back to path</Button>
      </div>
    );

  if (result) {
    const accuracy = result.graded ? result.correctFirstTry / result.graded : 1;
    const next = nextLessonId(lesson.id);
    return (
      <CompleteScreen
        title="Lesson complete!"
        subtitle={lesson.title}
        xp={result.xp}
        accuracy={accuracy}
        durationMs={result.durationMs}
        primaryLabel="Continue"
        onPrimary={() => router.push("/")}
        secondaryLabel={next ? "Next lesson" : undefined}
        onSecondary={next ? () => router.push(`/lesson?id=${next}`) : undefined}
      />
    );
  }

  if (!exercises)
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="jp animate-pulse text-5xl font-bold text-primary">読</span>
      </div>
    );

  return (
    <LessonPlayer
      exercises={exercises}
      onExit={() => router.push("/")}
      onFinish={(r) => {
        const accuracy = r.graded ? r.correctFirstTry / r.graded : 1;
        const xp = BASE_XP + (accuracy === 1 ? PERFECT_BONUS : 0);
        completeLesson(
          lesson.id,
          accuracy,
          xp,
          [...r.items].map(([itemId, correct]) => ({ itemId, correct })),
        );
        setResult({ ...r, xp });
      }}
    />
  );
}
