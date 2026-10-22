"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { AudioButton, GrammarNote } from "@/components/lesson/exercises";
import { Card } from "@/components/ui";
import { GRAMMAR } from "@/content/grammar";
import { GRAMMAR_N4 } from "@/content/grammar-n4";
import type { GrammarLesson } from "@/lib/types";

const LEVELS = [
  { level: "N5", points: GRAMMAR },
  { level: "N4", points: GRAMMAR_N4 },
];

function GrammarDetail({ point, onBack }: { point: GrammarLesson; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-1 self-start text-sm font-extrabold uppercase text-blue">
        <ArrowLeft className="h-4 w-4" /> Grammar
      </button>
      <Card>
        <GrammarNote lesson={point} />
      </Card>
      <Card>
        <div className="mb-3 font-extrabold">Sample sentences</div>
        <div className="flex flex-col gap-4">
          {point.sentences.map((s) => (
            <div key={s.kana} className="flex items-start gap-3">
              <AudioButton text={s.kana} size="sm" />
              <div className="min-w-0">
                <div className="jp text-lg font-bold">{s.tiles.join("")}</div>
                <div className="jp text-sm text-muted">{s.kana}</div>
                <div className="text-sm">{s.en}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/** Browsable N5 and N4 grammar reference, the same explanations the grammar lessons use. */
export function GrammarReference() {
  const [selected, setSelected] = useState<GrammarLesson | null>(null);
  if (selected) return <GrammarDetail point={selected} onBack={() => setSelected(null)} />;
  return (
    <div className="flex flex-col gap-6">
      {LEVELS.map(({ level, points }) => (
        <section key={level}>
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">
            JLPT {level} · {points.length} points
          </h2>
          <div className="flex flex-col divide-y-2 divide-border overflow-hidden rounded-2xl border-2 border-border">
            {points.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="flex flex-col gap-0.5 bg-surface px-4 py-3 text-left hover:bg-surface-2"
              >
                <span className="jp font-bold">{p.title}</span>
                <span className="jp truncate text-sm text-muted">{p.notes[0]}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
