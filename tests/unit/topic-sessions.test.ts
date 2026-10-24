import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pathPointer } from "@/lib/course-progress";
import { hiddenSentences, hideSentence } from "@/lib/hidden-sentences";
import { buildItemLesson } from "@/lib/lesson-engine";
import { learnPlan, particlesPlan, phrasesPlan, practisePlan, realPlan, setItems, topicStudySet, typeStudySet, WORD_TYPE_SETS } from "@/lib/topic-sessions";
import { TOPIC_BY_ID, TOPICS } from "@/content/topics";
import { TOPIC_WORDS } from "@/content/topic-words";
import { setFor } from "@/content/practice-sets";
import { useProgress } from "@/store/progress";
import type { StudyItem } from "@/lib/types";

/** Gives the store a learned set of words, as finished lessons would. */
function learn(ids: readonly string[]) {
  const cards = Object.fromEntries(ids.map((id) => [id, { due: Date.now(), stability: 1, difficulty: 5, reps: 1, lapses: 0, state: 2, up: Date.now() }]));
  useProgress.setState({ cards } as never);
}

beforeEach(() => {
  useProgress.getState().reset(null);
});

describe("topic word sets", () => {
  it("lists a topic's words in course order, N5 before N4", async () => {
    const items = await setItems(topicStudySet(TOPIC_BY_ID["shopping"]));
    expect(items.map((i) => i.id)).toEqual(TOPIC_WORDS["shopping"].filter((id) => items.some((i) => i.id === id)));
    expect(items.length).toBe(TOPIC_WORDS["shopping"].length);
    const firstN4 = items.findIndex((i) => i.level === "n4");
    if (firstN4 >= 0) expect(items.slice(firstN4).some((i) => i.level === "n5")).toBe(false);
  });

  it("lists the words of a word type", async () => {
    const nouns = await setItems(typeStudySet("type-noun")!);
    expect(nouns.length).toBeGreaterThan(300);
    expect(nouns.every((i: StudyItem) => i.kind === "vocab")).toBe(true);
  });

  it("covers every word type group in the URL lookup", () => {
    for (const g of WORD_TYPE_SETS) expect(setFor(g.id)?.id, g.id).toBe(g.id);
    for (const t of TOPICS) expect(setFor(t.id)?.id, t.id).toBe(t.id);
    expect(setFor("particles")?.id).toBe("particles");
    expect(setFor("particles-wa-ga")?.id).toBe("particles-wa-ga");
    expect(setFor("particles-nope")).toBeUndefined();
    expect(setFor("not-a-set")).toBeUndefined();
  });
});

describe("learn", () => {
  it("takes the next six words the learner has not met, and records a lesson with the topic's id", async () => {
    const plan = await learnPlan(topicStudySet(TOPIC_BY_ID["shopping"]));
    expect(plan.lesson?.id).toBe("t-shopping");
    expect(plan.lesson?.items.map((i) => i.id)).toEqual(TOPIC_WORDS["shopping"].slice(0, 6));
    expect(plan.exercises.length).toBeGreaterThan(6);
  });

  it("skips the words already met, and says so when all of them are met", async () => {
    learn(TOPIC_WORDS["shopping"].slice(0, 6));
    const plan = await learnPlan(topicStudySet(TOPIC_BY_ID["shopping"]));
    expect(plan.lesson?.items.map((i) => i.id)).toEqual(TOPIC_WORDS["shopping"].slice(6, 12));
    learn(TOPIC_WORDS["shopping"]);
    const done = await learnPlan(topicStudySet(TOPIC_BY_ID["shopping"]));
    expect(done.exercises).toEqual([]);
    expect(done.message).toMatch(/met every word/);
  });

  it("does not show intro cards for known words, but keeps their questions", async () => {
    const items = await setItems(topicStudySet(TOPIC_BY_ID["shopping"]));
    const known = new Set(items.slice(0, 2).map((i) => i.id));
    const exercises = buildItemLesson(items.slice(0, 4), items, () => 0.5, known);
    const intros = exercises.filter((e) => e.type === "intro").map((e) => (e.type === "intro" ? e.item.id : ""));
    expect(intros).toEqual(items.slice(0, 4).map((i) => i.id).filter((id) => !known.has(id)));
    expect(exercises.length).toBeGreaterThan(intros.length);
  });
});

describe("practise", () => {
  it("needs a few learned words before it starts", async () => {
    const plan = await practisePlan(topicStudySet(TOPIC_BY_ID["shopping"]));
    expect(plan.exercises).toEqual([]);
    expect(plan.message).toMatch(/Learn a few words/);
  });

  it("gives fifteen questions on the learned words", async () => {
    learn(TOPIC_WORDS["shopping"].slice(0, 8));
    const plan = await practisePlan(topicStudySet(TOPIC_BY_ID["shopping"]));
    expect(plan.exercises).toHaveLength(8);
    learn(TOPIC_WORDS["shopping"]);
    expect((await practisePlan(topicStudySet(TOPIC_BY_ID["shopping"]))).exercises).toHaveLength(15);
  });
});

describe("key phrases", () => {
  it("hears and builds every phrase, each with its own choices", () => {
    const topic = TOPIC_BY_ID["shopping"];
    const plan = phrasesPlan(topic);
    expect(plan.exercises).toHaveLength(topic.phrases.length * 2);
    const listens = plan.exercises.filter((e) => e.type === "choice");
    for (const ex of listens) {
      if (ex.type !== "choice") continue;
      expect(ex.options.filter((o) => o.correct)).toHaveLength(1);
      expect(ex.options).toHaveLength(4);
    }
  });
});

describe("real-life sentences and particles without the study packs", () => {
  // Offline in the test runner, the packs cannot be fetched: the sessions say so, or fall back to the grammar sentences.
  beforeEach(() => vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 404 }))));
  afterEach(() => vi.unstubAllGlobals());

  it("says the sentences need the study content when the packs are missing", async () => {
    const plan = await realPlan(TOPIC_BY_ID["eating-out"]);
    expect(plan.exercises).toEqual([]);
    expect(plan.message).toMatch(/Save it for offline/);
  });

  it("falls back to the hand-written grammar sentences for particle drills", async () => {
    const plan = await particlesPlan();
    expect(plan.exercises).toHaveLength(15);
    for (const ex of plan.exercises) expect(ex.type).toBe("choice");
  });

  it("keeps a family's drill to that family's particles", async () => {
    const plan = await particlesPlan("wo");
    for (const ex of plan.exercises) {
      if (ex.type !== "choice") continue;
      expect(ex.answer).toBe("を");
    }
  });
});

describe("hidden sentences", () => {
  it("is empty when there is no window (the server render)", () => {
    expect(hiddenSentences().size).toBe(0);
  });

  it("keeps hidden sentences on this device, once each", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) } });
    hideSentence("ここにあります。");
    hideSentence("ここにあります。");
    hideSentence("大丈夫です。");
    expect([...hiddenSentences()]).toEqual(["ここにあります。", "大丈夫です。"]);
    vi.unstubAllGlobals();
  });

  it("ignores stored values that are not a list of sentences", () => {
    vi.stubGlobal("window", { localStorage: { getItem: () => '{"a":1}', setItem: () => undefined } });
    expect(hiddenSentences().size).toBe(0);
    vi.unstubAllGlobals();
  });
});

describe("path progress and study lessons", () => {
  it("ignores study lessons (t- ids) when it works out where the learner is on the path", () => {
    const base = pathPointer({});
    const withStudy = pathPointer({ "t-shopping": { done: Date.now(), best: 1, times: 1, up: Date.now() } as never });
    expect(withStudy.currentId).toBe(base.currentId);
    expect(withStudy.furthest).toBe(base.furthest);
  });
});
