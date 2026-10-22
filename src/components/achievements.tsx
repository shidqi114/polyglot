"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, cn, ProgressBar } from "@/components/ui";
import { evaluate } from "@/lib/achievements";
import { useProgress } from "@/store/progress";

const SEEN_KEY = "polyglot.achievements.seen";

/** Achievements already announced on this device. Null on the first visit, so existing progress is not announced. */
function readSeen(): string[] | null {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function writeSeen(ids: string[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked (private windows). The toast may then show again on the next visit.
  }
}

export function AchievementsCard() {
  const lessons = useProgress((s) => s.lessons);
  const cards = useProgress((s) => s.cards);
  const days = useProgress((s) => s.days);
  const notes = useProgress((s) => s.notes);
  const settings = useProgress((s) => s.settings);
  const list = useMemo(
    () => evaluate({ lessons, cards, days, notes, settings }),
    [lessons, cards, days, notes, settings],
  );
  const unlocked = list.filter((a) => a.unlocked);
  const unlockedKey = unlocked.map((a) => a.id).join(",");
  const [toast, setToast] = useState<string[]>([]);

  useEffect(() => {
    const ids = unlockedKey ? unlockedKey.split(",") : [];
    const seen = readSeen();
    if (!seen) {
      writeSeen(ids);
      return;
    }
    const fresh = ids.filter((id) => !seen.includes(id));
    if (fresh.length === 0) return;
    writeSeen(ids);
    setToast(fresh.map((id) => list.find((a) => a.id === id)?.title ?? id));
  }, [unlockedKey, list]);

  useEffect(() => {
    if (toast.length === 0) return;
    const timer = setTimeout(() => setToast([]), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const sorted = [...list].sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.value / b.target - a.value / a.target);

  return (
    <>
      {toast.length > 0 && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl bg-gold px-4 py-3 text-center font-extrabold text-white shadow-lg"
        >
          Achievement unlocked: {toast.join(", ")}
        </div>
      )}
      <Card>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div className="font-extrabold">Achievements</div>
          <div className="text-sm text-muted">
            {unlocked.length} of {list.length} unlocked
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sorted.map((a) => (
            <div key={a.id} className={cn("rounded-xl border-2 p-3", a.unlocked ? "border-gold bg-gold/10" : "border-border")}>
              <div className="flex items-center gap-2">
                {a.unlocked && <Check className="h-4 w-4 shrink-0 text-gold" />}
                <span className="font-bold">{a.title}</span>
              </div>
              <div className="text-sm text-muted">{a.description}</div>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar value={a.value / a.target} className="h-2" color={a.unlocked ? "var(--gold)" : "var(--blue)"} />
                <span className="shrink-0 text-xs font-bold text-muted">
                  {a.value.toLocaleString("en-US")}/{a.target.toLocaleString("en-US")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
