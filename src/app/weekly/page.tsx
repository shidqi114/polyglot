"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, cn, ProgressBar } from "@/components/ui";
import { loadIndex } from "@/content/loader";
import { activeTriggers, tipFor } from "@/lib/coaching";
import { dayKey } from "@/lib/dates";
import {
  accuracyByGroup,
  coachingState,
  confusions,
  leeches,
  lastSevenDays,
  nextSteps,
  weakestKanaRows,
} from "@/lib/weekly";
import type { StudyItem } from "@/lib/types";
import { useProgress } from "@/store/progress";

const LINK_BUTTON =
  "btn-3d inline-flex min-h-11 items-center rounded-2xl bg-blue px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white";

function Tile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3 text-center">
      <div className="text-2xl font-black">{value.toLocaleString("en-US")}</div>
      <div className="text-xs font-bold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

export default function WeeklyPage() {
  const lessons = useProgress((s) => s.lessons);
  const cards = useProgress((s) => s.cards);
  const days = useProgress((s) => s.days);
  const [index, setIndex] = useState<Map<string, StudyItem> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadIndex()
      .then((i) => !cancelled && setIndex(i))
      .catch(() => !cancelled && setIndex(new Map()));
    return () => {
      cancelled = true;
    };
  }, []);

  const today = dayKey();
  const state = useMemo(() => coachingState({ lessons, cards, days }, today), [lessons, cards, days, today]);
  const week = lastSevenDays(days, today);
  const weekMax = Math.max(1, ...week.map((d) => d.xp));
  const weak = weakestKanaRows(cards);
  const steps = nextSteps({ ...state, weakRow: weak[0] });
  const tip = tipFor(activeTriggers(state), today);
  const weekXp = week.reduce((n, d) => n + d.xp, 0);
  const weekLessons = week.reduce((n, d) => n + d.lessons, 0);
  const weekReviews = week.reduce((n, d) => n + d.reviews, 0);
  const weekActive = week.filter((d) => d.xp > 0 || d.lessons > 0 || d.reviews > 0).length;

  const groupOf = (id: string) => {
    const item = index?.get(id);
    if (!item) return undefined;
    if (item.kind === "kana") return "Kana";
    return `${item.level?.toUpperCase()} ${item.kind === "kanji" ? "kanji" : "words"}`;
  };
  const groups = index ? accuracyByGroup(cards, groupOf) : [];
  const slipping = leeches(cards).slice(0, 8);
  const mixedUp = confusions(cards).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/profile" className="flex items-center gap-1 self-start text-sm font-extrabold uppercase text-blue">
        <ArrowLeft className="h-4 w-4" /> Profile
      </Link>
      <div>
        <h1 className="text-2xl font-black">Weekly review</h1>
        <p className="text-muted">The last seven days, what is slipping, and what to do next.</p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="font-extrabold">This week</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Tile value={weekXp} label="XP" />
          <Tile value={weekLessons} label="Lessons" />
          <Tile value={weekReviews} label="Reviews" />
          <Tile value={weekActive} label="Active days" />
        </div>
        <div className="flex h-28 items-end gap-2" aria-label="XP per day, last seven days">
          {week.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn("w-full rounded-t-lg", d.xp > 0 ? "bg-primary" : "bg-locked")}
                style={{ height: `${Math.max(4, (d.xp / weekMax) * 100)}%` }}
                title={`${d.key}: ${d.xp} XP`}
              />
              <span className="text-[10px] font-bold text-muted">{new Date(`${d.key}T12:00`).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="font-extrabold">Next steps</div>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="font-extrabold">Accuracy by level</div>
        {!index && <p className="text-sm text-muted">Loading…</p>}
        {index && groups.length === 0 && <p className="text-sm text-muted">Not enough reviews yet. Five per level are needed.</p>}
        {groups.map((g) => (
          <div key={g.group}>
            <div className="flex justify-between text-sm">
              <span className="font-bold">{g.group}</span>
              <span className="text-muted">
                {Math.round(g.accuracy * 100)}% · {g.reviews} reviews
              </span>
            </div>
            <ProgressBar value={g.accuracy} className="mt-1 h-2" />
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-extrabold">Leeches</div>
          {slipping.length > 0 && (
            <Link href="/practice/run?set=leeches&mode=pick" className={LINK_BUTTON}>
              Fix leeches
            </Link>
          )}
        </div>
        {slipping.length === 0 && <p className="text-sm text-muted">Nothing keeps slipping. Well done.</p>}
        {slipping.map(({ id, lapses }) => {
          const item = index?.get(id);
          return (
            <div key={id} className="flex items-baseline gap-3">
              <span className="jp min-w-12 text-xl font-bold">{item?.front ?? id}</span>
              <span className="min-w-0 flex-1 truncate text-sm">{item?.meanings.slice(0, 2).join(", ")}</span>
              <span className="shrink-0 text-xs font-bold text-muted">{lapses} lapses</span>
            </div>
          );
        })}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-extrabold">Mixed up</div>
          {mixedUp.length > 0 && (
            <Link href="/practice/run?set=confusions&mode=pick" className={LINK_BUTTON}>
              Practise
            </Link>
          )}
        </div>
        {mixedUp.length === 0 && <p className="text-sm text-muted">No wrong answers recorded yet.</p>}
        {mixedUp.map(({ id, wrong }) => {
          const item = index?.get(id);
          return (
            <div key={id} className="flex flex-wrap items-baseline gap-2">
              <span className="jp text-xl font-bold">{item?.front ?? id}</span>
              <span className="text-sm text-muted">picked instead:</span>
              <span className="jp text-sm">{wrong.join(", ")}</span>
            </div>
          );
        })}
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="font-extrabold">Weakest kana rows</div>
        {weak.length === 0 && <p className="text-sm text-muted">Review some kana to see which rows need work.</p>}
        {weak.slice(0, 3).map((r) => (
          <div key={r.title}>
            <div className="flex justify-between text-sm">
              <span className="font-bold">{r.title}</span>
              <span className="text-muted">{Math.round(r.accuracy * 100)}%</span>
            </div>
            <ProgressBar value={r.accuracy} className="mt-1 h-2" />
          </div>
        ))}
      </Card>

      {tip && (
        <Card className="flex flex-col gap-2 border-blue bg-blue-soft">
          <div className="text-xs font-extrabold uppercase tracking-wider text-blue-dark">Tip</div>
          <p>{tip.text}</p>
        </Card>
      )}
    </div>
  );
}
