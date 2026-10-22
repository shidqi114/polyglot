"use client";

import { ArrowLeft, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { isRomaji, toHiragana } from "wanakana";
import { AudioButton, KanjiReadings } from "@/components/lesson/exercises";
import { GrammarReference } from "@/components/grammar-reference";
import { WordPanel } from "@/components/word/word-panel";
import { Card, cn } from "@/components/ui";
import { loadIndex } from "@/content/loader";
import { strengthBars } from "@/lib/srs";
import type { StudyItem } from "@/lib/types";
import { useProgress } from "@/store/progress";

type Tab = "words" | "grammar";

function DictionaryTabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div role="tablist" className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1">
      {(["words", "grammar"] as const).map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={tab === t}
          onClick={() => onChange(t)}
          className={cn(
            "rounded-xl py-2 text-sm font-extrabold uppercase",
            tab === t ? "bg-surface text-blue shadow-sm" : "text-muted",
          )}
        >
          {t === "words" ? "Words" : "Grammar"}
        </button>
      ))}
    </div>
  );
}

function search(items: StudyItem[], raw: string): StudyItem[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const kana = isRomaji(q) ? toHiragana(q) : toHiragana(q, { passRomaji: true });
  const scored: { item: StudyItem; score: number }[] = [];
  for (const item of items) {
    const reading = toHiragana(item.reading);
    const readings = [reading, ...(item.on ?? []), ...(item.kun ?? []).map((k) => k.replace(/[()]/g, ""))];
    let score = 0;
    if (item.front === raw.trim() || readings.includes(kana)) score = 100;
    else if (item.meanings.some((m) => m.toLowerCase() === q || m.toLowerCase() === `to ${q}`)) score = 90;
    else if (item.front.startsWith(raw.trim()) || readings.some((r) => r.startsWith(kana))) score = 60;
    else if (item.meanings.some((m) => new RegExp(`\\b${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(m.toLowerCase()))) score = 50;
    else if (item.front.includes(raw.trim())) score = 30;
    if (score) scored.push({ item, score: score + (item.kind === "vocab" ? 1 : 0) - item.front.length * 0.01 });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 60).map((s) => s.item);
}

function Strength({ id }: { id: string }) {
  const card = useProgress((s) => s.cards[id]);
  const bars = strengthBars(card);
  if (!card) return null;
  return (
    <span className="flex items-end gap-0.5" title="Memory strength">
      {[1, 2, 3].map((b) => (
        <span key={b} className={cn("w-1.5 rounded-sm", bars >= b ? "bg-primary" : "bg-locked")} style={{ height: 6 + b * 4 }} />
      ))}
    </span>
  );
}

function Detail({ item, all, onBack, onOpen }: { item: StudyItem; all: StudyItem[]; onBack: () => void; onOpen: (i: StudyItem) => void }) {
  const card = useProgress((s) => s.cards[item.id]);
  const kanjiParts = useMemo(
    () => (item.kind === "vocab" ? [...item.front].map((c) => all.find((i) => i.kind === "kanji" && i.front === c)).filter((x) => !!x) : []),
    [item, all],
  );
  const words = useMemo(
    () => (item.kind === "kanji" ? all.filter((i) => i.kind === "vocab" && i.front.includes(item.front)).slice(0, 10) : []),
    [item, all],
  );
  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="flex items-center gap-1 self-start text-sm font-extrabold uppercase text-blue">
        <ArrowLeft className="h-4 w-4" /> Results
      </button>
      <Card className="flex flex-col items-center gap-2 py-8 text-center">
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-extrabold uppercase text-muted">
          {item.kind === "kana" ? item.script : `${item.level?.toUpperCase()} ${item.kind === "kanji" ? "kanji" : "word"}`}
        </span>
        <div className="jp text-7xl font-bold">{item.front}</div>
        {item.kind === "vocab" && item.reading !== item.front && <div className="jp text-2xl text-muted">{item.reading}</div>}
        <div className="text-xl font-bold">{item.meanings.join(", ")}</div>
        <div className="mt-2 flex gap-3">
          <AudioButton text={item.reading} />
          <AudioButton text={item.reading} slow />
        </div>
        {item.kind === "kanji" && (
          <>
            <KanjiReadings item={item} />
            <div className="text-sm text-muted">{item.strokes} strokes</div>
          </>
        )}
        <div className="mt-2 text-sm text-muted">
          {card ? `In your reviews · next review ${new Date(card.due).toLocaleDateString()}` : "Not learned yet"}
        </div>
      </Card>
      <WordPanel item={item} />
      {kanjiParts.length > 0 && (
        <Card>
          <div className="mb-2 font-extrabold">Kanji in this word</div>
          <div className="flex flex-col gap-2">
            {kanjiParts.map((k) => (
              <button key={k.id} onClick={() => onOpen(k)} className="flex items-center gap-3 rounded-xl p-2 text-left hover:bg-surface-2">
                <span className="jp text-3xl font-bold">{k.front}</span>
                <span className="text-sm text-muted">{k.meanings.slice(0, 3).join(", ")}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      {words.length > 0 && (
        <Card>
          <div className="mb-2 font-extrabold">Words with {item.front}</div>
          <div className="flex flex-col gap-1">
            {words.map((w) => (
              <button key={w.id} onClick={() => onOpen(w)} className="flex items-baseline gap-3 rounded-xl p-2 text-left hover:bg-surface-2">
                <span className="jp text-xl font-bold">{w.front}</span>
                <span className="jp text-sm text-muted">{w.reading}</span>
                <span className="truncate text-sm">{w.meanings[0]}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function DictionaryPage() {
  const [all, setAll] = useState<StudyItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StudyItem | null>(null);
  const [tab, setTab] = useState<Tab>("words");
  const deferred = useDeferredValue(query);

  useEffect(() => {
    loadIndex()
      .then((idx) => setAll([...idx.values()].filter((i) => i.kind !== "kana")))
      .catch(() => setAll([]));
  }, []);

  const results = useMemo(() => (all ? search(all, deferred) : []), [all, deferred]);

  if (selected && all)
    return (
      <Detail
        item={selected}
        all={all}
        onBack={() => setSelected(null)}
        onOpen={(i) => {
          setSelected(i);
          window.scrollTo({ top: 0 });
        }}
      />
    );

  if (tab === "grammar")
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-black">Dictionary</h1>
        <DictionaryTabs tab={tab} onChange={setTab} />
        <GrammarReference />
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">Dictionary</h1>
      <DictionaryTabs tab={tab} onChange={setTab} />
      <label className="flex items-center gap-3 rounded-2xl border-2 border-border bg-surface-2 px-4 focus-within:border-blue">
        <Search className="h-5 w-5 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search English, romaji, kana or kanji"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="jp w-full bg-transparent py-3.5 text-lg outline-none"
        />
      </label>
      {!all && <p className="text-muted">Loading dictionary…</p>}
      {all && !query && (
        <p className="text-sm text-muted">
          {all.filter((i) => i.kind === "vocab").length.toLocaleString()} JLPT words and{" "}
          {all.filter((i) => i.kind === "kanji").length.toLocaleString()} kanji. Try “taberu”, “water” or “日”.
        </p>
      )}
      {all && query && results.length === 0 && <p className="text-muted">No results.</p>}
      <div className={cn("flex flex-col divide-y-2 divide-border overflow-hidden rounded-2xl border-2 border-border", !results.length && "hidden")}>
        {results.map((item) => (
          <button key={item.id} onClick={() => setSelected(item)} className="flex items-center gap-3 bg-surface px-4 py-3 text-left hover:bg-surface-2">
            <span className="jp min-w-12 text-2xl font-bold">{item.front}</span>
            <span className="min-w-0 flex-1">
              {item.kind === "vocab" && item.reading !== item.front && <span className="jp block text-sm text-muted">{item.reading}</span>}
              <span className="block truncate">{item.meanings.slice(0, 3).join(", ")}</span>
            </span>
            <Strength id={item.id} />
            <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-bold uppercase text-muted">{item.level}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
