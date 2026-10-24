"use client";

import { Check, Flag, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BuildExercise, ChoiceExercise, GrammarNote, InputExercise, IntroCard, MatchExercise, AudioButton } from "./exercises";
import { Button, cn, ProgressBar } from "../ui";
import { checkBuild, checkInput } from "@/lib/answer-check";
import { explainChoice, explainKana } from "@/lib/explain";
import { hideSentence } from "@/lib/hidden-sentences";
import { toKana } from "wanakana";
import { retry } from "@/lib/lesson-engine";
import { sounds, vibrate } from "@/lib/sound";
import type { Exercise } from "@/lib/types";
import { useProgress } from "@/store/progress";

export interface PlayerResult {
  /** item id → answered correctly on every first attempt */
  items: Map<string, boolean>;
  graded: number;
  correctFirstTry: number;
  durationMs: number;
}

interface Props {
  exercises: Exercise[];
  onExit: () => void;
  onFinish: (r: PlayerResult) => void;
  /** Called on the first attempt of each graded exercise. */
  onGraded?: (ex: Exercise, correct: boolean) => void;
  /** Missed questions come back at the end (default true). */
  repeatMistakes?: boolean;
}

type Feedback = { correct: boolean; answer?: string; audio?: string; notes?: string[] } | null;

/** Why a typed answer was wrong, from the typed text and the expected kana. */
function inputNotes(ex: Extract<Exercise, { type: "input" }>, typed: string): string[] {
  const expected = (ex.answers[0] ?? "").replace(/[()\s]/g, "");
  if (ex.mode === "kana") return explainKana(typed, expected);
  if (ex.mode === "romaji") return explainKana(toKana(typed), expected);
  return [];
}

const PRAISE = ["Nice!", "Great job!", "Correct!", "Awesome!", "すごい！", "Excellent!", "いいね！"];
const MAX_RETRIES = 2;

export function LessonPlayer({ exercises, onExit, onFinish, onGraded, repeatMistakes = true }: Props) {
  const soundOn = useProgress((s) => s.settings.sound);
  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  /** The exercise whose sentence the learner hid, so the button can say so. */
  const [hiddenKey, setHiddenKey] = useState<string | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [built, setBuilt] = useState<number[]>([]);
  const [confirmExit, setConfirmExit] = useState(false);
  const [praise, setPraise] = useState(PRAISE[0]);

  const stats = useRef({ items: new Map<string, boolean>(), graded: 0, correct: 0, start: Date.now() });
  const retries = useRef(new Map<string, number>()); // original key → retries
  const originOf = useRef(new Map<string, string>()); // retry key → original key
  const total = exercises.length;
  const ex = queue[idx];

  const progress = Math.min(1, (idx + (feedback ? 1 : 0)) / Math.max(total, queue.length));

  const reset = () => {
    setChoice(null);
    setText("");
    setBuilt([]);
    setFeedback(null);
  };

  const finish = useCallback(() => {
    const s = stats.current;
    if (soundOn) sounds.complete();
    onFinish({ items: s.items, graded: s.graded, correctFirstTry: s.correct, durationMs: Date.now() - s.start });
  }, [onFinish, soundOn]);

  const advance = useCallback(() => {
    if (idx + 1 >= queue.length) finish();
    else {
      setIdx(idx + 1);
      reset();
    }
  }, [idx, queue.length, finish]);

  const grade = useCallback(
    (correct: boolean, answer?: string, audio?: string, notes?: string[]) => {
      if (!ex) return;
      const origin = originOf.current.get(ex.key) ?? ex.key;
      const first = origin === ex.key;
      if (first) {
        stats.current.graded++;
        if (correct) stats.current.correct++;
        onGraded?.(ex, correct);
      }
      const itemId = "itemId" in ex ? ex.itemId : undefined;
      if (itemId && first) stats.current.items.set(itemId, (stats.current.items.get(itemId) ?? true) && correct);
      if (!correct && repeatMistakes) {
        const n = retries.current.get(origin) ?? 0;
        if (n < MAX_RETRIES) {
          retries.current.set(origin, n + 1);
          const again = retry(ex);
          originOf.current.set(again.key, origin);
          setQueue((q) => [...q, again]);
        }
      }
      if (soundOn) (correct ? sounds.correct : sounds.wrong)();
      if (!correct) vibrate(80);
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      setFeedback({ correct, answer, audio, notes: correct ? undefined : notes });
    },
    [ex, onGraded, repeatMistakes, soundOn],
  );

  const canCheck =
    !!ex &&
    !feedback &&
    ((ex.type === "choice" && choice != null) ||
      (ex.type === "input" && text.trim().length > 0) ||
      (ex.type === "build" && built.length > 0));

  const check = useCallback(() => {
    if (!ex || feedback) return;
    if (ex.type === "choice" && choice != null) {
      const picked = ex.options[choice];
      const correct = picked.correct;
      if (!correct && ex.itemId) useProgress.getState().recordConfusion(ex.itemId, picked.label);
      grade(
        correct,
        correct ? undefined : ex.answer,
        ex.optionsJapanese ? ex.answer : ex.audio,
        correct ? undefined : explainChoice(ex.answer, picked.label),
      );
    } else if (ex.type === "input" && text.trim()) {
      const correct = checkInput(ex, text);
      grade(correct, ex.answer, ex.audio, correct ? undefined : inputNotes(ex, text));
    } else if (ex.type === "build" && built.length) {
      const chosen = built.map((i) => ex.tiles[i]);
      grade(checkBuild(ex.answer, chosen), ex.answer.join(""), ex.kana);
    }
  }, [ex, feedback, choice, text, built, grade]);

  const ungraded = ex?.type === "intro" || ex?.type === "note";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.isComposing) return;
      if (e.target instanceof HTMLInputElement && !feedback) return; // the input handles its own Enter
      if (e.target instanceof HTMLButtonElement) return; // a focused button already clicks on Enter
      e.preventDefault();
      if (feedback || ungraded) advance();
      else if (canCheck) check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [feedback, ungraded, canCheck, check, advance]);

  if (!ex) return null;

  return (
    <div className="flex h-dvh flex-col">
      <header className="pt-safe">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-4">
          <button aria-label="Quit" onClick={() => setConfirmExit(true)} className="text-muted hover:text-text">
            <X className="h-7 w-7" strokeWidth={3} />
          </button>
          <ProgressBar value={progress} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div key={ex.key} className="animate-pop mx-auto w-full max-w-2xl px-4 py-4 sm:py-10">
          {ex.type === "intro" && <IntroCard ex={ex} />}
          {ex.type === "note" && <GrammarNote lesson={ex.lesson} />}
          {ex.type === "choice" && <ChoiceExercise ex={ex} value={choice} onChange={setChoice} locked={!!feedback} />}
          {ex.type === "input" && (
            <InputExercise ex={ex} value={text} onChange={setText} onSubmit={() => (feedback ? advance() : check())} locked={!!feedback} />
          )}
          {ex.type === "build" && <BuildExercise ex={ex} value={built} onChange={setBuilt} locked={!!feedback} />}
          {ex.type === "match" && (
            <MatchExercise
              ex={ex}
              onMistake={() => undefined}
              onDone={() => {
                stats.current.graded++;
                stats.current.correct++;
                setFeedback({ correct: true });
              }}
            />
          )}
        </div>
      </main>

      <footer
        className={cn(
          "pb-safe border-t-2 transition-colors",
          !feedback && "border-border",
          feedback?.correct && "border-transparent bg-primary-soft",
          feedback && !feedback.correct && "border-transparent bg-red-soft",
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-6">
          {feedback ? (
            <div className={cn("flex items-center gap-3", feedback.correct ? "text-primary-dark dark:text-primary" : "text-red")}>
              <span className={cn("hidden h-14 w-14 items-center justify-center rounded-full bg-surface sm:flex")}>
                {feedback.correct ? <Check className="h-8 w-8" strokeWidth={4} /> : <X className="h-8 w-8" strokeWidth={4} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xl font-black">{feedback.correct ? praise : "Correct answer:"}</div>
                {!feedback.correct && feedback.answer && <div className="jp text-lg font-semibold">{feedback.answer}</div>}
                {!feedback.correct &&
                  feedback.notes?.map((note) => (
                    <p key={note} className="mt-1 text-sm">
                      {note}
                    </p>
                  ))}
              </div>
              {feedback.audio && <AudioButton text={feedback.audio} size="sm" />}
              {ex.type === "choice" && ex.hideKey && (
                <button
                  type="button"
                  disabled={hiddenKey === ex.key}
                  onClick={() => {
                    hideSentence(ex.hideKey!);
                    setHiddenKey(ex.key);
                  }}
                  className="shrink-0 text-sm font-bold text-muted underline disabled:no-underline"
                >
                  {hiddenKey === ex.key ? "Hidden" : "Hide this sentence"}
                </button>
              )}
            </div>
          ) : (
            <div className="hidden sm:block">
              {!ungraded && ex.type !== "match" && (
                <Button variant="secondary" onClick={() => grade(false, "answer" in ex ? (Array.isArray(ex.answer) ? ex.answer.join("") : ex.answer) : undefined)}>
                  Skip
                </Button>
              )}
            </div>
          )}
          {ungraded || feedback ? (
            <Button variant={feedback && !feedback.correct ? "danger" : "primary"} className="w-full sm:w-44" onClick={advance} autoFocus>
              Continue
            </Button>
          ) : ex.type === "match" ? (
            <span className="text-sm text-muted sm:ml-auto">Match all pairs to continue</span>
          ) : (
            <Button className="w-full sm:w-44" disabled={!canCheck} onClick={check}>
              Check
            </Button>
          )}
        </div>
      </footer>

      {confirmExit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setConfirmExit(false)}>
          <div className="pb-safe w-full max-w-md rounded-t-3xl bg-surface p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-2 text-xl font-black">
              <Flag className="h-6 w-6 text-red" /> Quit this lesson?
            </div>
            <p className="mb-6 text-muted">You’ll lose your progress in this lesson.</p>
            <div className="flex flex-col gap-3">
              <Button variant="blue" onClick={() => setConfirmExit(false)}>
                Keep learning
              </Button>
              <Button variant="ghost" className="text-red" onClick={onExit}>
                End session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
