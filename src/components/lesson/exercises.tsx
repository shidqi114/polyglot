"use client";

import { Turtle, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { bind, unbind } from "wanakana";
import { cn } from "../ui";
import { shuffle } from "@/lib/lesson-engine";
import { sounds } from "@/lib/sound";
import { speak } from "@/lib/tts";
import type { Exercise, GrammarLesson, StudyItem } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { Furigana } from "@/components/furigana";

type Ex<T extends Exercise["type"]> = Extract<Exercise, { type: T }>;

export function AudioButton({ text, size = "md", slow }: { text: string; size?: "sm" | "md" | "lg"; slow?: boolean }) {
  const rate = useProgress((s) => s.settings.ttsRate);
  const dims = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-24 w-24 rounded-3xl" }[size];
  const icon = { sm: "h-5 w-5", md: "h-6 w-6", lg: "h-12 w-12" }[size];
  return (
    <button
      type="button"
      aria-label={slow ? "Play slowly" : "Play audio"}
      onClick={(e) => {
        e.stopPropagation();
        speak(text, slow ? rate * 0.6 : rate);
      }}
      className={cn("btn-3d inline-flex shrink-0 items-center justify-center rounded-2xl bg-blue text-white", dims)}
      style={{ ["--shadow" as string]: "var(--blue-dark)" }}
    >
      {slow ? <Turtle className={icon} strokeWidth={2.5} /> : <Volume2 className={icon} strokeWidth={2.5} />}
    </button>
  );
}

function useAutoplay(text: string | undefined, key: string) {
  const autoplay = useProgress((s) => s.settings.autoplayAudio);
  const rate = useProgress((s) => s.settings.ttsRate);
  useEffect(() => {
    if (autoplay && text) speak(text, rate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function Question({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-xl font-extrabold sm:text-2xl">{children}</h2>;
}

/* ---------- intro & note (not graded) ---------- */

export function IntroCard({ ex }: { ex: Ex<"intro"> }) {
  const item = ex.item;
  useAutoplay(item.reading, ex.key);
  const label = item.kind === "kana" ? "New character" : item.kind === "kanji" ? "New kanji" : "New word";
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-6 rounded-full bg-purple/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-purple">{label}</span>
      <div className="jp mb-2 text-7xl font-bold sm:text-8xl">{item.front}</div>
      {item.kind === "vocab" && item.reading !== item.front && <div className="jp mb-2 text-2xl text-muted">{item.reading}</div>}
      <div className="mb-6 text-2xl font-extrabold">{item.kind === "kana" ? item.meanings[0] : item.meanings.slice(0, 3).join(", ")}</div>
      {item.kind === "kanji" && <KanjiReadings item={item} />}
      <div className="flex gap-3">
        <AudioButton text={item.reading} />
        <AudioButton text={item.reading} slow />
      </div>
    </div>
  );
}

export function KanjiReadings({ item }: { item: StudyItem }) {
  return (
    <div className="mb-6 grid w-full max-w-sm grid-cols-2 gap-3 text-left">
      <div className="rounded-xl bg-surface-2 p-3">
        <div className="text-xs font-extrabold uppercase text-muted">On’yomi</div>
        <div className="jp text-lg">{item.on?.length ? item.on.join("・") : "—"}</div>
      </div>
      <div className="rounded-xl bg-surface-2 p-3">
        <div className="text-xs font-extrabold uppercase text-muted">Kun’yomi</div>
        <div className="jp text-lg">{item.kun?.length ? item.kun.join("・") : "—"}</div>
      </div>
    </div>
  );
}

export function GrammarNote({ lesson }: { lesson: GrammarLesson }) {
  return (
    <div>
      <span className="mb-4 inline-block rounded-full bg-purple/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-purple">
        Grammar
      </span>
      <h2 className="jp mb-4 text-3xl font-black">{lesson.title}</h2>
      <div className="mb-6 space-y-2 text-lg">
        {lesson.notes.map((n, i) => (
          <p key={i} className={cn("jp", n.startsWith("• ") && "pl-4 text-muted")}>
            {n}
          </p>
        ))}
      </div>
      <div className="space-y-3">
        {lesson.examples.map((e) => (
          <div key={e.jp} className="flex items-center gap-3 rounded-2xl border-2 border-border p-3">
            <AudioButton text={e.jp} size="sm" />
            <div>
              <div className="jp text-lg font-bold">{e.jp}</div>
              <div className="text-sm text-muted">{e.en}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- graded exercises (controlled by the player) ---------- */

export function ChoiceExercise({
  ex,
  value,
  onChange,
  locked,
}: {
  ex: Ex<"choice">;
  value: number | null;
  onChange: (v: number) => void;
  locked: boolean;
}) {
  const showReadings = useProgress((s) => s.settings.showReadings);
  useAutoplay(ex.audioOnly ? ex.audio : undefined, ex.key);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked || e.target instanceof HTMLInputElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length) onChange(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ex, locked, onChange]);

  const optionsAreKanaChars = ex.optionsJapanese && ex.options.every((o) => o.label.length <= 2);
  return (
    <div>
      <Question>{ex.question}</Question>
      {ex.audioOnly ? (
        <div className="mb-8 flex justify-center gap-4">
          <AudioButton text={ex.audio!} size="lg" />
          <AudioButton text={ex.audio!} slow />
        </div>
      ) : ex.prompt ? (
        <div className="mb-8 flex items-center gap-4">
          {ex.audio && <AudioButton text={ex.audio} />}
          <div className="min-w-0">
            <div data-testid="prompt" className={cn("jp font-bold", ex.prompt.length > 8 ? "text-2xl sm:text-3xl" : "text-5xl")}>
              {ex.promptRuby ? <Furigana segments={ex.promptRuby} showReadings={showReadings} /> : ex.prompt}
            </div>
            {ex.promptSub && <div className="jp mt-1 text-muted">{ex.promptSub}</div>}
          </div>
        </div>
      ) : null}
      <div className={cn("grid gap-3", optionsAreKanaChars ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {ex.options.map((o, i) => {
          const selected = value === i;
          return (
            <button
              key={`${o.label}-${i}`}
              data-testid="option"
              data-label={o.label}
              disabled={locked}
              onClick={() => {
                onChange(i);
                if (ex.optionsJapanese && !optionsAreKanaChars) speak(o.sub ?? o.label);
              }}
              className={cn(
                "btn-3d flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left",
                selected ? "border-blue bg-blue-soft text-blue [--shadow:var(--blue)]" : "border-border bg-surface hover:bg-surface-2",
                optionsAreKanaChars && "justify-center",
              )}
            >
              {!optionsAreKanaChars && (
                <span
                  className={cn(
                    "hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-bold sm:flex",
                    selected ? "border-blue" : "border-border text-muted",
                  )}
                >
                  {i + 1}
                </span>
              )}
              <span className="min-w-0">
                <span className={cn(ex.optionsJapanese ? "jp text-xl" : "text-base", "font-bold", optionsAreKanaChars && "text-4xl")}>
                  {o.label}
                </span>
                {o.sub && showReadings && <span className="jp block text-sm text-muted">{o.sub}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function InputExercise({
  ex,
  value,
  onChange,
  onSubmit,
  locked,
}: {
  ex: Ex<"input">;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  locked: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || ex.mode !== "kana") return;
    // Converts romaji to kana as you type; a Japanese keyboard works too.
    bind(el, { IMEMode: "toHiragana" });
    const sync = () => onChange(el.value);
    el.addEventListener("input", sync);
    return () => {
      el.removeEventListener("input", sync);
      unbind(el);
    };
  }, [ex.key, ex.mode, onChange]);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [ex.key]);

  return (
    <div>
      <Question>{ex.question}</Question>
      <div className="mb-8 flex items-center gap-4">
        {ex.audio && <AudioButton text={ex.audio} />}
        <div className="min-w-0">
          <div data-testid="prompt" className={cn("font-bold", ex.mode === "kana" && ex.prompt.length > 10 ? "text-2xl" : "jp text-5xl")}>{ex.prompt}</div>
          {ex.promptSub && <div className="mt-1 text-muted">{ex.promptSub}</div>}
        </div>
      </div>
      <input
        ref={ref}
        key={ex.key}
        data-testid="answer-input"
        defaultValue={ex.mode === "kana" ? undefined : value}
        onChange={ex.mode === "kana" ? undefined : (e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        }}
        readOnly={locked}
        lang={ex.mode === "kana" ? "ja" : "en"}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder={ex.mode === "kana" ? "Type in romaji or kana…" : "Type your answer…"}
        className="jp w-full rounded-2xl border-2 border-border bg-surface-2 px-4 py-4 text-2xl outline-none focus:border-blue"
      />
      {ex.mode === "kana" && <p className="mt-2 text-sm text-muted">Romaji turns into kana automatically (e.g. “ka” → か, “nn” → ん).</p>}
    </div>
  );
}

export function BuildExercise({
  ex,
  value,
  onChange,
  locked,
}: {
  ex: Ex<"build">;
  value: number[];
  onChange: (v: number[]) => void;
  locked: boolean;
}) {
  const showReadings = useProgress((s) => s.settings.showReadings);
  return (
    <div>
      <Question>Write this in Japanese</Question>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl border-2 border-border px-4 py-3 text-lg font-bold">{ex.en}</div>
      </div>
      <div className="mb-6 flex min-h-[72px] flex-wrap content-start gap-2 border-b-2 border-t-2 border-border py-3">
        {value.map((ti, pos) => (
          <button
            key={`${ti}-${pos}`}
            disabled={locked}
            onClick={() => onChange(value.filter((_, p) => p !== pos))}
            className="btn-3d jp animate-pop rounded-xl border-2 border-border bg-surface px-3 py-2 text-xl"
          >
            {ex.tiles[ti]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {ex.tiles.map((t, ti) => {
          const used = value.includes(ti);
          return (
            <button
              key={ti}
              disabled={used || locked}
              onClick={() => {
                onChange([...value, ti]);
                speak(t);
              }}
              className={cn(
                "jp rounded-xl border-2 px-3 py-2 text-xl",
                used ? "border-locked bg-locked text-transparent" : "btn-3d border-border bg-surface hover:bg-surface-2",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
      {showReadings && <p className="jp mt-6 text-center text-sm text-muted">Hint: {ex.kana}</p>}
    </div>
  );
}

/** Match pairs handles its own grading; calls onDone once everything is matched. */
export function MatchExercise({ ex, onDone, onMistake }: { ex: Ex<"match">; onDone: () => void; onMistake: () => void }) {
  const soundOn = useProgress((s) => s.settings.sound);
  const [left] = useState(() => shuffle(ex.pairs.map((p) => p.id)));
  const [right] = useState(() => shuffle(ex.pairs.map((p) => p.id)));
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<[string, string] | null>(null);
  const byId = new Map(ex.pairs.map((p) => [p.id, p]));

  useEffect(() => {
    if (!selL || !selR) return;
    if (selL === selR) {
      const next = new Set(matched).add(selL);
      setMatched(next);
      if (soundOn) sounds.correct();
      if (next.size === ex.pairs.length) setTimeout(onDone, 250);
    } else {
      setWrong([selL, selR]);
      onMistake();
      if (soundOn) sounds.wrong();
      setTimeout(() => setWrong(null), 500);
    }
    setSelL(null);
    setSelR(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selL, selR]);

  const tile = (id: string, side: "l" | "r") => {
    const p = byId.get(id)!;
    const isMatched = matched.has(id);
    const isSel = side === "l" ? selL === id : selR === id;
    const isWrong = wrong && (side === "l" ? wrong[0] === id : wrong[1] === id);
    return (
      <button
        key={`${side}-${id}`}
        data-testid={`match-${side}`}
        disabled={isMatched}
        onClick={() => {
          if (side === "l") {
            setSelL(id);
            speak(p.left);
          } else setSelR(id);
        }}
        className={cn(
          "btn-3d min-h-16 rounded-2xl border-2 px-3 py-2 font-bold",
          side === "l" ? "jp text-2xl" : "text-base",
          isMatched && "border-border bg-surface text-locked-dark opacity-50 [--shadow:transparent]",
          !isMatched && isSel && "border-blue bg-blue-soft text-blue [--shadow:var(--blue)]",
          !isMatched && isWrong && "animate-shake border-red bg-red-soft text-red [--shadow:var(--red)]",
          !isMatched && !isSel && !isWrong && "border-border bg-surface hover:bg-surface-2",
        )}
      >
        {side === "l" ? p.left : p.right}
      </button>
    );
  };

  return (
    <div>
      <Question>Tap the matching pairs</Question>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">{left.map((id) => tile(id, "l"))}</div>
        <div className="flex flex-col gap-3">{right.map((id) => tile(id, "r"))}</div>
      </div>
    </div>
  );
}
