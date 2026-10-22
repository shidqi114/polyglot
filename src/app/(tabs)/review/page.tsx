"use client";

import { Repeat } from "lucide-react";
import { useState } from "react";
import { CompleteScreen } from "@/components/lesson/complete";
import { LessonPlayer, type PlayerResult } from "@/components/lesson/player";
import { Button, Card } from "@/components/ui";
import { loadIndex } from "@/content/loader";
import { buildReviewExercise } from "@/lib/lesson-engine";
import { buildPools, poolFor } from "@/lib/pools";
import { strengthBars } from "@/lib/srs";
import type { Exercise } from "@/lib/types";
import { useProgress } from "@/store/progress";

const SESSION_SIZE = 20;

function formatIn(ms: number): string {
  const h = ms / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} days`;
}

export default function ReviewPage() {
  const cards = useProgress((s) => s.cards);
  const recordReview = useProgress((s) => s.recordReview);
  const [session, setSession] = useState<Exercise[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlayerResult | null>(null);

  const now = Date.now();
  const entries = Object.entries(cards);
  const due = entries.filter(([, c]) => c.due <= now).sort((a, b) => a[1].due - b[1].due);
  const nextDue = entries.filter(([, c]) => c.due > now).reduce((m, [, c]) => Math.min(m, c.due), Infinity);
  const bars = [0, 0, 0, 0];
  for (const [, c] of entries) bars[strengthBars(c, now)]++;

  async function start() {
    setLoading(true);
    try {
      const index = await loadIndex();
      const pools = buildPools(index);
      const items = due
        .slice(0, SESSION_SIZE)
        .map(([id]) => index.get(id))
        .filter((x) => !!x);
      setSession(items.map((it) => buildReviewExercise(it, poolFor(it, pools))));
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-40 bg-bg">
        <CompleteScreen
          title="Review complete!"
          subtitle={`${result.graded} items reviewed`}
          xp={result.correctFirstTry}
          accuracy={result.graded ? result.correctFirstTry / result.graded : 1}
          durationMs={result.durationMs}
          primaryLabel="Done"
          onPrimary={() => setResult(null)}
        />
      </div>
    );
  }

  if (session) {
    return (
      <div className="fixed inset-0 z-40 bg-bg">
        <LessonPlayer
          exercises={session}
          repeatMistakes
          onExit={() => setSession(null)}
          onGraded={(ex, correct) => {
            if ("itemId" in ex && ex.itemId) recordReview(ex.itemId, correct);
          }}
          onFinish={(r) => {
            setSession(null);
            setResult(r);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">Review</h1>
      <Card className="flex flex-col items-center gap-3 py-8 text-center">
        <Repeat className="h-12 w-12 text-purple" strokeWidth={2.5} />
        {due.length > 0 ? (
          <>
            <div className="text-4xl font-black">{due.length}</div>
            <p className="text-muted">items are ready for review</p>
            <Button variant="blue" className="mt-2 w-full max-w-xs" disabled={loading} onClick={() => void start()}>
              {loading ? "Loading…" : `Start review (${Math.min(SESSION_SIZE, due.length)})`}
            </Button>
          </>
        ) : entries.length ? (
          <>
            <div className="text-xl font-black">All caught up!</div>
            <p className="text-muted">Next review in {formatIn(nextDue - now)}.</p>
          </>
        ) : (
          <>
            <div className="text-xl font-black">Nothing to review yet</div>
            <p className="text-muted">Words and characters from your lessons will show up here on a spaced-repetition schedule.</p>
          </>
        )}
      </Card>
      {entries.length > 0 && (
        <Card>
          <div className="mb-3 font-extrabold">Memory strength</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { n: bars[1], label: "Weak", color: "var(--red)" },
              { n: bars[2], label: "Good", color: "var(--orange)" },
              { n: bars[3], label: "Strong", color: "var(--primary)" },
            ].map((b) => (
              <div key={b.label} className="rounded-xl bg-surface-2 p-3">
                <div className="text-2xl font-black" style={{ color: b.color }}>
                  {b.n}
                </div>
                <div className="text-xs font-bold uppercase text-muted">{b.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Scheduling uses the FSRS algorithm: items you know well come back less often.</p>
        </Card>
      )}
    </div>
  );
}
