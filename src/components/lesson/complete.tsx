"use client";

import { Clock, Target, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui";

function Stat({ label, value, color, icon }: { label: string; value: string; color: string; icon: ReactNode }) {
  return (
    <div className="flex-1 overflow-hidden rounded-2xl border-2" style={{ borderColor: color, background: color }}>
      <div className="py-1 text-center text-xs font-black uppercase text-white">{label}</div>
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-surface py-3 text-xl font-black" style={{ color }}>
        {icon}
        {value}
      </div>
    </div>
  );
}

export function CompleteScreen({
  title,
  subtitle,
  xp,
  accuracy,
  durationMs,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  subtitle?: string;
  xp: number;
  accuracy: number;
  durationMs: number;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const mins = Math.floor(durationMs / 60000);
  const secs = Math.round((durationMs % 60000) / 1000);
  return (
    <div className="pt-safe pb-safe flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="jp animate-pop mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gold text-6xl font-black text-white shadow-[0_8px_0_var(--gold-dark)]">
          {accuracy === 1 ? "満" : "◎"}
        </div>
        <h1 className="mb-2 text-3xl font-black text-gold">{title}</h1>
        {subtitle && <p className="mb-8 text-muted">{subtitle}</p>}
        <div className="flex w-full gap-3">
          <Stat label="Total XP" value={String(xp)} color="var(--gold)" icon={<Zap className="h-5 w-5" fill="currentColor" />} />
          <Stat
            label={accuracy === 1 ? "Perfect" : "Accuracy"}
            value={`${Math.round(accuracy * 100)}%`}
            color="var(--primary)"
            icon={<Target className="h-5 w-5" />}
          />
          <Stat label="Time" value={`${mins}:${String(secs).padStart(2, "0")}`} color="var(--blue)" icon={<Clock className="h-5 w-5" />} />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col gap-3 px-6 pb-6">
        <Button onClick={onPrimary} autoFocus>
          {primaryLabel}
        </Button>
        {secondaryLabel && onSecondary && (
          <Button variant="ghost" onClick={onSecondary}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
