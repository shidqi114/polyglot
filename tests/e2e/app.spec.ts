import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { playKanaLesson, playLearnSession } from "./helpers";

const SHOTS = process.env.SCREENSHOT_DIR;

test.skip(!!process.env.SYNC_E2E, "sync run only");

async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${test.info().project.name}-${name}.png` });
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("knowledge packs are served with the security headers", async ({ request }) => {
  const res = await request.get("/packs/v2/n5/words.json");
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-security-policy"]).toBeTruthy();
  expect((await res.json()).length).toBeGreaterThan(500);
});

test("particle sentences are served with the packs and the security headers", async ({ request }) => {
  for (const level of ["n5", "n4"]) {
    const res = await request.get(`/packs/v2/${level}/sentences.json`);
    expect(res.ok()).toBe(true);
    expect(res.headers()["content-security-policy"]).toBeTruthy();
    const sentences = await res.json();
    expect(sentences.length).toBeGreaterThan(100);
  }
});

test("security headers are served on every page", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");
});

test("learning path renders and a kana lesson can be completed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Vowels \(current\)/ })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "path");

  await page.getByRole("button", { name: /Vowels \(current\)/ }).click();
  await page.getByRole("button", { name: /Start \+10 XP/ }).click();
  await expect(page.getByText("New character")).toBeVisible();
  await shot(page, "lesson-intro");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("option").first()).toBeVisible();
  await shot(page, "lesson-choice");

  await playKanaLesson(page);
  await expect(page.getByText("Lesson complete!")).toBeVisible();
  await shot(page, "lesson-complete");
  await page.getByRole("button", { name: "Continue" }).click();

  // Progress persisted: first lesson done, next one is current, XP counted.
  await expect(page.getByRole("button", { name: /Vowels \(done\)/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /K row \(current\)/ })).toBeVisible();
  await expect(page.getByTitle("Total XP").first()).toContainText(/1[05]/);

  await page.goto("/review");
  await expect(page.getByRole("main").getByText("All caught up!")).toBeVisible();
  await expect(page.getByText("Memory strength")).toBeVisible();
});

test("dictionary search finds words by English, romaji and kanji", async ({ page }) => {
  await page.goto("/dictionary");
  const box = page.getByPlaceholder("Search English, romaji, kana or kanji");
  await box.fill("water");
  await expect(page.getByRole("button", { name: /^水/ }).first()).toBeVisible();
  await box.fill("taberu");
  await expect(page.getByRole("button", { name: /食べる/ }).first()).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "dictionary");
  await page.getByRole("button", { name: /食べる/ }).first().click();
  await expect(page.getByText("Kanji in this word")).toBeVisible();
  // Word page 2.0: pitch accent and examples come from the study pack.
  await expect(page.getByText("Pitch accent")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Examples")).toBeVisible();
  // Personal note, saved on this device.
  await page.getByRole("button", { name: "Add note" }).click();
  await page.getByPlaceholder("A mnemonic").fill("eat: ta-be-ru");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("eat: ta-be-ru")).toBeVisible();
});

test("practice, profile and settings work on every screen size", async ({ page }) => {
  await page.goto("/practice");
  await expect(page.getByText("Practice dojo")).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "practice");
  await page.getByRole("link", { name: /Reverse pick/ }).click();
  await expect(page.getByTestId("option").first()).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.goto("/profile");
  await expect(page.getByRole("main").getByText("Daily goal", { exact: true })).toBeVisible();
  await expect(page.getByText("Offline study content")).toBeVisible();

  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expectNoHorizontalScroll(page);
  await shot(page, "profile-dark");
  await page.goto("/");
  await shot(page, "path-dark");
});

test("grammar lesson sentence builder", async ({ page }) => {
  await page.goto("/lesson?id=n5-g-desu");
  await expect(page.getByText("Grammar", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Write this in Japanese")).toBeVisible();
  for (const tile of ["わたし", "は", "学生", "です"]) await page.getByRole("button", { name: tile, exact: true }).last().click();
  await shot(page, "grammar-build");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.getByText(/Nice!|Great job!|Correct!|Awesome!|すごい！|Excellent!|いいね！/)).toBeVisible();
});

test("dictionary grammar reference lists N5 and N4 points and opens one", async ({ page }) => {
  await page.goto("/dictionary");
  await page.getByRole("tab", { name: "Grammar" }).click();
  await expect(page.getByText("JLPT N5 · 26 points")).toBeVisible();
  await expect(page.getByText("JLPT N4 · 16 points")).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "grammar-reference");
  await page.getByRole("button", { name: /〜てから — after doing/ }).click();
  await expect(page.getByText("Sample sentences")).toBeVisible();
  await expectNoHorizontalScroll(page);
  await page.getByRole("button", { name: "Grammar", exact: true }).click();
  await expect(page.getByText("JLPT N4 · 16 points")).toBeVisible();
});

test("a story plays from the practice page to its summary", async ({ page }) => {
  await page.goto("/practice");
  await page.getByRole("link", { name: /Stories/ }).click();
  await expect(page.getByRole("heading", { name: "Stories" })).toBeVisible();
  await page.getByRole("link", { name: /コンビニで/ }).click();
  await expect(page.getByRole("heading", { name: "コンビニで" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "story");

  const next = () => page.getByRole("button", { name: "Next", exact: true }).click();
  const cont = () => page.getByRole("button", { name: "Continue", exact: true }).click();
  await next(); // いらっしゃいませ。
  await next(); // お弁当は温めますか。
  await page.getByRole("button", { name: /はい、お願いします/ }).click();
  await cont();
  await next(); // 袋はいりますか。
  // A wrong first pick shows its feedback and can be retried, but it does not count as right first time.
  await page.getByRole("button", { name: /いいえ、いります/ }).click();
  await expect(page.getByText(/いります means/)).toBeVisible();
  await page.getByRole("button", { name: /いいえ、いりません/ }).click();
  await cont();
  await next(); // 合計は六百五十円です。
  await next(); // ありがとうございました。

  await page.getByRole("button", { name: "Wanted it warmed", exact: true }).click();
  await next();
  await page.getByRole("button", { name: "650 yen", exact: true }).click();
  await next();
  await expect(page.getByText("Replies right first time: 1 of 2")).toBeVisible();
  await expect(page.getByText("Questions right: 2 of 2")).toBeVisible();
});

test("the home screen shows today's plan and a culture note", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Word of the day")).toBeVisible();
  await expect(page.getByText(/^Culture · /)).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "today");
});

test("weekly review and achievements are reachable from profile", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByText(/\d+ of \d+ unlocked/)).toBeVisible();
  await page.getByRole("link", { name: /Weekly review/ }).click();
  await expect(page.getByRole("heading", { name: "Weekly review" })).toBeVisible();
  await expect(page.getByText("Next steps")).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "weekly");

  // A new account has no leeches, so the focus drill explains how to get some.
  await page.goto("/practice/run?set=leeches&mode=pick");
  await expect(page.getByText(/Learn a few more items/)).toBeVisible();
});

test("study by topic: learn a topic's first words, then see them counted", async ({ page }) => {
  await page.goto("/practice");
  await page.getByRole("link", { name: /Study by topic/ }).click();
  await expect(page.getByRole("heading", { name: "Study by topic" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "topics");

  await page.getByRole("link", { name: /Shopping/ }).first().click();
  await expect(page.getByRole("heading", { name: "Shopping" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "topic-shopping");

  await page.getByRole("button", { name: /Learn 6 new words/ }).click();
  await playLearnSession(page);
  await expect(page.getByText("Lesson complete!")).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();

  // The six words are now met, so the topic counts them, and Practise opens.
  await expect(page.getByText(/^6 of \d+ learned$/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Practise what I’ve learned" })).toBeEnabled();
});

test("real-life sentences and hiding a sentence work from the packs", async ({ page }) => {
  await page.goto("/practice/run?set=eating-out&mode=real");
  await expect(page.getByText("Fill in the blank")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("option").first()).toBeVisible();
  await expectNoHorizontalScroll(page);
  await shot(page, "real-sentence");

  await page.goto("/practice/run?set=particles&mode=particles");
  await expect(page.getByText("Which particle goes in the blank?")).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("option").first().click();
  await page.getByRole("button", { name: "Check", exact: true }).click();
  await page.getByRole("button", { name: "Hide this sentence" }).click();
  await expect(page.getByRole("button", { name: "Hidden" })).toBeVisible();
});

test("dictionary: the Show filter narrows the words to one topic, and search stays inside it", async ({ page }) => {
  await page.goto("/dictionary");
  await page.getByLabel("Show").selectOption("topic:shopping");
  await expect(page.getByText(/^Shopping: \d+ words/)).toBeVisible();
  await page.getByPlaceholder("Search English, romaji, kana or kanji").fill("wallet");
  await expect(page.getByRole("button", { name: /^財布/ }).first()).toBeVisible();
  await page.getByPlaceholder("Search English, romaji, kana or kanji").fill("water");
  await expect(page.getByText("No results.")).toBeVisible();
  await expectNoHorizontalScroll(page);

  // A word's page lists its topics; following one applies the same filter.
  await page.getByPlaceholder("Search English, romaji, kana or kanji").fill("wallet");
  await page.getByRole("button", { name: /^財布/ }).first().click();
  await page.getByRole("link", { name: "Shopping" }).click();
  await expect(page.getByText(/^Shopping: \d+ words/)).toBeVisible();
});

test("particle drill runs from the bundled grammar sentences when the study packs cannot load", async ({ page }) => {
  await page.route("**/packs/**", (route) => route.abort());
  await page.goto("/practice/topics?id=particles");
  await expect(page.getByRole("heading", { name: "Particles" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await page.getByRole("link", { name: /All particles/ }).click();
  await expect(page.getByText("Which particle goes in the blank?")).toBeVisible();
  await expect(page.getByTestId("option").first()).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("word types and topic pages open and fit the screen", async ({ page }) => {
  await page.goto("/practice/topics?id=type-noun");
  await expect(page.getByRole("heading", { name: "Nouns" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await page.goto("/practice/topics?id=travel-transport");
  await expect(page.getByRole("heading", { name: "Travel and transport" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Key phrases" })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

