"use client";

import { useEffect, useState, type ReactNode } from "react";
import { startSync } from "@/lib/sync";
import { useProgress } from "@/store/progress";

/** Runs before paint to avoid a light/dark flash. Kept tiny and dependency-free. */
export const THEME_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem('polyglot-progress')||'{}');var t=(s.state&&s.state.settings&&s.state.settings.theme)||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

function ThemeSync() {
  const theme = useProgress((s) => s.settings.theme);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#131f24" : "#ffffff");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    startSync();
  }, []);
  // Progress lives in localStorage, so the UI renders only on the client.
  if (!mounted)
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="jp animate-pulse text-5xl font-bold text-primary">あ</span>
      </div>
    );
  return (
    <>
      <ThemeSync />
      {children}
    </>
  );
}
