"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { AudioButton } from "@/components/lesson/exercises";
import { Button, Card, cn } from "@/components/ui";
import type { Story, StoryLine, StoryOption, StoryQuestion, StoryReply } from "@/content/stories";

function Bubble({ line, english, onToggle }: { line: StoryLine; english: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start gap-3">
      <AudioButton text={line.kana} size="sm" />
      <button onClick={onToggle} className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-surface-2 px-4 py-3 text-left">
        <span className="block text-xs font-extrabold uppercase tracking-wider text-muted">{line.speaker}</span>
        <span className="jp block text-xl font-bold">{line.jp}</span>
        <span className="block pt-1 text-sm text-muted">{english ? line.en : "Tap for English"}</span>
      </button>
    </div>
  );
}

function YourLine({ option }: { option: StoryOption }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-soft px-4 py-3 text-right">
      <span className="jp block text-xl font-bold">{option.jp}</span>
      <span className="block pt-1 text-sm text-muted">{option.en}</span>
    </div>
  );
}

/** The learner picks what to say. A wrong pick shows its feedback and can be tried again. */
function ReplyStep({
  step,
  onSolved,
}: {
  step: StoryReply;
  onSolved: (option: StoryOption, firstTry: boolean) => void;
}) {
  const [wrong, setWrong] = useState<StoryOption[]>([]);
  const [right, setRight] = useState<StoryOption | null>(null);
  const [last, setLast] = useState<StoryOption | null>(null);

  const pick = (option: StoryOption) => {
    setLast(option);
    if (option.correct) setRight(option);
    else setWrong((w) => [...w, option]);
  };

  return (
    <Card className="flex flex-col gap-3">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted">What would you say?</div>
      <div className="font-bold">{step.prompt}</div>
      <div className="flex flex-col gap-2">
        {step.options.map((o) => {
          const isWrong = wrong.includes(o);
          const locked = right !== null || isWrong;
          return (
            <button
              key={o.jp}
              disabled={locked}
              onClick={() => pick(o)}
              className={cn(
                "flex flex-col rounded-xl border-2 px-4 py-3 text-left",
                o === right && "border-primary bg-primary-soft",
                isWrong && "border-red bg-red-soft opacity-70",
                !locked && "border-border bg-surface hover:bg-surface-2",
                locked && o !== right && !isWrong && "border-border bg-surface opacity-50",
              )}
            >
              <span className="jp text-lg font-bold">{o.jp}</span>
              <span className="text-sm text-muted">{o.en}</span>
            </button>
          );
        })}
      </div>
      {last && (
        <div
          role="status"
          className={cn(
            "flex items-start gap-2 rounded-xl p-3 text-sm",
            last.correct ? "bg-primary-soft text-primary-dark" : "bg-red-soft text-red-dark",
          )}
        >
          {last.correct ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>
            {last.correct ? "Good. " : "Not quite. "}
            {last.feedback}
          </span>
        </div>
      )}
      {right && <Button onClick={() => onSolved(right, wrong.length === 0)}>Continue</Button>}
    </Card>
  );
}

/** A comprehension question. The answer is shown straight away, and the next question follows. */
function QuestionStep({ question, onNext }: { question: StoryQuestion; onNext: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const answered = choice !== null;
  const correct = choice === question.answer;

  return (
    <Card className="flex flex-col gap-3">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted">Question</div>
      <div className="font-bold">{question.question}</div>
      <div className="flex flex-col gap-2">
        {question.options.map((o, i) => (
          <button
            key={o}
            disabled={answered}
            onClick={() => setChoice(i)}
            className={cn(
              "rounded-xl border-2 px-4 py-3 text-left font-bold",
              answered && i === question.answer && "border-primary bg-primary-soft",
              answered && i === choice && i !== question.answer && "border-red bg-red-soft",
              !answered && "border-border bg-surface hover:bg-surface-2",
              answered && i !== question.answer && i !== choice && "border-border bg-surface opacity-50",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      {answered && (
        <>
          <div
            role="status"
            className={cn("rounded-xl p-3 text-sm", correct ? "bg-primary-soft text-primary-dark" : "bg-red-soft text-red-dark")}
          >
            {correct ? "Correct!" : `Not quite. The answer is “${question.options[question.answer]}”.`}
          </div>
          <Button onClick={() => onNext(correct)}>Next</Button>
        </>
      )}
    </Card>
  );
}

/** Plays one story: the conversation, then its questions, then a summary. */
export function StoryPlayer({ story, onReplay }: { story: Story; onReplay: () => void }) {
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [picks, setPicks] = useState<Record<number, StoryOption>>({});
  const [firstTries, setFirstTries] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const replies = story.steps.filter((s) => s.type === "reply").length;
  const conversing = step < story.steps.length;
  const finished = !conversing && question >= story.questions.length;
  const current = story.steps[step];

  const toggle = (i: number) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="jp text-2xl font-black">{story.title}</h1>
        <p className="text-sm text-muted">{story.setting}</p>
      </div>

      {story.steps.slice(0, step).map((s, i) =>
        s.type === "line" ? (
          <Bubble key={i} line={s} english={revealed.has(i)} onToggle={() => toggle(i)} />
        ) : (
          <YourLine key={i} option={picks[i]} />
        ),
      )}

      {conversing && current.type === "line" && (
        <>
          <Bubble line={current} english={revealed.has(step)} onToggle={() => toggle(step)} />
          <Button onClick={() => setStep(step + 1)} className="self-end">
            Next
          </Button>
        </>
      )}

      {conversing && current.type === "reply" && (
        <ReplyStep
          key={step}
          step={current}
          onSolved={(option, first) => {
            setPicks((p) => ({ ...p, [step]: option }));
            if (first) setFirstTries((n) => n + 1);
            setStep(step + 1);
          }}
        />
      )}

      {!conversing && !finished && (
        <>
          <div className="text-sm font-extrabold uppercase tracking-wider text-muted">
            Question {question + 1} of {story.questions.length}
          </div>
          <QuestionStep
            key={question}
            question={story.questions[question]}
            onNext={(ok) => {
              if (ok) setCorrectAnswers((n) => n + 1);
              setQuestion((q) => q + 1);
            }}
          />
        </>
      )}

      {finished && (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="jp text-4xl font-black text-primary">お疲れ様！</div>
          <div className="font-extrabold">{story.title} complete</div>
          <div className="text-sm text-muted">
            Replies right first time: {firstTries} of {replies}
          </div>
          <div className="text-sm text-muted">
            Questions right: {correctAnswers} of {story.questions.length}
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button variant="secondary" onClick={onReplay}>
              Play again
            </Button>
            <Link
              href="/story"
              className="inline-flex min-h-12 items-center rounded-2xl bg-blue px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-white"
            >
              More stories
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
