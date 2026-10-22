"use client";

import Link from "next/link";
import { BookOpen, Cloud, Flame, Repeat, Target, Zap } from "lucide-react";
import { Button, Card, cn, ProgressBar } from "./ui";
import { dayKey } from "@/lib/dates";
import { firebaseConfigured, signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/lib/sync";
import { dueCount, streakOf, totalXp, useProgress } from "@/store/progress";

export function TopStats({ className }: { className?: string }) {
  const days = useProgress((s) => s.days);
  const goal = useProgress((s) => s.settings.dailyGoal);
  const streak = streakOf(days);
  const today = days[dayKey()]?.xp ?? 0;
  const xp = totalXp(days);
  return (
    <div className={cn("flex items-center gap-4 text-sm font-extrabold", className)}>
      <span className={cn("flex items-center gap-1", today > 0 ? "text-orange" : "text-muted")} title="Day streak">
        <Flame className="h-5 w-5" fill="currentColor" strokeWidth={2} />
        {streak.current}
      </span>
      <span className={cn("flex items-center gap-1", today >= goal ? "text-gold" : "text-muted")} title="XP today / goal">
        <Zap className="h-5 w-5" fill="currentColor" strokeWidth={2} />
        {today}/{goal}
      </span>
      <span className="flex items-center gap-1 text-blue" title="Total XP">
        <BookOpen className="h-5 w-5" strokeWidth={2.5} />
        {xp}
      </span>
    </div>
  );
}

export function DailyGoalCard() {
  const today = useProgress((s) => s.days[dayKey()]?.xp ?? 0);
  const goal = useProgress((s) => s.settings.dailyGoal);
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2 font-extrabold">
        <Target className="h-5 w-5 text-gold" />
        Daily goal
      </div>
      <div className="flex items-center gap-3">
        <ProgressBar value={today / goal} color="var(--gold)" />
        <span className="shrink-0 text-sm font-bold text-muted">
          {today}/{goal} XP
        </span>
      </div>
    </Card>
  );
}

export function ReviewCard() {
  const due = useProgress((s) => dueCount(s.cards));
  const learned = useProgress((s) => Object.keys(s.cards).length);
  return (
    <Card>
      <div className="mb-1 flex items-center gap-2 font-extrabold">
        <Repeat className="h-5 w-5 text-purple" />
        Reviews
      </div>
      <p className="mb-3 text-sm text-muted">
        {due > 0 ? `${due} item${due === 1 ? "" : "s"} ready to review.` : learned ? "All caught up!" : "Finish a lesson to start reviewing."}
      </p>
      {due > 0 && (
        <Link href="/review">
          <Button variant="blue" className="w-full">
            Review now
          </Button>
        </Link>
      )}
    </Card>
  );
}

function SyncCard() {
  const { user, ready } = useAuth();
  if (!firebaseConfigured || !ready || user) return null;
  return (
    <Card>
      <div className="mb-1 flex items-center gap-2 font-extrabold">
        <Cloud className="h-5 w-5 text-blue" />
        Save your progress
      </div>
      <p className="mb-3 text-sm text-muted">Sign in to sync between your iPhone and computer.</p>
      <Button variant="primary" className="w-full" onClick={() => void signInWithGoogle()}>
        Sign in with Google
      </Button>
    </Card>
  );
}

export function StatsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <TopStats className="justify-around py-2" />
      <SyncCard />
      <DailyGoalCard />
      <ReviewCard />
    </div>
  );
}
