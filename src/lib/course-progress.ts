import { ALL_LESSONS, LESSON_INDEX } from "@/content/course";
import type { LessonProgress } from "@/store/progress";

export type LessonStatus = "done" | "current" | "open" | "locked";

export function currentLessonId(lessons: Record<string, LessonProgress>): string | undefined {
  return ALL_LESSONS.find((l) => !lessons[l.id])?.id;
}

export function lessonStatus(id: string, lessons: Record<string, LessonProgress>, currentId: string | undefined): LessonStatus {
  if (lessons[id]) return "done";
  if (id === currentId) return "current";
  const idx = LESSON_INDEX.get(id) ?? 0;
  // Anything before the furthest completed lesson stays open (you may have jumped ahead).
  const prev = ALL_LESSONS[idx - 1];
  if (prev && lessons[prev.id]) return "open";
  return "locked";
}

export function nextLessonId(id: string): string | undefined {
  const idx = LESSON_INDEX.get(id);
  return idx == null ? undefined : ALL_LESSONS[idx + 1]?.id;
}
