"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ParticlesView, StudySetView, TopicIndex } from "@/components/topic-study";

function TopicsRoute() {
  const id = useSearchParams().get("id");
  if (!id) return <TopicIndex />;
  if (id === "particles") return <ParticlesView />;
  return <StudySetView id={id} />;
}

export default function TopicsPage() {
  return (
    <Suspense>
      <TopicsRoute />
    </Suspense>
  );
}
