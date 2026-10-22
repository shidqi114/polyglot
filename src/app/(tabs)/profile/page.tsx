"use client";

import Link from "next/link";
import { Cloud, CloudOff, Download, Flame, LogOut, RefreshCw, Trophy, Upload, Zap } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Button, Card, cn, Toggle } from "@/components/ui";
import { addDays, dayKey } from "@/lib/dates";
import { parseBackup } from "@/lib/backup";
import { AchievementsCard } from "@/components/achievements";
import { OfflineContent } from "@/components/offline-content";
import { firebaseConfigured, signInWithGoogle, signOut } from "@/lib/firebase";
import { deleteAccount, deleteCloudData, syncNow, useAuth } from "@/lib/sync";
import { streakOf, totalXp, useProgress, type Settings } from "@/store/progress";

function StatTile({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-border p-3">
      {icon}
      <div>
        <div className="text-xl font-black leading-tight">{value}</div>
        <div className="text-xs font-bold text-muted">{label}</div>
      </div>
    </div>
  );
}

function Activity() {
  const days = useProgress((s) => s.days);
  const weeks = 17;
  const today = dayKey();
  const todayDow = new Date().getDay();
  const start = addDays(today, -(weeks - 1) * 7 - todayDow);
  const cells: { key: string; xp: number; future: boolean }[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const key = addDays(start, i);
    cells.push({ key, xp: days[key]?.xp ?? 0, future: key > today });
  }
  const level = (xp: number) => (xp === 0 ? 0 : xp < 10 ? 1 : xp < 30 ? 2 : xp < 60 ? 3 : 4);
  const colors = ["var(--locked)", "#c4f09e", "#89e219", "#58cc02", "#3f8f00"];
  return (
    <div className="overflow-x-auto">
      <div className="grid w-max grid-flow-col grid-rows-7 gap-1">
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.key}: ${c.xp} XP`}
            className={cn("h-3.5 w-3.5 rounded-[3px]", c.future && "opacity-0")}
            style={{ background: colors[level(c.xp)] }}
          />
        ))}
      </div>
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-xl border-2 border-border p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-lg px-2 py-1.5 text-sm font-extrabold",
            value === o.value ? "bg-blue-soft text-blue" : "text-muted hover:bg-surface-2",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-bold">{title}</div>
        {hint && <div className="text-sm text-muted">{hint}</div>}
      </div>
      <div className="sm:w-64 sm:shrink-0">{children}</div>
    </div>
  );
}

function AccountCard() {
  const { user, status, lastSync } = useAuth();
  const [error, setError] = useState<string | null>(null);
  if (!firebaseConfigured)
    return (
      <Card>
        <div className="mb-1 flex items-center gap-2 font-extrabold">
          <CloudOff className="h-5 w-5 text-muted" /> Cloud sync not configured
        </div>
        <p className="text-sm text-muted">
          Progress is saved on this device. Add your Firebase keys (see <code>docs/SETUP.md</code>) to sync across devices.
        </p>
      </Card>
    );
  if (!user)
    return (
      <Card>
        <div className="mb-1 flex items-center gap-2 font-extrabold">
          <Cloud className="h-5 w-5 text-blue" /> Guest
        </div>
        <p className="mb-3 text-sm text-muted">Sign in to back up your progress and sync it between your iPhone and computer. Your guest progress will be kept.</p>
        <Button
          className="w-full"
          onClick={() => signInWithGoogle().catch((e) => setError(e instanceof Error ? e.message : String(e)))}
        >
          Sign in with Google
        </Button>
        {error && <p className="mt-2 text-sm text-red">{error}</p>}
      </Card>
    );
  const statusText: Record<string, string> = {
    idle: lastSync ? `Synced ${new Date(lastSync).toLocaleTimeString()}` : "Synced",
    syncing: "Syncing…",
    offline: "Offline — will sync when you’re back online",
    error: "Sync error — will retry",
    off: "",
  };
  return (
    <Card>
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-14 w-14 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue text-2xl font-black text-white">
            {(user.displayName ?? user.email ?? "?")[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-black">{user.displayName ?? "Learner"}</div>
          <div className="truncate text-sm text-muted">{user.email}</div>
          <div className={cn("text-xs font-bold", status === "error" ? "text-red" : "text-muted")}>{statusText[status]}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => void syncNow()}>
          <RefreshCw className={cn("h-4 w-4", status === "syncing" && "animate-spin")} /> Sync
        </Button>
        <Button variant="secondary" onClick={() => void signOut()}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </Card>
  );
}

function DataCard() {
  const signedIn = useAuth((s) => !!s.user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportData = () => {
    const s = useProgress.getState();
    const data = { app: "polyglot", version: 1, exportedAt: new Date().toISOString(), lessons: s.lessons, cards: s.cards, days: s.days, notes: s.notes, settings: s.settings };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `polyglot-backup-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const backup = parseBackup(await file.text());
      useProgress.getState().setData({
        lessons: backup.lessons,
        cards: backup.cards,
        days: backup.days,
        ...(backup.notes ? { notes: backup.notes } : {}),
        settings: { ...useProgress.getState().settings, ...backup.settings },
      });
      setMsg("Backup restored.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Import failed");
    }
  };

  return (
    <Card>
      <div className="mb-3 font-extrabold">Your data</div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={exportData}>
          <Download className="h-4 w-4" /> Export
        </Button>
        <Button variant="secondary" disabled={signedIn} onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" /> Import
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importData(f);
          e.target.value = "";
        }}
      />
      {signedIn && <p className="mt-2 text-xs text-muted">Sign out to import a backup into guest mode.</p>}
      {!signedIn && (
        <button
          className="mt-4 text-sm font-bold text-red hover:underline"
          onClick={() => {
            if (confirm("Reset all progress on this device? This can’t be undone.")) useProgress.getState().reset(null);
          }}
        >
          Reset progress
        </button>
      )}
      {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
    </Card>
  );
}

function DangerZone() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  // Keep the message visible after sign-out, which is what deleting cloud data causes.
  if (!user && !msg) return null;

  const run = async (task: () => Promise<void>, done: string) => {
    setBusy(true);
    try {
      await task();
      setMsg(done);
    } catch (e) {
      const code = (e as { code?: string }).code;
      setMsg(
        code === "auth/requires-recent-login"
          ? "For security, sign out, sign in with Google again, then delete the account."
          : e instanceof Error
            ? e.message
            : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="mb-1 font-extrabold text-red">Danger zone</div>
      <p className="mb-3 text-sm text-muted">Removes your progress from the cloud and clears it from this device.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          variant="secondary"
          disabled={busy || !user}
          onClick={() => {
            if (confirm("Delete all cloud progress? This device will be signed out and its progress cleared.")) {
              void run(deleteCloudData, "Cloud progress deleted. This device was signed out.");
            }
          }}
        >
          Delete cloud data
        </Button>
        <Button
          variant="danger"
          disabled={busy || !user}
          onClick={() => {
            if (confirm("Delete your account and all its data? This cannot be undone.")) {
              void run(deleteAccount, "Account deleted.");
            }
          }}
        >
          Delete account
        </Button>
      </div>
      {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
    </Card>
  );
}

export default function ProfilePage() {
  const days = useProgress((s) => s.days);
  const lessons = useProgress((s) => s.lessons);
  const cards = useProgress((s) => s.cards);
  const settings = useProgress((s) => s.settings);
  const update = useProgress((s) => s.updateSettings);
  const streak = streakOf(days);
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => update({ [k]: v } as Partial<Settings>);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-black">Profile</h1>
      <AccountCard />

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={<Flame className="h-7 w-7 text-orange" fill="currentColor" />} value={streak.current} label="Day streak" />
        <StatTile icon={<Trophy className="h-7 w-7 text-gold" fill="currentColor" />} value={streak.best} label="Best streak" />
        <StatTile icon={<Zap className="h-7 w-7 text-gold" fill="currentColor" />} value={totalXp(days)} label="Total XP" />
        <StatTile
          icon={<span className="jp text-2xl font-black text-blue">語</span>}
          value={Object.keys(cards).length}
          label={`Items learned · ${Object.keys(lessons).length} lessons`}
        />
      </div>

      <Card>
        <div className="mb-3 font-extrabold">Activity</div>
        <Activity />
      </Card>

      <Link
        href="/weekly"
        className="btn-3d flex items-center justify-between rounded-2xl border-2 border-border bg-surface p-4 hover:bg-surface-2"
      >
        <div>
          <div className="font-extrabold">Weekly review</div>
          <div className="text-sm text-muted">Your week, leeches, mix-ups and next steps</div>
        </div>
        <span className="text-sm font-extrabold uppercase text-blue">Open</span>
      </Link>

      <AchievementsCard />

      <Card className="divide-y-2 divide-border py-1">
        <Row title="Daily goal" hint="XP per day">
          <Segmented
            value={settings.dailyGoal}
            onChange={set("dailyGoal")}
            options={[10, 20, 30, 50].map((v) => ({ value: v, label: String(v) }))}
          />
        </Row>
        <Row title="Theme">
          <Segmented
            value={settings.theme}
            onChange={set("theme")}
            options={[
              { value: "system", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Row>
        <Row title="Speech speed">
          <Segmented
            value={settings.ttsRate}
            onChange={set("ttsRate")}
            options={[
              { value: 0.7, label: "Slow" },
              { value: 0.9, label: "Normal" },
              { value: 1.1, label: "Fast" },
            ]}
          />
        </Row>
        <Row title="Sound effects">
          <div className="flex sm:justify-end">
            <Toggle checked={settings.sound} onChange={set("sound")} label="Sound effects" />
          </div>
        </Row>
        <Row title="Auto-play audio" hint="Speak new words and listening prompts">
          <div className="flex sm:justify-end">
            <Toggle checked={settings.autoplayAudio} onChange={set("autoplayAudio")} label="Auto-play audio" />
          </div>
        </Row>
        <Row title="Show readings" hint="Kana hints under kanji answers">
          <div className="flex sm:justify-end">
            <Toggle checked={settings.showReadings} onChange={set("showReadings")} label="Show readings" />
          </div>
        </Row>
      </Card>

      <DangerZone />
      <DataCard />
      <OfflineContent />

      <p className="text-center text-sm text-muted">
        <Link href="/credits" className="underline">
          Credits & licenses
        </Link>
      </p>
    </div>
  );
}
