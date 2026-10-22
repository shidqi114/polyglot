"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Check, ChevronDown, Crown, Lock, Puzzle, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, cn, ProgressBar } from "./ui";
import { COURSE } from "@/content/course";
import { currentLessonId, lessonStatus, type LessonStatus } from "@/lib/course-progress";
import type { LessonRef, Section, Unit } from "@/lib/types";
import { useProgress } from "@/store/progress";

const UNIT_COLORS = [
  { bg: "var(--primary)", dark: "var(--primary-dark)" },
  { bg: "var(--purple)", dark: "#a568cc" },
  { bg: "var(--blue)", dark: "var(--blue-dark)" },
  { bg: "var(--orange)", dark: "#cc7800" },
  { bg: "#ff86d0", dark: "#d66cad" },
];
const OFFSETS = [0, 44, 72, 44, 0, -44, -72, -44];

function LessonIcon({ lesson, status }: { lesson: LessonRef; status: LessonStatus }) {
  if (status === "done") return <Check className="h-8 w-8" strokeWidth={4} />;
  if (status === "locked") return <Lock className="h-7 w-7" strokeWidth={3} />;
  switch (lesson.kind) {
    case "kana":
      return <span className="jp text-2xl font-black">{lesson.itemIds?.[0].slice(2) ?? "あ"}</span>;
    case "kanji":
      return <span className="jp text-2xl font-black">漢</span>;
    case "grammar":
      return <Puzzle className="h-7 w-7" strokeWidth={3} />;
    default:
      return status === "current" ? <Star className="h-8 w-8" fill="currentColor" /> : <BookOpen className="h-7 w-7" strokeWidth={3} />;
  }
}

function LessonNode({
  lesson,
  index,
  status,
  color,
  selected,
  onSelect,
  nodeRef,
}: {
  lesson: LessonRef;
  index: number;
  status: LessonStatus;
  color: (typeof UNIT_COLORS)[number];
  selected: boolean;
  onSelect: () => void;
  nodeRef?: React.Ref<HTMLDivElement>;
}) {
  const router = useRouter();
  const times = useProgress((s) => s.lessons[lesson.id]?.times ?? 0);
  const active = status !== "locked";
  const bg = status === "done" ? "var(--gold)" : active ? color.bg : "var(--locked)";
  const shadow = status === "done" ? "var(--gold-dark)" : active ? color.dark : "var(--locked-dark)";
  return (
    <div ref={nodeRef} className={cn("relative flex justify-center", selected && "z-20")} style={{ transform: `translateX(${OFFSETS[index % OFFSETS.length]}px)` }}>
      {status === "current" && !selected && (
        <div className="animate-bob absolute -top-11 left-1/2 z-10 whitespace-nowrap rounded-xl border-2 border-border bg-surface px-3 py-1.5 text-sm font-extrabold uppercase text-primary">
          Start
          <div className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-border bg-surface" />
        </div>
      )}
      <button
        aria-label={`${lesson.title} (${status})`}
        onClick={onSelect}
        className={cn(
          "btn-3d relative flex h-[68px] w-[76px] items-center justify-center rounded-[50%] text-white",
          status === "locked" && "text-muted",
          status === "current" && "ring-8 ring-locked/70",
        )}
        style={{ background: bg, ["--shadow" as string]: shadow, boxShadow: `0 7px 0 ${shadow}` }}
      >
        <LessonIcon lesson={lesson} status={status} />
        {times > 1 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-1 text-xs font-black text-gold-dark ring-2 ring-gold">
            <Crown className="mr-0.5 h-3 w-3" fill="currentColor" />
            {times}
          </span>
        )}
      </button>
      {selected && (
        <div className="animate-pop absolute top-[84px] z-20 w-64 rounded-2xl p-4 text-white shadow-lg" style={{ background: active ? color.bg : "var(--surface-2)" }}>
          <div className={cn("font-extrabold", !active && "text-text")}>{lesson.title}</div>
          <div className={cn("mb-3 text-sm", active ? "text-white/85" : "text-muted")}>
            {status === "done"
              ? "Completed — practice again for extra XP."
              : status === "locked"
                ? "Not unlocked yet. You can jump ahead if you already know this."
                : lessonDescription(lesson)}
          </div>
          <Button
            variant="secondary"
            className="w-full"
            style={{ color: active ? color.bg : undefined }}
            onClick={() => router.push(`/lesson?id=${lesson.id}`)}
          >
            {status === "done" ? "Practice +10 XP" : status === "locked" ? "Jump here" : "Start +10 XP"}
          </Button>
        </div>
      )}
    </div>
  );
}

function lessonDescription(l: LessonRef): string {
  switch (l.kind) {
    case "kana":
      return `Learn ${l.itemIds?.length ?? 0} new characters.`;
    case "vocab":
      return `Learn ${(l.range![1] - l.range![0])} new words.`;
    case "kanji":
      return `Learn ${(l.range![1] - l.range![0])} new kanji.`;
    case "grammar":
      return "A short grammar point with sentence building.";
  }
}

function UnitBlock({
  unit,
  colorIdx,
  currentId,
  selectedId,
  setSelectedId,
  currentRef,
}: {
  unit: Unit;
  colorIdx: number;
  currentId?: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  currentRef: React.Ref<HTMLDivElement>;
}) {
  const lessons = useProgress((s) => s.lessons);
  const color = UNIT_COLORS[colorIdx % UNIT_COLORS.length];
  return (
    <section className="mb-6">
      <div
        className="mb-10 rounded-2xl px-5 py-4 text-white"
        style={{ background: color.bg, boxShadow: `0 4px 0 ${color.dark}` }}
      >
        <h3 className="text-lg font-black">{unit.title}</h3>
        <p className="text-sm font-semibold text-white/90">{unit.description}</p>
      </div>
      <div className="flex flex-col items-center gap-7 pb-4">
        {unit.lessons.map((l, i) => (
          <LessonNode
            key={l.id}
            lesson={l}
            index={i}
            status={lessonStatus(l.id, lessons, currentId)}
            color={color}
            selected={selectedId === l.id}
            onSelect={() => setSelectedId(selectedId === l.id ? null : l.id)}
            nodeRef={l.id === currentId ? currentRef : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  section,
  open,
  onToggle,
}: {
  section: Section;
  open: boolean;
  onToggle: () => void;
}) {
  const lessons = useProgress((s) => s.lessons);
  const { done, total } = useMemo(() => {
    const all = section.units.flatMap((u) => u.lessons);
    return { done: all.filter((l) => lessons[l.id]).length, total: all.length };
  }, [section, lessons]);
  return (
    <button onClick={onToggle} className="mb-4 w-full rounded-2xl border-2 border-border bg-surface p-4 text-left hover:bg-surface-2">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-muted">{section.title}</div>
          <div className="font-bold">{section.subtitle}</div>
        </div>
        <ChevronDown className={cn("h-6 w-6 shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={total ? done / total : 0} className="h-3" />
        <span className="shrink-0 text-xs font-bold text-muted">
          {done}/{total}
        </span>
      </div>
    </button>
  );
}

export function LearningPath() {
  const lessons = useProgress((s) => s.lessons);
  const currentId = currentLessonId(lessons);
  const currentSection = COURSE.find((s) => s.units.some((u) => u.lessons.some((l) => l.id === currentId)))?.id;
  const [open, setOpen] = useState<Set<string>>(() => new Set(currentSection ? [currentSection] : []));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center" });
  }, []);

  let colorIdx = 0;
  return (
    <div className="pb-10">
      {currentId == null && (
        <div className="mb-6 rounded-2xl bg-gold p-5 text-center font-extrabold text-white">
          お疲れ様！ You finished the whole course. 🎉
        </div>
      )}
      {COURSE.map((section) => {
        const isOpen = open.has(section.id);
        return (
          <div key={section.id} className="mb-6">
            <SectionHeader
              section={section}
              open={isOpen}
              onToggle={() =>
                setOpen((prev) => {
                  const next = new Set(prev);
                  if (next.has(section.id)) next.delete(section.id);
                  else next.add(section.id);
                  return next;
                })
              }
            />
            {isOpen &&
              section.units.map((unit) => (
                <UnitBlock
                  key={unit.id}
                  unit={unit}
                  colorIdx={colorIdx++}
                  currentId={currentId}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  currentRef={currentRef}
                />
              ))}
          </div>
        );
      })}
      <p className="text-center text-xs text-muted">
        <Link href="/credits" className="underline">
          Content sources & licenses
        </Link>
      </p>
    </div>
  );
}
