import { describe, expect, it } from "vitest";
import { ALL_LESSONS } from "@/content/course";
import { lessonStatus, pathPointer } from "@/lib/course-progress";
import type { LessonProgress } from "@/store/progress";

const done = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, { times: 1 } as LessonProgress]));

describe("path pointer", () => {
  it("starts at the first lesson for a new account", () => {
    expect(pathPointer({}).currentId).toBe(ALL_LESSONS[0].id);
  });

  it("moves on to the first unfinished lesson after the last completed one", () => {
    const pointer = pathPointer(done(...ALL_LESSONS.slice(0, 5).map((l) => l.id)));
    expect(pointer.currentId).toBe(ALL_LESSONS[5].id);
    expect(pointer.furthest).toBe(4);
  });

  it("has no current lesson once the whole path is done", () => {
    expect(pathPointer(done(...ALL_LESSONS.map((l) => l.id))).currentId).toBeUndefined();
  });

  it("shows a lesson inserted into a passed unit as open, not as the next lesson", () => {
    const order = ["a", "x", "b", "c", "d", "e"]; // x was added to a unit already passed
    const lessons = done("a", "b", "c");
    const pointer = pathPointer(lessons, order);
    expect(pointer.currentId).toBe("d");
    expect(lessonStatus("a", lessons, pointer)).toBe("done");
    expect(lessonStatus("x", lessons, pointer)).toBe("open");
    expect(lessonStatus("d", lessons, pointer)).toBe("current");
    expect(lessonStatus("e", lessons, pointer)).toBe("locked");
  });

  it("falls back to the earliest gap when nothing after the last completed lesson is unfinished", () => {
    const order = ["a", "b", "c", "d"];
    const lessons = done("a", "c", "d");
    const pointer = pathPointer(lessons, order);
    expect(pointer.currentId).toBe("b");
    expect(lessonStatus("b", lessons, pointer)).toBe("current");
  });

  it("keeps lessons after the current one locked", () => {
    const order = ["a", "b", "c"];
    const lessons = done("a");
    expect(lessonStatus("c", lessons, pathPointer(lessons, order))).toBe("locked");
  });
});
