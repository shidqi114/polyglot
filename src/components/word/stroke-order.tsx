"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

/** Animated stroke order from KanjiVG paths (109 × 109 grid). Each stroke is drawn in turn. */
export function StrokeOrder({ paths, label }: { paths: string[]; label: string }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg key={run} viewBox="0 0 109 109" className="h-40 w-40 rounded-xl bg-surface-2" role="img" aria-label={`Stroke order of ${label}`}>
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-anim"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        ))}
      </svg>
      <button type="button" onClick={() => setRun((r) => r + 1)} className="flex items-center gap-1 text-sm font-bold text-blue">
        <RotateCcw className="h-4 w-4" /> Replay
      </button>
    </div>
  );
}
