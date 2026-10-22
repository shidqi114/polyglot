"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, cn, Toggle } from "@/components/ui";
import { MODE_INFO, PRACTICE_SETS } from "@/content/practice-sets";

export default function PracticePage() {
  const [selected, setSelected] = useState(PRACTICE_SETS[0].id);
  const [learnedOnly, setLearnedOnly] = useState(false);
  const set = PRACTICE_SETS.find((s) => s.id === selected)!;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black">Practice dojo</h1>
        <p className="text-muted">Free drills — no unlocking needed. Earn 1 XP for every 2 correct answers.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PRACTICE_SETS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={cn(
              "btn-3d flex flex-col items-start rounded-2xl border-2 p-3 text-left",
              selected === s.id ? "border-blue bg-blue-soft [--shadow:var(--blue)]" : "border-border bg-surface hover:bg-surface-2",
            )}
          >
            <span className="jp mb-1 text-3xl font-black">{s.glyph}</span>
            <span className="font-extrabold">{s.title}</span>
            <span className="text-xs text-muted">{s.subtitle}</span>
          </button>
        ))}
      </div>

      <Card className="flex items-center justify-between gap-3">
        <div>
          <div className="font-extrabold">Only items I’ve learned</div>
          <div className="text-sm text-muted">Use words and characters from finished lessons</div>
        </div>
        <Toggle checked={learnedOnly} onChange={setLearnedOnly} label="Only learned items" />
      </Card>

      <div className="flex flex-col gap-3">
        {set.modes.map((m) => (
          <Link
            key={m}
            href={`/practice/run?set=${set.id}&mode=${m}${learnedOnly ? "&learned=1" : ""}`}
            className="btn-3d flex items-center justify-between rounded-2xl border-2 border-border bg-surface p-4 hover:bg-surface-2"
          >
            <div>
              <div className="font-extrabold">{MODE_INFO[m].title}</div>
              <div className="text-sm text-muted">{MODE_INFO[m].description}</div>
            </div>
            <span className="text-sm font-extrabold uppercase text-blue">Start</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
