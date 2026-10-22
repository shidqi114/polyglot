"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Suspense, useState } from "react";
import { StoryPlayer } from "@/components/story-player";
import { Card } from "@/components/ui";
import { STORIES, STORY_BY_ID, type Story } from "@/content/stories";

const LEVELS = [
  { level: "N5", stories: STORIES.filter((s) => s.level === "n5") },
  { level: "N4", stories: STORIES.filter((s) => s.level === "n4") },
];

function StoryList() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/practice" className="flex items-center gap-1 self-start text-sm font-extrabold uppercase text-blue">
        <ArrowLeft className="h-4 w-4" /> Practice
      </Link>
      <div>
        <h1 className="text-2xl font-black">Stories</h1>
        <p className="text-muted">Short conversations. Pick what to say, then answer questions about the story.</p>
      </div>
      {LEVELS.map(({ level, stories }) => (
        <section key={level} className="flex flex-col gap-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">JLPT {level}</h2>
          {stories.map((s) => (
            <Link key={s.id} href={`/story?id=${s.id}`} className="btn-3d flex flex-col rounded-2xl border-2 border-border bg-surface p-4 hover:bg-surface-2">
              <span className="jp text-xl font-bold">{s.title}</span>
              <span className="text-sm text-muted">{s.setting}</span>
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}

function StoryView({ story }: { story: Story }) {
  // Changing the key on replay starts the story from the beginning.
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col gap-6">
      <Link href="/story" className="flex items-center gap-1 self-start text-sm font-extrabold uppercase text-blue">
        <ArrowLeft className="h-4 w-4" /> All stories
      </Link>
      <StoryPlayer key={`${story.id}-${run}`} story={story} onReplay={() => setRun((r) => r + 1)} />
    </div>
  );
}

function StoryRoute() {
  const id = useSearchParams().get("id");
  const story = id ? STORY_BY_ID.get(id) : undefined;
  if (!id) return <StoryList />;
  if (!story)
    return (
      <Card className="flex flex-col items-center gap-3 p-6 text-center">
        <p className="font-bold">Story not found.</p>
        <Link href="/story" className="font-extrabold uppercase text-blue">
          All stories
        </Link>
      </Card>
    );
  return <StoryView story={story} />;
}

export default function StoryPage() {
  return (
    <Suspense>
      <StoryRoute />
    </Suspense>
  );
}
