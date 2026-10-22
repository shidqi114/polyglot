"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, House, Repeat, Search, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "./ui";
import { StatsPanel, TopStats } from "./stats-panel";
import { dueCount, useProgress } from "@/store/progress";

const NAV = [
  { href: "/", label: "Learn", icon: House },
  { href: "/review", label: "Review", icon: Repeat },
  { href: "/practice", label: "Practice", icon: Dumbbell },
  { href: "/dictionary", label: "Dictionary", icon: Search },
  { href: "/profile", label: "Profile", icon: User },
];

function useDue() {
  return useProgress((s) => dueCount(s.cards));
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Sidebar() {
  const pathname = usePathname();
  const due = useDue();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r-2 border-border px-4 py-6 lg:flex xl:w-64">
      <Link href="/" className="mb-8 flex items-center gap-2 px-3">
        <span className="jp flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl font-black text-white">語</span>
        <span className="text-2xl font-black tracking-tight text-primary">polyglot</span>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide",
                active ? "border-blue/60 bg-blue-soft text-blue" : "border-transparent text-muted hover:bg-surface-2",
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={2.5} />
              <span className="flex-1">{label}</span>
              {href === "/review" && due > 0 && (
                <span className="rounded-full bg-red px-2 py-0.5 text-xs text-white">{due > 99 ? "99+" : due}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-3 text-xs text-muted">
        <Link href="/credits" className="hover:underline">
          Credits & licenses
        </Link>
      </div>
    </aside>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const due = useDue();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 border-border bg-bg lg:hidden">
      <div className="mx-auto flex max-w-lg justify-around">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn("relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold", active ? "text-blue" : "text-muted")}
            >
              <span className={cn("rounded-xl border-2 px-3 py-1", active ? "border-blue/60 bg-blue-soft" : "border-transparent")}>
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </span>
              {label}
              {href === "/review" && due > 0 && (
                <span className="absolute right-[18%] top-1 min-w-5 rounded-full bg-red px-1 text-center text-[10px] leading-5 text-white">
                  {due > 99 ? "99+" : due}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileHeader() {
  return (
    <header className="pt-safe sticky top-0 z-30 border-b-2 border-border bg-bg lg:hidden">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="jp flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-base font-black text-white">語</span>
          <span className="text-lg font-black text-primary">polyglot</span>
        </Link>
        <TopStats />
      </div>
    </header>
  );
}

export function AppShell({ children, aside = true }: { children: ReactNode; aside?: boolean }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileHeader />
        <div className="mx-auto flex max-w-5xl justify-center gap-10 px-4 pb-28 pt-4 sm:px-6 lg:pb-10 lg:pt-8">
          <main className="w-full min-w-0 max-w-xl">{children}</main>
          {aside && (
            <div className="sticky top-8 hidden h-fit w-80 shrink-0 xl:block">
              <StatsPanel />
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
