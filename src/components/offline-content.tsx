"use client";

import { Check, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, ProgressBar } from "./ui";
import { levelFiles, PACK_CACHE, sharedFiles } from "@/content/packs";
import type { Level } from "@/lib/types";

const LEVELS: Level[] = ["n5", "n4", "n3", "n2", "n1"];

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function cachedAll(urls: string[]): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  const store = await caches.open(PACK_CACHE);
  const hits = await Promise.all(urls.map((u) => store.match(u)));
  return hits.every(Boolean);
}

export function OfflineContent() {
  const [status, setStatus] = useState<Record<Level, boolean>>({ n5: false, n4: false, n3: false, n2: false, n1: false });
  const [busy, setBusy] = useState<Level | "all" | null>(null);
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    const next = {} as Record<Level, boolean>;
    for (const level of LEVELS) next[level] = await cachedAll(levelFiles(level));
    setStatus(next);
    const estimate = await navigator.storage?.estimate?.();
    if (estimate?.usage !== undefined && estimate.quota) setUsage({ used: estimate.usage, quota: estimate.quota });
  };

  useEffect(() => {
    void refresh();
  }, []);

  const download = async (levels: Level[]) => {
    setBusy(levels.length === 1 ? levels[0] : "all");
    setMessage(null);
    try {
      // Ask the browser to keep this data rather than evict it under storage pressure (iOS and desktop).
      await navigator.storage?.persist?.();
      const urls = [...sharedFiles(), ...levels.flatMap(levelFiles)];
      for (const url of urls) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Download failed (${res.status}).`);
        await res.arrayBuffer(); // reading the body makes sure the whole file is stored
      }
      setMessage("Saved. These lessons now work offline.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Download failed. Check your connection and try again.");
    } finally {
      setBusy(null);
      void refresh();
    }
  };

  return (
    <Card>
      <div className="mb-1 font-extrabold">Offline study content</div>
      <p className="mb-3 text-sm text-muted">
        Example sentences, pitch accent, verb forms and kanji strokes. Download a level to use it without a connection.
      </p>
      <div className="grid grid-cols-5 gap-2">
        {LEVELS.map((level) => (
          <Button
            key={level}
            variant={status[level] ? "secondary" : "blue"}
            className="min-h-10 px-1 text-xs"
            disabled={busy !== null}
            onClick={() => void download([level])}
            aria-label={`Download ${level.toUpperCase()}`}
          >
            {status[level] ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {level.toUpperCase()}
          </Button>
        ))}
      </div>
      <Button variant="secondary" className="mt-3 w-full" disabled={busy !== null} onClick={() => void download(LEVELS)}>
        {busy === "all" ? "Downloading…" : "Download everything"}
      </Button>
      {usage && (
        <div className="mt-3">
          <ProgressBar value={usage.used / usage.quota} className="h-2" />
          <div className="mt-1 text-xs text-muted">
            {mb(usage.used)} used by this app of about {mb(usage.quota)} available in this browser
          </div>
        </div>
      )}
      {message && <p className="mt-2 text-sm text-muted">{message}</p>}
    </Card>
  );
}
