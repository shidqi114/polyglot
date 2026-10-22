import { ALL_LESSONS, LESSON_INDEX } from "@/content/course";
import type { LessonProgress } from "@/store/progress";

export type LessonStatus = "done" | "current" | "open" | "locked";

export interface PathPointer {
  /** The lesson to do next, or undefined once the whole path is finished. */
  currentId: string | undefined;
  /** Position of the furthest completed lesson on the path, or -1 when none is done. */
  furthest: number;
  /** Position of every lesson on the path. */
  position: Map<string, number>;
}

/**
 * Where the learner is on the path. The next lesson is the first unfinished one after the furthest completed
 * lesson, so lessons added to units already passed show as open instead of pulling the learner back. Only when
 * nothing after that point is unfinished does it fall back to the earliest gap.
 */
export function pathPointer(
  lessons: Record<string, LessonProgress>,
  order: string[] = ALL_LESSONS.map((l) => l.id),
): PathPointer {
  let furthest = -1;
  order.forEach((id, i) => {
    if (lessons[id]) furthest = i;
  });
  const currentId = order.slice(furthest + 1).find((id) => !lessons[id]) ?? order.find((id) => !lessons[id]);
  return { currentId, furthest, position: new Map(order.map((id, i) => [id, i])) };
}

export function lessonStatus(id: string, lessons: Record<string, LessonProgress>, pointer: PathPointer): LessonStatus {
  if (lessons[id]) return "done";
  if (id === pointer.currentId) return "current";
  // Unfinished lessons before the furthest completed one stay open, since you may have jumped ahead.
  return (pointer.position.get(id) ?? Infinity) < pointer.furthest ? "open" : "locked";
}

export function nextLessonId(id: string): string | undefined {
  const idx = LESSON_INDEX.get(id);
  return idx == null ? undefined : ALL_LESSONS[idx + 1]?.id;
}
