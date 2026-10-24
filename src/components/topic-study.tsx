"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AudioButton } from "./lesson/exercises";
import { Button, Card, cn, ProgressBar } from "./ui";
import wordTypes from "@/content/generated/word-types.json";
import { levelFiles, PACK_CACHE } from "@/content/packs";
import { PARTICLE_FAMILIES } from "@/content/particles";
import { TOPICS, TOPIC_BY_ID, type TopicGroup } from "@/content/topics";
import { TOPIC_WORDS } from "@/content/topic-words";
import { strengthBars } from "@/lib/srs";
import { setItems, topicStudySet, typeStudySet, VOCAB_PER_LESSON, WORD_TYPE_SETS, type StudySet } from "@/lib/topic-sessions";
import type { Level, StudyItem } from "@/lib/types";
import { useProgress } from "@/store/progress";

const TYPES = wordTypes as Record<string, string>;
const GROUPS: TopicGroup[] = ["Me and my day", "Out and about", "Free time", "School, work and health"];

/** A card with a title, a line, and how many of its words the learner has met. */
function ProgressCard({ href, title, line, done, total }: { href: string; title: string; line: string; done: number; total: number }) {
  return (
    <Link href={href} className="btn-3d flex flex-col gap-2 rounded-2xl border-2 border-border bg-surface p-4 hover:bg-surface-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-extrabold">{title}</span>
        <span className="shrink-0 text-xs font-bold text-muted">
          {done} / {total}
        </span>
      </div>
      <span className="text-sm text-muted">{line}</span>
      <ProgressBar value={total ? done / total : 0} className="h-2" />
    </Link>
  );
}

export function TopicIndex() {
  const cards = useProgress((s) => s.cards);
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black">Study by topic</h1>
        <p className="text-muted">Pick a situation, or one kind of word. Learn the words, practise them, then read them in real sentences.</p>
      </div>

      {GROUPS.map((group) => (
        <section key={group} className="flex flex-col gap-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted">{group}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.filter((t) => t.group === group).map((t) => {
              const words = TOPIC_WORDS[t.id];
              return (
                <ProgressCard
                  key={t.id}
                  href={`/practice/topics?id=${t.id}`}
                  title={t.title}
                  line={t.blurb}
                  done={words.filter((id) => cards[id]).length}
                  total={words.length}
                />
              );
            })}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted">Word types</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORD_TYPE_SETS.map((g) => {
            const ids = Object.keys(TYPES).filter((id) => g.types.includes(TYPES[id]));
            return (
              <ProgressCard
                key={g.id}
                href={`/practice/topics?id=${g.id}`}
                title={g.title}
                line="Every N5 and N4 word of this kind"
                done={ids.filter((id) => cards[id]).length}
                total={ids.length}
              />
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted">Grammar in use</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/practice/topics?id=particles" className="btn-3d flex flex-col gap-1 rounded-2xl border-2 border-border bg-surface p-4 hover:bg-surface-2">
            <span className="font-extrabold">Particles</span>
            <span className="text-sm text-muted">Fill in は, が, を, に and the rest, in real sentences</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Saves the study packs for these levels, so the sentence sessions work offline. */
export function SaveOffline({ levels }: { levels: Level[] }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        disabled={state === "saving" || state === "saved"}
        onClick={async () => {
          setState("saving");
          try {
            const cache = await caches.open(PACK_CACHE);
            for (const level of levels) for (const url of levelFiles(level)) await cache.add(url);
            setState("saved");
          } catch {
            setState("failed");
          }
        }}
      >
        {state === "saved" ? "Saved for offline" : state === "saving" ? "Saving…" : "Save for offline"}
      </Button>
      {state === "failed" && <span className="text-sm text-red">Couldn’t save. Check the connection, then try again.</span>}
    </div>
  );
}

const grammarLessonId = (id: string) => (id.startsWith("g4-") ? `n4-${id}` : `n5-${id}`);

/** A topic (or word type): its progress, its study modes and its word list. */
export function StudySetView({ id }: { id: string }) {
  const router = useRouter();
  const cards = useProgress((s) => s.cards);
  const topic = TOPIC_BY_ID[id as keyof typeof TOPIC_BY_ID];
  const set: StudySet | undefined = topic ? topicStudySet(topic) : typeStudySet(id);
  const [items, setList] = useState<StudyItem[] | null>(null);
  const [level, setLevel] = useState<"both" | "n5" | "n4">("both");

  useEffect(() => {
    if (!set) return;
    let cancelled = false;
    setItems(set).then((list) => !cancelled && setList(list));
    return () => {
      cancelled = true;
    };
    // The set is rebuilt from the id on each render; the id is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!set)
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg font-bold">This topic is not here.</p>
        <Link href="/practice/topics" className="font-extrabold text-blue">
          Back to topics
        </Link>
      </div>
    );

  const all = items ?? [];
  const met = all.filter((i) => cards[i.id]);
  const unmet = all.filter((i) => !cards[i.id]);
  const shown = all.filter((i) => level === "both" || i.level === level);
  const phrasesReady = !!topic;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/practice/topics" className="text-sm font-extrabold text-blue">
          ← All topics
        </Link>
        <h1 className="text-2xl font-black">{set.title}</h1>
        <p className="text-muted">{topic ? topic.blurb : "Every N5 and N4 word of this kind. Learn them a few at a time."}</p>
        <div className="flex items-center gap-3">
          <ProgressBar value={all.length ? met.length / all.length : 0} className="h-3" />
          <span className="shrink-0 text-sm font-bold text-muted">
            {met.length} of {all.length} learned
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          disabled={!unmet.length}
          onClick={() => router.push(`/practice/run?set=${set.id}&mode=learn`)}
        >
          {unmet.length ? `Learn ${Math.min(VOCAB_PER_LESSON, unmet.length)} new words` : "Everything here is learned"}
        </Button>
        <Button variant="secondary" className="w-full" disabled={met.length < 4} onClick={() => router.push(`/practice/run?set=${set.id}&mode=practise`)}>
          Practise what I’ve learned
        </Button>
        {phrasesReady && (
          <Button variant="secondary" className="w-full" onClick={() => router.push(`/practice/run?set=${set.id}&mode=phrases`)}>
            Key phrases
          </Button>
        )}
        {phrasesReady && (
          <Button variant="secondary" className="w-full" onClick={() => router.push(`/practice/run?set=${set.id}&mode=real`)}>
            Real-life sentences
          </Button>
        )}
      </div>
      {phrasesReady && <SaveOffline levels={["n5", "n4"]} />}

      {topic && (
        <section className="flex flex-col gap-3">
          <h2 className="font-extrabold">Key phrases</h2>
          <div className="flex flex-col gap-2">
            {topic.phrases.map((p) => (
              <Card key={p.jp} className="flex items-center gap-3">
                <AudioButton text={p.kana} size="sm" />
                <div className="min-w-0">
                  <div className="jp font-bold">{p.jp}</div>
                  <div className="text-sm text-muted">{p.en}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {topic && (topic.grammar.length > 0 || topic.stories.length > 0) && (
        <section className="flex flex-col gap-3">
          <h2 className="font-extrabold">Grammar and story</h2>
          <div className="flex flex-wrap gap-2">
            {topic.grammar.map((g) => (
              <Link key={g} href={`/lesson?id=${grammarLessonId(g)}`} className="rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm font-bold hover:bg-surface-2">
                Grammar: {g.replace(/^g4?-/, "").replace(/-/g, " ")}
              </Link>
            ))}
            {topic.stories.map((s) => (
              <Link key={s} href={`/story?id=${s}`} className="rounded-xl border-2 border-border bg-surface px-3 py-2 text-sm font-bold hover:bg-surface-2">
                Story to read
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-extrabold">Words</h2>
          <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
            {(["both", "n5", "n4"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn("rounded-lg px-3 py-1 text-sm font-extrabold", level === l ? "bg-surface text-text shadow" : "text-muted")}
              >
                {l === "both" ? "N5 and N4" : l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {!items && <p className="text-muted">Loading words…</p>}
        <div className="flex flex-col divide-y-2 divide-border overflow-hidden rounded-2xl border-2 border-border bg-surface">
          {shown.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <AudioButton text={item.reading} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="jp font-bold">
                  {item.front}
                  {item.reading !== item.front && <span className="ml-2 text-sm font-semibold text-muted">{item.reading}</span>}
                </div>
                <div className="truncate text-sm text-muted">{item.meanings[0]}</div>
              </div>
              <span className="shrink-0 text-xs font-bold text-muted" title="Memory strength">
                {cards[item.id] ? (
                  <span className="flex gap-1">
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={cn("h-2.5 w-2.5 rounded-full", strengthBars(cards[item.id]) >= n ? "bg-primary" : "bg-locked")} />
                    ))}
                  </span>
                ) : (
                  "New"
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** The particle drills: all particles, or one family at a time. */
export function ParticlesView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/practice/topics" className="text-sm font-extrabold text-blue">
          ← All topics
        </Link>
        <h1 className="text-2xl font-black">Particles</h1>
        <p className="text-muted">
          Fill in the particle in a real sentence. The English under the blank says what it means. A wrong answer explains
          itself with a “Why?” note.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/practice/run?set=particles&mode=particles" className="btn-3d flex flex-col gap-1 rounded-2xl border-2 border-border bg-surface p-4 hover:bg-surface-2">
          <span className="font-extrabold">All particles</span>
          <span className="text-sm text-muted">Mixed, from every family</span>
        </Link>
        {PARTICLE_FAMILIES.map((f) => (
          <Link
            key={f.id}
            href={`/practice/run?set=particles-${f.id}&mode=particles`}
            className="btn-3d flex flex-col gap-1 rounded-2xl border-2 border-border bg-surface p-4 hover:bg-surface-2"
          >
            <span className="jp font-extrabold">{f.title}</span>
            <span className="text-sm text-muted">{f.particles.join("、")}</span>
          </Link>
        ))}
      </div>
      <SaveOffline levels={["n5", "n4"]} />
    </div>
  );
}
